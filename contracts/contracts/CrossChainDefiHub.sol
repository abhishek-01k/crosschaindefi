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
 * @title CrossChainDefi Hub
 * @author CrossChainDefi Team
 * @notice Main protocol hub for cross-chain DeFi operations with AI agent integration
 * @dev Integrates all Chainlink services: CCIP, Functions, Data Feeds, VRF, Automation
 */
contract CrossChainDefiHub is 
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
    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");
    bytes32 public constant LIQUIDATOR_ROLE = keccak256("LIQUIDATOR_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    // Structs
    struct UserProfile {
        mapping(address => uint256) deposits;
        mapping(address => uint256) borrowed;
        uint256 healthFactor;
        uint256 creditScore;
        uint256 lastActivity;
        bool isActive;
    }

    struct CrossChainOperation {
        uint64 sourceChainSelector;
        uint64 destinationChainSelector;
        address user;
        address token;
        uint256 amount;
        uint256 timestamp;
        OperationType operationType;
        OperationStatus status;
    }

    struct MarketData {
        address token;
        uint256 price;
        uint256 timestamp;
        uint256 volatility;
        uint256 liquidityDepth;
    }

    struct AgentRequest {
        address requester;
        AgentType agentType;
        bytes requestData;
        uint256 timestamp;
        RequestStatus status;
    }

    enum OperationType {
        DEPOSIT,
        WITHDRAW,
        BORROW,
        REPAY,
        LIQUIDATE,
        ARBITRAGE
    }

    enum OperationStatus {
        PENDING,
        EXECUTING,
        COMPLETED,
        FAILED
    }

    enum AgentType {
        ARBITRAGE_COORDINATOR,
        MARKET_INTELLIGENCE,
        CROSS_CHAIN_BRIDGE,
        AI_COMPUTATION,
        AUTOMATION,
        RANDOMIZATION,
        TREASURY
    }

    enum RequestStatus {
        PENDING,
        PROCESSING,
        COMPLETED,
        FAILED
    }

    // Constants
    uint256 public constant LIQUIDATION_THRESHOLD = 80; // 80%
    uint256 public constant HEALTH_FACTOR_THRESHOLD = 110; // 110%
    uint256 public constant MAX_UTILIZATION_RATE = 90; // 90%
    uint256 public constant PRECISION = 1e18;

    // Chainlink configuration
    LinkTokenInterface public immutable linkToken;
    VRFCoordinatorV2Interface public immutable vrfCoordinator;
    uint256 public immutable subscriptionId;
    bytes32 public immutable keyHash;
    uint32 public constant CALLBACK_GAS_LIMIT = 100000;
    uint16 public constant REQUEST_CONFIRMATIONS = 3;
    uint32 public constant NUM_WORDS = 1;

    // State variables
    mapping(address => UserProfile) public userProfiles;
    mapping(bytes32 => CrossChainOperation) public crossChainOperations;
    mapping(address => MarketData) public marketData;
    mapping(bytes32 => AgentRequest) public agentRequests;
    mapping(address => AggregatorV3Interface) public priceFeeds;
    mapping(address => bool) public supportedTokens;
    mapping(uint64 => bool) public supportedChains;
    mapping(address => bool) public registeredAgents;

    uint256 public totalDeposits;
    uint256 public totalBorrowed;
    uint256 public protocolFees;
    uint256 public lastMaintenanceTime;
    uint256 public emergencyShutdownTime;

    // Agent addresses
    address public arbitrageCoordinatorAgent;
    address public marketIntelligenceAgent;

    // Events
    event UserDeposit(address indexed user, address indexed token, uint256 amount, uint64 chainSelector);
    event UserWithdraw(address indexed user, address indexed token, uint256 amount, uint64 chainSelector);
    event UserBorrow(address indexed user, address indexed token, uint256 amount, uint256 healthFactor);
    event UserRepay(address indexed user, address indexed token, uint256 amount, uint256 healthFactor);
    event Liquidation(address indexed user, address indexed liquidator, address indexed token, uint256 amount);
    event CrossChainMessageSent(bytes32 indexed messageId, uint64 indexed destinationChain, address indexed user);
    event CrossChainMessageReceived(bytes32 indexed messageId, uint64 indexed sourceChain, address indexed user);
    event AgentRequestCreated(bytes32 indexed requestId, AgentType indexed agentType, address indexed requester);
    event AgentRequestCompleted(bytes32 indexed requestId, AgentType indexed agentType, bytes result);
    event HealthFactorUpdated(address indexed user, uint256 oldHealthFactor, uint256 newHealthFactor);
    event CreditScoreUpdated(address indexed user, uint256 oldScore, uint256 newScore);
    event MarketDataUpdated(address indexed token, uint256 price, uint256 volatility);
    event EmergencyShutdown(uint256 timestamp, string reason);

    // Custom errors
    error InsufficientBalance(uint256 requested, uint256 available);
    error InsufficientCollateral(uint256 healthFactor, uint256 required);
    error TokenNotSupported(address token);
    error ChainNotSupported(uint64 chainSelector);
    error AgentNotRegistered(address agent);
    error OperationNotAuthorized(address caller);
    error InvalidHealthFactor(uint256 healthFactor);
    error LiquidationNotAllowed(uint256 healthFactor);
    error EmergencyShutdownActive();

    modifier onlyRegisteredAgent() {
        if (!registeredAgents[msg.sender]) revert AgentNotRegistered(msg.sender);
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

    modifier notInEmergency() {
        if (emergencyShutdownTime > 0) revert EmergencyShutdownActive();
        _;
    }

    constructor(
        address _router,
        address _linkToken,
        address _functionsRouter,
        address _vrfCoordinator,
        uint256 _subscriptionId,
        bytes32 _keyHash
    ) 
        CCIPReceiver(_router)
        FunctionsClient(_functionsRouter)
        VRFConsumerBaseV2(_vrfCoordinator)
    {
        linkToken = LinkTokenInterface(_linkToken);
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
        
        lastMaintenanceTime = block.timestamp;
    }

    /**
     * @notice Deposit assets to the protocol
     * @param token The token address to deposit
     * @param amount The amount to deposit
     * @param destinationChain The destination chain for cross-chain deposits
     */
    function deposit(
        address token,
        uint256 amount,
        uint64 destinationChain
    ) external nonReentrant whenNotPaused tokenSupported(token) notInEmergency {
        if (amount == 0) revert InsufficientBalance(amount, 0);
        
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        userProfiles[msg.sender].deposits[token] += amount;
        userProfiles[msg.sender].lastActivity = block.timestamp;
        userProfiles[msg.sender].isActive = true;
        
        totalDeposits += amount;
        
        // Update health factor
        _updateHealthFactor(msg.sender);
        
        emit UserDeposit(msg.sender, token, amount, destinationChain);
        
        // Trigger cross-chain operation if needed
        if (destinationChain != 0) {
            _initiateCrossChainOperation(msg.sender, token, amount, destinationChain, OperationType.DEPOSIT);
        }
    }

    /**
     * @notice Withdraw assets from the protocol
     * @param token The token address to withdraw
     * @param amount The amount to withdraw
     */
    function withdraw(
        address token,
        uint256 amount
    ) external nonReentrant whenNotPaused tokenSupported(token) notInEmergency {
        uint256 userBalance = userProfiles[msg.sender].deposits[token];
        if (amount > userBalance) revert InsufficientBalance(amount, userBalance);
        
        // Check if withdrawal affects health factor
        uint256 newHealthFactor = _calculateHealthFactorAfterWithdrawal(msg.sender, token, amount);
        if (newHealthFactor < HEALTH_FACTOR_THRESHOLD) {
            revert InsufficientCollateral(newHealthFactor, HEALTH_FACTOR_THRESHOLD);
        }
        
        userProfiles[msg.sender].deposits[token] -= amount;
        userProfiles[msg.sender].lastActivity = block.timestamp;
        
        totalDeposits -= amount;
        
        IERC20(token).transfer(msg.sender, amount);
        
        _updateHealthFactor(msg.sender);
        
        emit UserWithdraw(msg.sender, token, amount, 0);
    }

    /**
     * @notice Borrow assets from the protocol
     * @param token The token address to borrow
     * @param amount The amount to borrow
     */
    function borrow(
        address token,
        uint256 amount
    ) external nonReentrant whenNotPaused tokenSupported(token) notInEmergency {
        uint256 maxBorrowable = _calculateMaxBorrowable(msg.sender, token);
        if (amount > maxBorrowable) revert InsufficientCollateral(0, HEALTH_FACTOR_THRESHOLD);
        
        userProfiles[msg.sender].borrowed[token] += amount;
        userProfiles[msg.sender].lastActivity = block.timestamp;
        
        totalBorrowed += amount;
        
        IERC20(token).transfer(msg.sender, amount);
        
        _updateHealthFactor(msg.sender);
        
        emit UserBorrow(msg.sender, token, amount, userProfiles[msg.sender].healthFactor);
    }

    /**
     * @notice Repay borrowed assets
     * @param token The token address to repay
     * @param amount The amount to repay
     */
    function repay(
        address token,
        uint256 amount
    ) external nonReentrant whenNotPaused tokenSupported(token) {
        uint256 userDebt = userProfiles[msg.sender].borrowed[token];
        if (amount > userDebt) amount = userDebt;
        
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        userProfiles[msg.sender].borrowed[token] -= amount;
        userProfiles[msg.sender].lastActivity = block.timestamp;
        
        totalBorrowed -= amount;
        
        _updateHealthFactor(msg.sender);
        
        emit UserRepay(msg.sender, token, amount, userProfiles[msg.sender].healthFactor);
    }

    /**
     * @notice Liquidate undercollateralized positions
     * @param user The user to liquidate
     * @param token The token to liquidate
     * @param amount The amount to liquidate
     */
    function liquidate(
        address user,
        address token,
        uint256 amount
    ) external nonReentrant whenNotPaused onlyRole(LIQUIDATOR_ROLE) {
        uint256 healthFactor = _calculateHealthFactor(user);
        if (healthFactor >= LIQUIDATION_THRESHOLD) {
            revert LiquidationNotAllowed(healthFactor);
        }
        
        uint256 userDebt = userProfiles[user].borrowed[token];
        if (amount > userDebt) amount = userDebt;
        
        // Calculate liquidation reward
        uint256 liquidationReward = (amount * 105) / 100; // 5% liquidation bonus
        
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        userProfiles[user].borrowed[token] -= amount;
        userProfiles[user].deposits[token] -= liquidationReward;
        
        IERC20(token).transfer(msg.sender, liquidationReward);
        
        _updateHealthFactor(user);
        
        emit Liquidation(user, msg.sender, token, amount);
    }

    /**
     * @notice Create a request for an AI agent
     * @param agentType The type of agent to request
     * @param requestData The data for the request
     */
    function createAgentRequest(
        AgentType agentType,
        bytes calldata requestData
    ) external whenNotPaused returns (bytes32 requestId) {
        requestId = keccak256(abi.encodePacked(msg.sender, agentType, requestData, block.timestamp));
        
        agentRequests[requestId] = AgentRequest({
            requester: msg.sender,
            agentType: agentType,
            requestData: requestData,
            timestamp: block.timestamp,
            status: RequestStatus.PENDING
        });
        
        emit AgentRequestCreated(requestId, agentType, msg.sender);
        
        // Route to appropriate agent
        _routeAgentRequest(requestId, agentType, requestData);
    }

    /**
     * @notice Handle CCIP received messages
     */
    function _ccipReceive(Client.Any2EVMMessage memory message) internal override {
        bytes32 messageId = message.messageId;
        uint64 sourceChainSelector = message.sourceChainSelector;
        address sender = abi.decode(message.sender, (address));
        
        // Process the cross-chain message
        _processCrossChainMessage(messageId, sourceChainSelector, sender, message.data, message.destTokenAmounts);
        
        emit CrossChainMessageReceived(messageId, sourceChainSelector, sender);
    }

    /**
     * @notice Handle Chainlink Functions responses
     */
    function _fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
        // Process the Functions response
        _processFunctionsResponse(requestId, response, err);
    }

    /**
     * @notice Handle VRF randomness
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        // Process the random words
        _processRandomness(requestId, randomWords);
    }

    /**
     * @notice Chainlink Automation upkeep check
     */
    function checkUpkeep(bytes calldata checkData) external view override returns (bool upkeepNeeded, bytes memory performData) {
        // Check if maintenance is needed
        upkeepNeeded = (block.timestamp - lastMaintenanceTime) > 1 hours;
        
        if (upkeepNeeded) {
            performData = abi.encode("maintenance");
        }
    }

    /**
     * @notice Chainlink Automation upkeep performance
     */
    function performUpkeep(bytes calldata performData) external override {
        // Perform maintenance tasks
        _performMaintenance();
        lastMaintenanceTime = block.timestamp;
    }

    // Internal functions
    function _updateHealthFactor(address user) internal {
        uint256 oldHealthFactor = userProfiles[user].healthFactor;
        uint256 newHealthFactor = _calculateHealthFactor(user);
        
        userProfiles[user].healthFactor = newHealthFactor;
        
        emit HealthFactorUpdated(user, oldHealthFactor, newHealthFactor);
    }

    function _calculateHealthFactor(address user) internal view returns (uint256) {
        uint256 totalCollateralValue = _getTotalCollateralValue(user);
        uint256 totalBorrowedValue = _getTotalBorrowedValue(user);
        
        if (totalBorrowedValue == 0) return type(uint256).max;
        
        return (totalCollateralValue * LIQUIDATION_THRESHOLD * PRECISION) / (totalBorrowedValue * 100);
    }

    function _calculateHealthFactorAfterWithdrawal(
        address user,
        address token,
        uint256 amount
    ) internal view returns (uint256) {
        uint256 tokenPrice = _getTokenPrice(token);
        uint256 withdrawalValue = amount * tokenPrice / PRECISION;
        
        uint256 totalCollateralValue = _getTotalCollateralValue(user) - withdrawalValue;
        uint256 totalBorrowedValue = _getTotalBorrowedValue(user);
        
        if (totalBorrowedValue == 0) return type(uint256).max;
        
        return (totalCollateralValue * LIQUIDATION_THRESHOLD * PRECISION) / (totalBorrowedValue * 100);
    }

    function _calculateMaxBorrowable(address user, address token) internal view returns (uint256) {
        uint256 totalCollateralValue = _getTotalCollateralValue(user);
        uint256 totalBorrowedValue = _getTotalBorrowedValue(user);
        uint256 tokenPrice = _getTokenPrice(token);
        
        uint256 maxBorrowableValue = (totalCollateralValue * LIQUIDATION_THRESHOLD) / 100 - totalBorrowedValue;
        
        return (maxBorrowableValue * PRECISION) / tokenPrice;
    }

    function _getTotalCollateralValue(address user) internal view returns (uint256) {
        uint256 totalValue = 0;
        // Implementation would iterate through all supported tokens
        // This is a simplified version
        return totalValue;
    }

    function _getTotalBorrowedValue(address user) internal view returns (uint256) {
        uint256 totalValue = 0;
        // Implementation would iterate through all supported tokens
        // This is a simplified version
        return totalValue;
    }

    function _getTokenPrice(address token) internal view returns (uint256) {
        AggregatorV3Interface priceFeed = priceFeeds[token];
        if (address(priceFeed) == address(0)) return 0;
        
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint256(price) * 1e10; // Convert to 18 decimals
    }

    function _initiateCrossChainOperation(
        address user,
        address token,
        uint256 amount,
        uint64 destinationChain,
        OperationType operationType
    ) internal {
        bytes32 operationId = keccak256(abi.encodePacked(user, token, amount, destinationChain, block.timestamp));
        
        crossChainOperations[operationId] = CrossChainOperation({
            sourceChainSelector: 0, // Current chain
            destinationChainSelector: destinationChain,
            user: user,
            token: token,
            amount: amount,
            timestamp: block.timestamp,
            operationType: operationType,
            status: OperationStatus.PENDING
        });
        
        // Send CCIP message
        _sendCCIPMessage(destinationChain, user, token, amount, operationType);
    }

    function _sendCCIPMessage(
        uint64 destinationChain,
        address user,
        address token,
        uint256 amount,
        OperationType operationType
    ) internal {
        // Implementation for sending CCIP messages
        // This would use the CCIP router to send cross-chain messages
    }

    function _processCrossChainMessage(
        bytes32 messageId,
        uint64 sourceChainSelector,
        address sender,
        bytes memory data,
        Client.EVMTokenAmount[] memory tokenAmounts
    ) internal {
        // Implementation for processing received CCIP messages
    }

    function _processFunctionsResponse(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal {
        // Implementation for processing Chainlink Functions responses
    }

    function _processRandomness(uint256 requestId, uint256[] memory randomWords) internal {
        // Implementation for processing VRF randomness
    }

    function _routeAgentRequest(
        bytes32 requestId,
        AgentType agentType,
        bytes calldata requestData
    ) internal {
        // Route request to appropriate agent contract
        address targetAgent;
        
        if (agentType == AgentType.ARBITRAGE_COORDINATOR) {
            targetAgent = arbitrageCoordinatorAgent;
        } else if (agentType == AgentType.MARKET_INTELLIGENCE) {
            targetAgent = marketIntelligenceAgent;
        }
        
        // Call the target agent with the request
        if (targetAgent != address(0)) {
            // Implementation would call the specific agent contract
        }
    }

    function _performMaintenance() internal {
        // Perform regular maintenance tasks
        // - Update market data
        // - Process pending liquidations
        // - Rebalance protocol parameters
        // - Clean up expired data
    }

    // Admin functions
    function addSupportedToken(address token, address priceFeed) external onlyRole(DEFAULT_ADMIN_ROLE) {
        supportedTokens[token] = true;
        priceFeeds[token] = AggregatorV3Interface(priceFeed);
    }

    function addSupportedChain(uint64 chainSelector) external onlyRole(DEFAULT_ADMIN_ROLE) {
        supportedChains[chainSelector] = true;
    }

    function registerAgent(address agent) external onlyRole(DEFAULT_ADMIN_ROLE) {
        registeredAgents[agent] = true;
        _grantRole(AGENT_ROLE, agent);
    }

    function setAgentAddress(AgentType agentType, address agentAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (agentType == AgentType.ARBITRAGE_COORDINATOR) {
            arbitrageCoordinatorAgent = agentAddress;
        } else if (agentType == AgentType.MARKET_INTELLIGENCE) {
            marketIntelligenceAgent = agentAddress;
        }
    }

    function emergencyShutdown(string calldata reason) external onlyRole(EMERGENCY_ROLE) {
        emergencyShutdownTime = block.timestamp;
        _pause();
        emit EmergencyShutdown(block.timestamp, reason);
    }

    function resumeOperations() external onlyRole(DEFAULT_ADMIN_ROLE) {
        emergencyShutdownTime = 0;
        _unpause();
    }

    // View functions
    function getUserProfile(address user) external view returns (
        uint256 healthFactor,
        uint256 creditScore,
        uint256 lastActivity,
        bool isActive
    ) {
        UserProfile storage profile = userProfiles[user];
        return (
            profile.healthFactor,
            profile.creditScore,
            profile.lastActivity,
            profile.isActive
        );
    }

    function getUserDeposits(address user, address token) external view returns (uint256) {
        return userProfiles[user].deposits[token];
    }

    function getUserBorrowed(address user, address token) external view returns (uint256) {
        return userProfiles[user].borrowed[token];
    }

    function getProtocolStats() external view returns (
        uint256 _totalDeposits,
        uint256 _totalBorrowed,
        uint256 _protocolFees,
        uint256 utilizationRate
    ) {
        return (
            totalDeposits,
            totalBorrowed,
            protocolFees,
            totalDeposits > 0 ? (totalBorrowed * 100) / totalDeposits : 0
        );
    }
} 