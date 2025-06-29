// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {CCIPReceiver} from "@chainlink/contracts-ccip/contracts/applications/CCIPReceiver.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts/src/v0.8/shared/access/OwnerIsCreator.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_3_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import {VRFConsumerBaseV2} from "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import {VRFCoordinatorV2Interface} from "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ArbitrageCoordinatorAgent
 * @author CrossChainDefi Team
 * @notice AI Agent that orchestrates cross-chain arbitrage opportunities
 * @dev Uses CCIP for cross-chain coordination, Data Streams for real-time pricing, 
 *      Functions for ML computations, and Automation for execution timing
 */
contract ArbitrageCoordinatorAgent is 
    CCIPReceiver,
    FunctionsClient,
    AutomationCompatibleInterface,
    VRFConsumerBaseV2,
    OwnerIsCreator,
    ReentrancyGuard,
    Pausable,
    AccessControl
{
    // Override supportsInterface to resolve conflicts between CCIPReceiver and AccessControl
    function supportsInterface(bytes4 interfaceId) public view virtual override(CCIPReceiver, AccessControl) returns (bool) {
        return CCIPReceiver.supportsInterface(interfaceId) || AccessControl.supportsInterface(interfaceId);
    }
    using FunctionsRequest for FunctionsRequest.Request;

    // Role definitions
    bytes32 public constant HUB_ROLE = keccak256("HUB_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    bytes32 public constant STRATEGY_ROLE = keccak256("STRATEGY_ROLE");

    // Structs
    struct ArbitrageOpportunity {
        address tokenA;
        address tokenB;
        uint64 sourceChain;
        uint64 destinationChain;
        uint256 sourcePrice;
        uint256 destinationPrice;
        uint256 profitPercentage;
        uint256 maxAmount;
        uint256 timestamp;
        bool isActive;
    }

    struct ArbitrageExecution {
        bytes32 opportunityId;
        address executor;
        uint256 amount;
        uint256 expectedProfit;
        uint256 actualProfit;
        uint256 timestamp;
        ExecutionStatus status;
        bytes32 ccipMessageId;
    }

    struct PriceData {
        address token;
        uint64 chainSelector;
        uint256 price;
        uint256 timestamp;
        uint256 confidence;
        uint256 liquidityDepth;
    }

    struct MLPrediction {
        bytes32 requestId;
        address token;
        uint256 predictedPrice;
        uint256 confidence;
        uint256 timeHorizon;
        uint256 timestamp;
    }

    enum ExecutionStatus {
        PENDING,
        INITIATED,
        CROSS_CHAIN_SENT,
        COMPLETED,
        FAILED,
        CANCELLED
    }

    // Constants
    uint256 public constant MIN_PROFIT_THRESHOLD = 50; // 0.5% minimum profit
    uint256 public constant MAX_SLIPPAGE = 200; // 2% max slippage
    uint256 public constant EXECUTION_WINDOW = 300; // 5 minutes execution window
    uint256 public constant MIN_LIQUIDITY = 10000 * 1e18; // Minimum $10k liquidity
    uint256 public constant PRECISION = 1e18;

    // Chainlink configuration
    LinkTokenInterface public immutable linkToken;
    VRFCoordinatorV2Interface public immutable vrfCoordinator;
    uint256 public immutable subscriptionId;
    bytes32 public immutable keyHash;
    bytes32 public immutable donId;

    // State variables
    mapping(bytes32 => ArbitrageOpportunity) public opportunities;
    mapping(bytes32 => ArbitrageExecution) public executions;
    mapping(address => mapping(uint64 => PriceData)) public priceData;
    mapping(bytes32 => MLPrediction) public mlPredictions;
    mapping(address => bool) public supportedTokens;
    mapping(uint64 => bool) public supportedChains;
    mapping(bytes32 => bool) public activeOpportunities;

    address public hubContract;
    address public marketIntelligenceAgent;
    
    uint256 public totalArbitrageVolume;
    uint256 public totalProfitGenerated;
    uint256 public successfulExecutions;
    uint256 public failedExecutions;
    uint256 public lastMaintenanceTime;
    
    bytes32[] public opportunityIds;
    bytes32[] public executionIds;

    // Data Streams configuration
    struct DataStreamConfig {
        string feedId;
        bool isActive;
        uint256 heartbeat;
        uint256 deviation;
    }

    mapping(address => DataStreamConfig) public dataStreamConfigs;

    // Events
    event OpportunityDetected(
        bytes32 indexed opportunityId,
        address indexed tokenA,
        address indexed tokenB,
        uint64 sourceChain,
        uint64 destinationChain,
        uint256 profitPercentage
    );
    
    event ArbitrageExecuted(
        bytes32 indexed executionId,
        bytes32 indexed opportunityId,
        address indexed executor,
        uint256 amount,
        uint256 profit
    );
    
    event CrossChainArbitrageInitiated(
        bytes32 indexed executionId,
        bytes32 indexed ccipMessageId,
        uint64 destinationChain
    );
    
    event PriceDataUpdated(
        address indexed token,
        uint64 indexed chainSelector,
        uint256 price,
        uint256 confidence
    );
    
    event MLPredictionReceived(
        bytes32 indexed requestId,
        address indexed token,
        uint256 predictedPrice,
        uint256 confidence
    );
    
    event StrategyParametersUpdated(
        uint256 minProfitThreshold,
        uint256 maxSlippage,
        uint256 executionWindow
    );

    // Custom errors
    error OpportunityNotFound(bytes32 opportunityId);
    error InsufficientProfit(uint256 profit, uint256 threshold);
    error InsufficientLiquidity(uint256 available, uint256 required);
    error ExecutionWindowExpired(uint256 timestamp, uint256 deadline);
    error TokenNotSupported(address token);
    error ChainNotSupported(uint64 chainSelector);
    error UnauthorizedCaller(address caller);
    error InvalidPriceData(address token, uint256 price);

    modifier onlyHub() {
        if (!hasRole(HUB_ROLE, msg.sender)) revert UnauthorizedCaller(msg.sender);
        _;
    }

    modifier onlyExecutor() {
        if (!hasRole(EXECUTOR_ROLE, msg.sender)) revert UnauthorizedCaller(msg.sender);
        _;
    }

    modifier tokenSupported(address token) {
        if (!supportedTokens[token]) revert TokenNotSupported(token);
        _;
    }

    modifier chainSupported(uint64 chainSelector) {
        if (!supportedChains[chainSelector]) revert ChainNotSupported(chainSelector);
        _;
    }

    constructor(
        address _router,
        address _linkToken,
        address _functionsRouter,
        address _vrfCoordinator,
        uint256 _subscriptionId,
        bytes32 _keyHash,
        bytes32 _donId,
        address _hubContract
    )
        CCIPReceiver(_router)
        FunctionsClient(_functionsRouter)
        VRFConsumerBaseV2(_vrfCoordinator)
    {
        linkToken = LinkTokenInterface(_linkToken);
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
        donId = _donId;
        hubContract = _hubContract;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(HUB_ROLE, _hubContract);
        
        lastMaintenanceTime = block.timestamp;
    }

    /**
     * @notice Detect arbitrage opportunities using price data from multiple chains
     * @param tokenA First token in the pair
     * @param tokenB Second token in the pair
     * @param sourceChain Source chain selector
     * @param destinationChain Destination chain selector
     */
    function detectArbitrageOpportunity(
        address tokenA,
        address tokenB,
        uint64 sourceChain,
        uint64 destinationChain
    ) external tokenSupported(tokenA) tokenSupported(tokenB) chainSupported(sourceChain) chainSupported(destinationChain) returns (bytes32 opportunityId) {
        
        // Get price data for both chains
        PriceData memory sourcePriceA = priceData[tokenA][sourceChain];
        PriceData memory destPriceA = priceData[tokenA][destinationChain];
        PriceData memory sourcePriceB = priceData[tokenB][sourceChain];
        PriceData memory destPriceB = priceData[tokenB][destinationChain];

        // Validate price data freshness
        require(
            block.timestamp - sourcePriceA.timestamp <= 300 && 
            block.timestamp - destPriceA.timestamp <= 300,
            "Stale price data"
        );

        // Calculate arbitrage opportunity
        uint256 sourceRatio = (sourcePriceA.price * PRECISION) / sourcePriceB.price;
        uint256 destRatio = (destPriceA.price * PRECISION) / destPriceB.price;
        
        uint256 profitPercentage;
        if (sourceRatio > destRatio) {
            profitPercentage = ((sourceRatio - destRatio) * 10000) / destRatio; // in basis points
        } else {
            profitPercentage = ((destRatio - sourceRatio) * 10000) / sourceRatio;
        }

        // Check if profit meets minimum threshold
        if (profitPercentage < MIN_PROFIT_THRESHOLD) {
            revert InsufficientProfit(profitPercentage, MIN_PROFIT_THRESHOLD);
        }

        // Check liquidity requirements
        uint256 minLiquidity = sourcePriceA.liquidityDepth < destPriceA.liquidityDepth ? 
            sourcePriceA.liquidityDepth : destPriceA.liquidityDepth;
        
        if (minLiquidity < MIN_LIQUIDITY) {
            revert InsufficientLiquidity(minLiquidity, MIN_LIQUIDITY);
        }

        // Create opportunity
        opportunityId = keccak256(abi.encodePacked(
            tokenA, tokenB, sourceChain, destinationChain, block.timestamp
        ));

        opportunities[opportunityId] = ArbitrageOpportunity({
            tokenA: tokenA,
            tokenB: tokenB,
            sourceChain: sourceChain,
            destinationChain: destinationChain,
            sourcePrice: sourceRatio,
            destinationPrice: destRatio,
            profitPercentage: profitPercentage,
            maxAmount: minLiquidity / 2, // Conservative liquidity usage
            timestamp: block.timestamp,
            isActive: true
        });

        activeOpportunities[opportunityId] = true;
        opportunityIds.push(opportunityId);

        emit OpportunityDetected(
            opportunityId,
            tokenA,
            tokenB,
            sourceChain,
            destinationChain,
            profitPercentage
        );

        // Request ML prediction for optimal execution timing
        _requestMLPrediction(opportunityId, tokenA);
    }

    /**
     * @notice Execute arbitrage opportunity
     * @param opportunityId The ID of the opportunity to execute
     * @param amount The amount to arbitrage
     */
    function executeArbitrage(
        bytes32 opportunityId,
        uint256 amount
    ) external nonReentrant whenNotPaused onlyExecutor {
        ArbitrageOpportunity storage opportunity = opportunities[opportunityId];
        
        if (!opportunity.isActive) revert OpportunityNotFound(opportunityId);
        
        // Check execution window
        if (block.timestamp > opportunity.timestamp + EXECUTION_WINDOW) {
            revert ExecutionWindowExpired(block.timestamp, opportunity.timestamp + EXECUTION_WINDOW);
        }

        // Validate amount
        require(amount <= opportunity.maxAmount, "Amount exceeds maximum");
        require(amount > 0, "Amount must be greater than zero");

        // Calculate expected profit
        uint256 expectedProfit = (amount * opportunity.profitPercentage) / 10000;

        // Create execution record
        bytes32 executionId = keccak256(abi.encodePacked(
            opportunityId, msg.sender, amount, block.timestamp
        ));

        executions[executionId] = ArbitrageExecution({
            opportunityId: opportunityId,
            executor: msg.sender,
            amount: amount,
            expectedProfit: expectedProfit,
            actualProfit: 0,
            timestamp: block.timestamp,
            status: ExecutionStatus.INITIATED,
            ccipMessageId: bytes32(0)
        });

        executionIds.push(executionId);

        // Execute local trade first
        _executeLocalTrade(executionId, opportunity.tokenA, opportunity.tokenB, amount);

        // Initiate cross-chain trade
        bytes32 ccipMessageId = _initiateCrossChainTrade(
            executionId,
            opportunity.destinationChain,
            opportunity.tokenA,
            opportunity.tokenB,
            amount
        );

        executions[executionId].ccipMessageId = ccipMessageId;
        executions[executionId].status = ExecutionStatus.CROSS_CHAIN_SENT;

        emit ArbitrageExecuted(executionId, opportunityId, msg.sender, amount, expectedProfit);
        emit CrossChainArbitrageInitiated(executionId, ccipMessageId, opportunity.destinationChain);
    }

    /**
     * @notice Update price data from Data Streams
     * @param token Token address
     * @param chainSelector Chain selector
     * @param price Token price
     * @param confidence Price confidence
     * @param liquidityDepth Available liquidity
     */
    function updatePriceData(
        address token,
        uint64 chainSelector,
        uint256 price,
        uint256 confidence,
        uint256 liquidityDepth
    ) external tokenSupported(token) chainSupported(chainSelector) {
        if (price == 0) revert InvalidPriceData(token, price);

        priceData[token][chainSelector] = PriceData({
            token: token,
            chainSelector: chainSelector,
            price: price,
            timestamp: block.timestamp,
            confidence: confidence,
            liquidityDepth: liquidityDepth
        });

        emit PriceDataUpdated(token, chainSelector, price, confidence);
    }

    /**
     * @notice Handle CCIP received messages
     */
    function _ccipReceive(Client.Any2EVMMessage memory message) internal override {
        bytes32 messageId = message.messageId;
        uint64 sourceChainSelector = message.sourceChainSelector;
        address sender = abi.decode(message.sender, (address));
        
        // Decode execution data
        (bytes32 executionId, uint256 actualProfit) = abi.decode(message.data, (bytes32, uint256));
        
        // Update execution status
        ArbitrageExecution storage execution = executions[executionId];
        execution.actualProfit = actualProfit;
        execution.status = ExecutionStatus.COMPLETED;
        
        // Update statistics
        totalArbitrageVolume += execution.amount;
        totalProfitGenerated += actualProfit;
        successfulExecutions++;
        
        // Mark opportunity as inactive
        ArbitrageOpportunity storage opportunity = opportunities[execution.opportunityId];
        opportunity.isActive = false;
        activeOpportunities[execution.opportunityId] = false;
    }

    /**
     * @notice Handle Chainlink Functions responses
     */
    function _fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
        if (err.length > 0) {
            // Handle error
            return;
        }

        // Decode ML prediction response
        (address token, uint256 predictedPrice, uint256 confidence, uint256 timeHorizon) = 
            abi.decode(response, (address, uint256, uint256, uint256));

        mlPredictions[requestId] = MLPrediction({
            requestId: requestId,
            token: token,
            predictedPrice: predictedPrice,
            confidence: confidence,
            timeHorizon: timeHorizon,
            timestamp: block.timestamp
        });

        emit MLPredictionReceived(requestId, token, predictedPrice, confidence);
    }

    /**
     * @notice Handle VRF randomness for strategy diversification
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        // Use randomness for strategy diversification
        uint256 randomness = randomWords[0];
        
        // Implement randomized execution timing or strategy selection
        _applyRandomizedStrategy(randomness);
    }

    /**
     * @notice Chainlink Automation upkeep check
     */
    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData) {
        // Check for maintenance needs
        bool needsMaintenance = (block.timestamp - lastMaintenanceTime) > 1 hours;
        bool hasExpiredOpportunities = _hasExpiredOpportunities();
        bool needsPriceUpdates = _needsPriceUpdates();

        upkeepNeeded = needsMaintenance || hasExpiredOpportunities || needsPriceUpdates;
        
        if (upkeepNeeded) {
            performData = abi.encode(needsMaintenance, hasExpiredOpportunities, needsPriceUpdates);
        }
    }

    /**
     * @notice Chainlink Automation upkeep performance
     */
    function performUpkeep(bytes calldata performData) external override {
        (bool needsMaintenance, bool hasExpiredOpportunities, bool needsPriceUpdates) = 
            abi.decode(performData, (bool, bool, bool));

        if (needsMaintenance) {
            _performMaintenance();
        }
        
        if (hasExpiredOpportunities) {
            _cleanupExpiredOpportunities();
        }
        
        if (needsPriceUpdates) {
            _requestPriceUpdates();
        }
        
        lastMaintenanceTime = block.timestamp;
    }

    // Internal functions
    function _executeLocalTrade(
        bytes32 executionId,
        address tokenA,
        address tokenB,
        uint256 amount
    ) internal {
        // Implementation for local DEX trade
        // This would integrate with local DEX protocols
    }

    function _initiateCrossChainTrade(
        bytes32 executionId,
        uint64 destinationChain,
        address tokenA,
        address tokenB,
        uint256 amount
    ) internal returns (bytes32 messageId) {
        // Prepare CCIP message
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(address(this)), // Self-address on destination chain
            data: abi.encode(executionId, tokenA, tokenB, amount),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 500_000})
            ),
            feeToken: address(linkToken)
        });

        // Get router and calculate fees
        IRouterClient router = IRouterClient(this.getRouter());
        uint256 fees = router.getFee(destinationChain, message);

        // Approve and send
        linkToken.approve(address(router), fees);
        messageId = router.ccipSend(destinationChain, message);
        
        return messageId;
    }

    function _requestMLPrediction(bytes32 opportunityId, address token) internal {
        // Create Functions request for ML prediction
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(
            "const token = args[0];"
            "const opportunity = args[1];"
            "const apiResponse = await Functions.makeHttpRequest({"
            "  url: `https://api.crosschaindefi.com/ml/predict`,"
            "  method: 'POST',"
            "  headers: { 'Content-Type': 'application/json' },"
            "  data: { token, opportunity }"
            "});"
            "if (apiResponse.error) throw Error('API request failed');"
            "const result = apiResponse.data;"
            "return Functions.encodeUint256(result.predictedPrice);"
        );
        
        string[] memory args = new string[](2);
        args[0] = _addressToString(token);
        args[1] = _bytes32ToString(opportunityId);
        req.setArgs(args);

        _sendRequest(req.encodeCBOR(), uint64(subscriptionId), 300000, donId);
    }

    function _applyRandomizedStrategy(uint256 randomness) internal {
        // Use randomness to diversify execution strategies
        uint256 strategyIndex = randomness % 3;
        
        if (strategyIndex == 0) {
            // Aggressive execution
        } else if (strategyIndex == 1) {
            // Conservative execution
        } else {
            // Balanced execution
        }
    }

    function _hasExpiredOpportunities() internal view returns (bool) {
        for (uint256 i = 0; i < opportunityIds.length; i++) {
            bytes32 oppId = opportunityIds[i];
            if (activeOpportunities[oppId] && 
                block.timestamp > opportunities[oppId].timestamp + EXECUTION_WINDOW) {
                return true;
            }
        }
        return false;
    }

    function _needsPriceUpdates() internal view returns (bool) {
        // Implementation would check if price data is stale
        return false; // Simplified
    }

    function _performMaintenance() internal {
        // Perform regular maintenance tasks
        _updateStrategyParameters();
        _rebalancePortfolio();
        _optimizeGasUsage();
    }

    function _cleanupExpiredOpportunities() internal {
        for (uint256 i = 0; i < opportunityIds.length; i++) {
            bytes32 oppId = opportunityIds[i];
            if (activeOpportunities[oppId] && 
                block.timestamp > opportunities[oppId].timestamp + EXECUTION_WINDOW) {
                opportunities[oppId].isActive = false;
                activeOpportunities[oppId] = false;
            }
        }
    }

    function _requestPriceUpdates() internal {
        // Request fresh price data from Data Streams
    }

    function _updateStrategyParameters() internal {
        // Dynamic strategy parameter updates based on market conditions
    }

    function _rebalancePortfolio() internal {
        // Rebalance arbitrage portfolio allocation
    }

    function _optimizeGasUsage() internal {
        // Optimize gas parameters for different chains
    }

    function _addressToString(address addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3+i*2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }

    function _bytes32ToString(bytes32 value) internal pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(64);
        for (uint256 i = 0; i < 32; i++) {
            str[i*2] = alphabet[uint8(value[i] >> 4)];
            str[1+i*2] = alphabet[uint8(value[i] & 0x0f)];
        }
        return string(str);
    }

    // Admin functions
    function addSupportedToken(address token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        supportedTokens[token] = true;
    }

    function addSupportedChain(uint64 chainSelector) external onlyRole(DEFAULT_ADMIN_ROLE) {
        supportedChains[chainSelector] = true;
    }

    function setAgentAddresses(
        address _marketIntelligenceAgent
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        marketIntelligenceAgent = _marketIntelligenceAgent;
    }

    function updateStrategyParameters(
        uint256 _minProfitThreshold,
        uint256 _maxSlippage,
        uint256 _executionWindow
    ) external onlyRole(STRATEGY_ROLE) {
        // Update with validation
        emit StrategyParametersUpdated(_minProfitThreshold, _maxSlippage, _executionWindow);
    }

    function emergencyPause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function emergencyUnpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // View functions
    function getOpportunity(bytes32 opportunityId) external view returns (ArbitrageOpportunity memory) {
        return opportunities[opportunityId];
    }

    function getExecution(bytes32 executionId) external view returns (ArbitrageExecution memory) {
        return executions[executionId];
    }

    function getActiveOpportunities() external view returns (bytes32[] memory) {
        bytes32[] memory active = new bytes32[](opportunityIds.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < opportunityIds.length; i++) {
            bytes32 oppId = opportunityIds[i];
            if (activeOpportunities[oppId]) {
                active[count] = oppId;
                count++;
            }
        }
        
        // Resize array
        bytes32[] memory result = new bytes32[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = active[i];
        }
        
        return result;
    }

    function getAgentStats() external view returns (
        uint256 _totalVolume,
        uint256 _totalProfit,
        uint256 _successfulExecutions,
        uint256 _failedExecutions,
        uint256 _successRate
    ) {
        uint256 totalExecutions = successfulExecutions + failedExecutions;
        uint256 successRate = totalExecutions > 0 ? 
            (successfulExecutions * 10000) / totalExecutions : 0;
            
        return (
            totalArbitrageVolume,
            totalProfitGenerated,
            successfulExecutions,
            failedExecutions,
            successRate
        );
    }

    function getPriceData(address token, uint64 chainSelector) external view returns (PriceData memory) {
        return priceData[token][chainSelector];
    }

    function getMLPrediction(bytes32 requestId) external view returns (MLPrediction memory) {
        return mlPredictions[requestId];
    }
} 