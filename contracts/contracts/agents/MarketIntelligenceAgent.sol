// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_3_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {OwnerIsCreator} from "@chainlink/contracts/src/v0.8/shared/access/OwnerIsCreator.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title MarketIntelligenceAgent
 * @author CrossChainDefi Team
 * @notice AI Agent that analyzes DeFi lending/borrowing markets and generates yield optimization insights
 * @dev Uses Chainlink Functions for AI/ML analysis, Data Feeds for market data,
 *      and focuses on cross-chain lending rate analysis and yield optimization
 */
contract MarketIntelligenceAgent is 
    FunctionsClient,
    AutomationCompatibleInterface,
    OwnerIsCreator,
    ReentrancyGuard,
    Pausable,
    AccessControl
{
    using FunctionsRequest for FunctionsRequest.Request;

    // Role definitions
    bytes32 public constant HUB_ROLE = keccak256("HUB_ROLE");
    bytes32 public constant ANALYST_ROLE = keccak256("ANALYST_ROLE");
    bytes32 public constant STRATEGY_ROLE = keccak256("STRATEGY_ROLE");

    // Structs
    struct LendingMarketAnalysis {
        bytes32 requestId;
        address protocol;
        address token;
        uint64 chainSelector;
        uint256 supplyRate;
        uint256 borrowRate;
        uint256 utilization;
        uint256 liquidity;
        uint256 confidence;
        uint256 timestamp;
        AnalysisStatus status;
    }

    struct YieldOpportunity {
        bytes32 opportunityId;
        address protocol;
        address token;
        uint64 chainSelector;
        OpportunityType opportunityType;
        uint256 expectedYield;
        uint256 riskScore;
        uint256 minAmount;
        uint256 maxAmount;
        uint256 duration;
        uint256 confidence;
        uint256 timestamp;
        bool isActive;
    }

    struct LendingProtocol {
        string name;
        address protocolAddress;
        uint64 chainSelector;
        ProtocolType protocolType;
        uint256 totalSupply;
        uint256 totalBorrow;
        uint256 avgSupplyRate;
        uint256 avgBorrowRate;
        uint256 riskRating;
        bool isActive;
        uint256 lastUpdated;
    }

    struct RateAnalysis {
        address token;
        uint64 chainSelector;
        uint256 bestSupplyRate;
        uint256 bestBorrowRate;
        address bestSupplyProtocol;
        address bestBorrowProtocol;
        uint256 rateSpread;
        uint256 arbitrageOpportunity;
        uint256 timestamp;
    }

    struct TokenMetrics {
        address token;
        uint256 totalSupplyAcrossChains;
        uint256 totalBorrowAcrossChains;
        uint256 avgSupplyRate;
        uint256 avgBorrowRate;
        uint256 volatility;
        uint256 liquidityScore;
        uint256 lastUpdated;
    }

    enum AnalysisStatus {
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        FAILED
    }

    enum OpportunityType {
        HIGH_YIELD_SUPPLY,
        LOW_RATE_BORROW,
        ARBITRAGE,
        LIQUIDATION,
        YIELD_FARMING,
        FLASH_LOAN
    }

    enum ProtocolType {
        AAVE,
        COMPOUND,
        VENUS,
        BENQI,
        RADIANT,
        MOONWELL,
        OTHER
    }

    // Constants
    uint256 public constant MIN_CONFIDENCE_THRESHOLD = 70; // 70%
    uint256 public constant MAX_ANALYSIS_AGE = 1 hours;
    uint256 public constant RATE_UPDATE_INTERVAL = 15 minutes;
    uint256 public constant PROTOCOL_SCAN_INTERVAL = 5 minutes;
    uint256 public constant MIN_ARBITRAGE_SPREAD = 50; // 0.5%
    uint256 public constant PRECISION = 1e18;

    // Chainlink configuration
    LinkTokenInterface public immutable linkToken;
    uint256 public immutable subscriptionId;
    bytes32 public immutable donId;

    // State variables
    mapping(bytes32 => LendingMarketAnalysis) public marketAnalyses;
    mapping(bytes32 => YieldOpportunity) public yieldOpportunities;
    mapping(bytes32 => LendingProtocol) public lendingProtocols;
    mapping(address => mapping(uint64 => RateAnalysis)) public rateAnalyses;
    mapping(address => TokenMetrics) public tokenMetrics;
    mapping(address => AggregatorV3Interface) public priceFeeds;
    mapping(address => bool) public trackedTokens;
    mapping(uint64 => bool) public supportedChains;

    address public hubContract;
    address public arbitrageCoordinatorAgent;

    uint256 public totalAnalysesCompleted;
    uint256 public totalOpportunitiesFound;
    uint256 public totalProtocolsTracked;
    uint256 public lastMaintenanceTime;
    uint256 public avgAnalysisAccuracy;

    bytes32[] public analysisIds;
    bytes32[] public opportunityIds;
    bytes32[] public protocolIds;
    address[] public trackedTokensList;

    // Events
    event LendingMarketAnalysisRequested(
        bytes32 indexed requestId,
        address indexed protocol,
        address indexed token,
        uint64 chainSelector
    );

    event LendingMarketAnalysisCompleted(
        bytes32 indexed requestId,
        address indexed protocol,
        uint256 supplyRate,
        uint256 borrowRate
    );

    event YieldOpportunityDetected(
        bytes32 indexed opportunityId,
        address indexed protocol,
        address indexed token,
        OpportunityType opportunityType,
        uint256 expectedYield
    );

    event RateAnalysisUpdated(
        address indexed token,
        uint64 indexed chainSelector,
        uint256 bestSupplyRate,
        uint256 bestBorrowRate
    );

    event ProtocolAdded(
        bytes32 indexed protocolId,
        string name,
        address protocolAddress,
        uint64 chainSelector
    );

    event ArbitrageOpportunityFound(
        address indexed token,
        uint64 sourceChain,
        uint64 destChain,
        uint256 rateSpread
    );

    // Custom errors
    error ProtocolNotFound(bytes32 protocolId);
    error AnalysisNotFound(bytes32 requestId);
    error InsufficientConfidence(uint256 confidence, uint256 threshold);
    error AnalysisExpired(uint256 timestamp, uint256 maxAge);
    error TokenNotTracked(address token);
    error ChainNotSupported(uint64 chainSelector);

    modifier onlyHub() {
        if (!hasRole(HUB_ROLE, msg.sender)) revert("Unauthorized");
        _;
    }

    modifier onlyAnalyst() {
        if (!hasRole(ANALYST_ROLE, msg.sender)) revert("Unauthorized analyst");
        _;
    }

    modifier tokenTracked(address token) {
        if (!trackedTokens[token]) revert TokenNotTracked(token);
        _;
    }

    modifier chainSupported(uint64 chainSelector) {
        if (!supportedChains[chainSelector]) revert ChainNotSupported(chainSelector);
        _;
    }

    constructor(
        address _functionsRouter,
        address _linkToken,
        uint256 _subscriptionId,
        bytes32 _donId,
        address _hubContract
    ) FunctionsClient(_functionsRouter) {
        linkToken = LinkTokenInterface(_linkToken);
        subscriptionId = _subscriptionId;
        donId = _donId;
        hubContract = _hubContract;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(HUB_ROLE, _hubContract);
        
        lastMaintenanceTime = block.timestamp;
    }

    /**
     * @notice Request lending market analysis for a specific protocol
     * @param protocol Protocol address to analyze
     * @param token Token address
     * @param chainSelector Chain selector
     */
    function requestLendingMarketAnalysis(
        address protocol,
        address token,
        uint64 chainSelector
    ) external whenNotPaused tokenTracked(token) chainSupported(chainSelector) returns (bytes32 requestId) {
        require(protocol != address(0), "Invalid protocol address");

        requestId = keccak256(abi.encodePacked(
            protocol, token, chainSelector, block.timestamp
        ));

        // Create analysis record
        marketAnalyses[requestId] = LendingMarketAnalysis({
            requestId: requestId,
            protocol: protocol,
            token: token,
            chainSelector: chainSelector,
            supplyRate: 0,
            borrowRate: 0,
            utilization: 0,
            liquidity: 0,
            confidence: 0,
            timestamp: block.timestamp,
            status: AnalysisStatus.PENDING
        });

        analysisIds.push(requestId);

        emit LendingMarketAnalysisRequested(requestId, protocol, token, chainSelector);

        // Send Chainlink Functions request
        _sendLendingAnalysisRequest(requestId, protocol, token, chainSelector);

        return requestId;
    }

    /**
     * @notice Add a lending protocol to track
     * @param name Protocol name
     * @param protocolAddress Protocol contract address
     * @param chainSelector Chain selector
     * @param protocolType Type of protocol
     */
    function addLendingProtocol(
        string memory name,
        address protocolAddress,
        uint64 chainSelector,
        ProtocolType protocolType
    ) external onlyAnalyst chainSupported(chainSelector) returns (bytes32 protocolId) {
        require(protocolAddress != address(0), "Invalid protocol address");
        require(bytes(name).length > 0, "Invalid protocol name");

        protocolId = keccak256(abi.encodePacked(
            name, protocolAddress, chainSelector
        ));

        lendingProtocols[protocolId] = LendingProtocol({
            name: name,
            protocolAddress: protocolAddress,
            chainSelector: chainSelector,
            protocolType: protocolType,
            totalSupply: 0,
            totalBorrow: 0,
            avgSupplyRate: 0,
            avgBorrowRate: 0,
            riskRating: 50, // Default medium risk
            isActive: true,
            lastUpdated: block.timestamp
        });

        protocolIds.push(protocolId);
        totalProtocolsTracked++;

        emit ProtocolAdded(protocolId, name, protocolAddress, chainSelector);

        return protocolId;
    }

    /**
     * @notice Detect yield opportunities across protocols
     * @param token Token to analyze
     * @param amount Amount to consider
     * @param duration Duration for the opportunity
     */
    function detectYieldOpportunities(
        address token,
        uint256 amount,
        uint256 duration
    ) external onlyAnalyst tokenTracked(token) returns (bytes32[] memory foundOpportunities) {
        require(amount > 0, "Invalid amount");
        require(duration > 0, "Invalid duration");

        // Analyze all protocols for this token
        uint256 opportunityCount = 0;
        bytes32[] memory tempOpportunities = new bytes32[](10); // Max 10 opportunities

        // Check for high yield supply opportunities
        for (uint256 i = 0; i < protocolIds.length; i++) {
            bytes32 protocolId = protocolIds[i];
            LendingProtocol memory protocol = lendingProtocols[protocolId];
            
            if (protocol.isActive && opportunityCount < 10) {
                bytes32 opportunityId = _analyzeProtocolOpportunity(
                    protocolId, token, amount, duration
                );
                
                if (opportunityId != bytes32(0)) {
                    tempOpportunities[opportunityCount] = opportunityId;
                    opportunityCount++;
                }
            }
        }

        // Resize array to actual count
        foundOpportunities = new bytes32[](opportunityCount);
        for (uint256 i = 0; i < opportunityCount; i++) {
            foundOpportunities[i] = tempOpportunities[i];
        }

        return foundOpportunities;
    }

    /**
     * @notice Update rates for all protocols on a specific chain
     * @param chainSelector Chain to update rates for
     */
    function updateProtocolRates(uint64 chainSelector) external onlyAnalyst chainSupported(chainSelector) {
        for (uint256 i = 0; i < protocolIds.length; i++) {
            bytes32 protocolId = protocolIds[i];
            LendingProtocol storage protocol = lendingProtocols[protocolId];
            
            if (protocol.chainSelector == chainSelector && protocol.isActive) {
                // Request rate update via Functions
                _requestRateUpdate(protocolId);
            }
        }
    }

    /**
     * @notice Analyze cross-chain arbitrage opportunities
     * @param token Token to analyze
     */
    function analyzeCrossChainArbitrage(address token) external onlyAnalyst tokenTracked(token) {
        // Compare rates across all supported chains
        uint256 bestSupplyRate = 0;
        uint256 worstBorrowRate = type(uint256).max;
        uint64 bestSupplyChain = 0;
        uint64 bestBorrowChain = 0;

        for (uint256 i = 0; i < protocolIds.length; i++) {
            bytes32 protocolId = protocolIds[i];
            LendingProtocol memory protocol = lendingProtocols[protocolId];
            
            if (protocol.isActive) {
                if (protocol.avgSupplyRate > bestSupplyRate) {
                    bestSupplyRate = protocol.avgSupplyRate;
                    bestSupplyChain = protocol.chainSelector;
                }
                
                if (protocol.avgBorrowRate < worstBorrowRate) {
                    worstBorrowRate = protocol.avgBorrowRate;
                    bestBorrowChain = protocol.chainSelector;
                }
            }
        }

        // Check if arbitrage opportunity exists
        if (bestSupplyRate > worstBorrowRate + MIN_ARBITRAGE_SPREAD) {
            uint256 rateSpread = bestSupplyRate - worstBorrowRate;
            
            emit ArbitrageOpportunityFound(
                token,
                bestBorrowChain,
                bestSupplyChain,
                rateSpread
            );

            // Create yield opportunity
            _createArbitrageOpportunity(
                token,
                bestSupplyChain,
                bestBorrowChain,
                rateSpread
            );
        }
    }

    /**
     * @notice Handle Chainlink Functions responses
     */
    function _fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
        if (err.length > 0) {
            // Handle error
            LendingMarketAnalysis storage errorAnalysis = marketAnalyses[requestId];
            errorAnalysis.status = AnalysisStatus.FAILED;
            return;
        }

        // Decode analysis response
        (
            uint256 supplyRate,
            uint256 borrowRate,
            uint256 utilization,
            uint256 liquidity,
            uint256 confidence
        ) = abi.decode(response, (uint256, uint256, uint256, uint256, uint256));

        // Update analysis
        LendingMarketAnalysis storage analysis = marketAnalyses[requestId];
        analysis.supplyRate = supplyRate;
        analysis.borrowRate = borrowRate;
        analysis.utilization = utilization;
        analysis.liquidity = liquidity;
        analysis.confidence = confidence;
        analysis.status = AnalysisStatus.COMPLETED;

        totalAnalysesCompleted++;

        emit LendingMarketAnalysisCompleted(
            requestId,
            analysis.protocol,
            supplyRate,
            borrowRate
        );

        // Update protocol data
        _updateProtocolMetrics(requestId, analysis);
    }

    /**
     * @notice Chainlink Automation upkeep check
     */
    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData) {
        bool needsRateUpdate = (block.timestamp - lastMaintenanceTime) > RATE_UPDATE_INTERVAL;
        bool needsProtocolScan = _needsProtocolScan();
        bool needsOpportunityUpdate = _needsOpportunityUpdate();

        upkeepNeeded = needsRateUpdate || needsProtocolScan || needsOpportunityUpdate;
        
        if (upkeepNeeded) {
            performData = abi.encode(needsRateUpdate, needsProtocolScan, needsOpportunityUpdate);
        }
    }

    /**
     * @notice Chainlink Automation upkeep performance
     */
    function performUpkeep(bytes calldata performData) external override {
        (bool needsRateUpdate, bool needsProtocolScan, bool needsOpportunityUpdate) = 
            abi.decode(performData, (bool, bool, bool));

        if (needsRateUpdate) {
            _performRateUpdates();
        }
        
        if (needsProtocolScan) {
            _scanForNewProtocols();
        }
        
        if (needsOpportunityUpdate) {
            _updateYieldOpportunities();
        }
        
        lastMaintenanceTime = block.timestamp;
    }

    // Internal functions
    function _sendLendingAnalysisRequest(
        bytes32 requestId,
        address protocol,
        address token,
        uint64 chainSelector
    ) internal {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(
            "const protocol = args[0];"
            "const token = args[1];"
            "const chainSelector = args[2];"
            ""
            "// Fetch protocol data from various sources"
            "const responses = await Promise.all(["
            "  Functions.makeHttpRequest({"
            "    url: `https://api.defipulse.com/v1/protocols/${protocol}/rates`,"
            "    params: { token, chain: chainSelector }"
            "  }),"
            "  Functions.makeHttpRequest({"
            "    url: `https://api.debank.com/v1/protocol/${protocol}/lending`,"
            "    params: { token, chain: chainSelector }"
            "  }),"
            "  Functions.makeHttpRequest({"
            "    url: `https://api.crosschaindefi.com/lending/analyze`,"
            "    method: 'POST',"
            "    headers: { 'Content-Type': 'application/json' },"
            "    data: { protocol, token, chainSelector }"
            "  })"
            "]);"
            ""
            "// Aggregate and analyze data"
            "const analysisResult = {"
            "  supplyRate: responses[2].data.supplyRate,"
            "  borrowRate: responses[2].data.borrowRate,"
            "  utilization: responses[2].data.utilization,"
            "  liquidity: responses[2].data.liquidity,"
            "  confidence: responses[2].data.confidence"
            "};"
            ""
            "return Functions.encodeBytes("
            "  Functions.encodeUint256(analysisResult.supplyRate),"
            "  Functions.encodeUint256(analysisResult.borrowRate),"
            "  Functions.encodeUint256(analysisResult.utilization),"
            "  Functions.encodeUint256(analysisResult.liquidity),"
            "  Functions.encodeUint256(analysisResult.confidence)"
            ");"
        );
        
        string[] memory args = new string[](3);
        args[0] = _addressToString(protocol);
        args[1] = _addressToString(token);
        args[2] = _uint256ToString(chainSelector);
        req.setArgs(args);

        marketAnalyses[requestId].status = AnalysisStatus.IN_PROGRESS;

        _sendRequest(req.encodeCBOR(), uint64(subscriptionId), 300000, donId);
    }

    function _analyzeProtocolOpportunity(
        bytes32 protocolId,
        address token,
        uint256 amount,
        uint256 duration
    ) internal returns (bytes32 opportunityId) {
        LendingProtocol memory protocol = lendingProtocols[protocolId];
        
        // Calculate expected yield
        uint256 expectedYield = (amount * protocol.avgSupplyRate * duration) / (365 days * 10000);
        
        // Check if it's a good opportunity (above average)
        TokenMetrics memory metrics = tokenMetrics[token];
        if (expectedYield > metrics.avgSupplyRate * amount * duration / (365 days * 10000)) {
            opportunityId = keccak256(abi.encodePacked(
                protocolId, token, amount, duration, block.timestamp
            ));
            
            yieldOpportunities[opportunityId] = YieldOpportunity({
                opportunityId: opportunityId,
                protocol: protocol.protocolAddress,
                token: token,
                chainSelector: protocol.chainSelector,
                opportunityType: OpportunityType.HIGH_YIELD_SUPPLY,
                expectedYield: expectedYield,
                riskScore: protocol.riskRating,
                minAmount: amount / 10, // 10% minimum
                maxAmount: amount * 5, // 5x maximum
                duration: duration,
                confidence: 80, // Default confidence
                timestamp: block.timestamp,
                isActive: true
            });
            
            opportunityIds.push(opportunityId);
            totalOpportunitiesFound++;
            
            emit YieldOpportunityDetected(
                opportunityId,
                protocol.protocolAddress,
                token,
                OpportunityType.HIGH_YIELD_SUPPLY,
                expectedYield
            );
        }
        
        return opportunityId;
    }

    function _createArbitrageOpportunity(
        address token,
        uint64 supplyChain,
        uint64 borrowChain,
        uint256 rateSpread
    ) internal {
        bytes32 opportunityId = keccak256(abi.encodePacked(
            token, supplyChain, borrowChain, rateSpread, block.timestamp
        ));
        
        yieldOpportunities[opportunityId] = YieldOpportunity({
            opportunityId: opportunityId,
            protocol: address(0), // Cross-chain opportunity
            token: token,
            chainSelector: supplyChain,
            opportunityType: OpportunityType.ARBITRAGE,
            expectedYield: rateSpread,
            riskScore: 30, // Lower risk for arbitrage
            minAmount: 1000 * 1e18, // $1000 minimum
            maxAmount: 100000 * 1e18, // $100k maximum
            duration: 1 days,
            confidence: 90,
            timestamp: block.timestamp,
            isActive: true
        });
        
        opportunityIds.push(opportunityId);
        totalOpportunitiesFound++;
        
        emit YieldOpportunityDetected(
            opportunityId,
            address(0),
            token,
            OpportunityType.ARBITRAGE,
            rateSpread
        );
    }

    function _updateProtocolMetrics(bytes32 requestId, LendingMarketAnalysis memory analysis) internal {
        // Find protocol and update metrics
        for (uint256 i = 0; i < protocolIds.length; i++) {
            bytes32 protocolId = protocolIds[i];
            LendingProtocol storage protocol = lendingProtocols[protocolId];
            
            if (protocol.protocolAddress == analysis.protocol && 
                protocol.chainSelector == analysis.chainSelector) {
                protocol.avgSupplyRate = analysis.supplyRate;
                protocol.avgBorrowRate = analysis.borrowRate;
                protocol.lastUpdated = block.timestamp;
                break;
            }
        }
        
        // Update token metrics
        TokenMetrics storage metrics = tokenMetrics[analysis.token];
        metrics.lastUpdated = block.timestamp;
        // Would aggregate data from all chains/protocols for this token
    }

    function _requestRateUpdate(bytes32 protocolId) internal {
        // Implementation for requesting rate updates
        // Would send Functions request to get latest rates
    }

    function _needsProtocolScan() internal view returns (bool) {
        return (block.timestamp - lastMaintenanceTime) > PROTOCOL_SCAN_INTERVAL;
    }

    function _needsOpportunityUpdate() internal view returns (bool) {
        // Check if opportunities need updating
        return opportunityIds.length > 0 && 
               (block.timestamp - lastMaintenanceTime) > 30 minutes;
    }

    function _performRateUpdates() internal {
        // Update rates for all active protocols
        for (uint256 i = 0; i < protocolIds.length; i++) {
            bytes32 protocolId = protocolIds[i];
            if (lendingProtocols[protocolId].isActive) {
                _requestRateUpdate(protocolId);
            }
        }
    }

    function _scanForNewProtocols() internal {
        // Scan for new lending protocols across supported chains
        // This would use Functions to discover new protocols
    }

    function _updateYieldOpportunities() internal {
        // Update existing opportunities and deactivate expired ones
        for (uint256 i = 0; i < opportunityIds.length; i++) {
            bytes32 opportunityId = opportunityIds[i];
            YieldOpportunity storage opportunity = yieldOpportunities[opportunityId];
            
            if (opportunity.isActive && 
                block.timestamp > opportunity.timestamp + opportunity.duration) {
                opportunity.isActive = false;
            }
        }
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

    function _uint256ToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }

    // Admin functions
    function addTrackedToken(address token, address priceFeed) external onlyRole(DEFAULT_ADMIN_ROLE) {
        trackedTokens[token] = true;
        priceFeeds[token] = AggregatorV3Interface(priceFeed);
        trackedTokensList.push(token);
        
        // Initialize token metrics
        tokenMetrics[token] = TokenMetrics({
            token: token,
            totalSupplyAcrossChains: 0,
            totalBorrowAcrossChains: 0,
            avgSupplyRate: 0,
            avgBorrowRate: 0,
            volatility: 0,
            liquidityScore: 50,
            lastUpdated: block.timestamp
        });
    }

    function addSupportedChain(uint64 chainSelector) external onlyRole(DEFAULT_ADMIN_ROLE) {
        supportedChains[chainSelector] = true;
    }

    function setAgentAddresses(
        address _arbitrageCoordinatorAgent
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        arbitrageCoordinatorAgent = _arbitrageCoordinatorAgent;
    }

    function updateProtocolRiskRating(
        bytes32 protocolId,
        uint256 newRiskRating
    ) external onlyRole(STRATEGY_ROLE) {
        require(newRiskRating <= 100, "Invalid risk rating");
        lendingProtocols[protocolId].riskRating = newRiskRating;
    }

    function emergencyPause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function emergencyUnpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // View functions
    function getLendingMarketAnalysis(bytes32 requestId) external view returns (LendingMarketAnalysis memory) {
        return marketAnalyses[requestId];
    }

    function getYieldOpportunity(bytes32 opportunityId) external view returns (YieldOpportunity memory) {
        return yieldOpportunities[opportunityId];
    }

    function getLendingProtocol(bytes32 protocolId) external view returns (LendingProtocol memory) {
        return lendingProtocols[protocolId];
    }

    function getTokenMetrics(address token) external view returns (TokenMetrics memory) {
        return tokenMetrics[token];
    }

    function getRateAnalysis(address token, uint64 chainSelector) external view returns (RateAnalysis memory) {
        return rateAnalyses[token][chainSelector];
    }

    function getActiveOpportunities() external view returns (bytes32[] memory) {
        bytes32[] memory active = new bytes32[](opportunityIds.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < opportunityIds.length; i++) {
            if (yieldOpportunities[opportunityIds[i]].isActive) {
                active[count] = opportunityIds[i];
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

    function getBestRatesForToken(address token) external view returns (
        uint256 bestSupplyRate,
        uint256 bestBorrowRate,
        address bestSupplyProtocol,
        address bestBorrowProtocol,
        uint64 bestSupplyChain,
        uint64 bestBorrowChain
    ) {
        bestSupplyRate = 0;
        bestBorrowRate = type(uint256).max;

        for (uint256 i = 0; i < protocolIds.length; i++) {
            bytes32 protocolId = protocolIds[i];
            LendingProtocol memory protocol = lendingProtocols[protocolId];
            
            if (protocol.isActive) {
                if (protocol.avgSupplyRate > bestSupplyRate) {
                    bestSupplyRate = protocol.avgSupplyRate;
                    bestSupplyProtocol = protocol.protocolAddress;
                    bestSupplyChain = protocol.chainSelector;
                }
                
                if (protocol.avgBorrowRate < bestBorrowRate) {
                    bestBorrowRate = protocol.avgBorrowRate;
                    bestBorrowProtocol = protocol.protocolAddress;
                    bestBorrowChain = protocol.chainSelector;
                }
            }
        }
    }

    function getAgentStats() external view returns (
        uint256 _totalAnalyses,
        uint256 _totalOpportunities,
        uint256 _totalProtocols,
        uint256 _analysisAccuracy,
        uint256 _trackedTokens
    ) {
        return (
            totalAnalysesCompleted,
            totalOpportunitiesFound,
            totalProtocolsTracked,
            avgAnalysisAccuracy,
            trackedTokensList.length
        );
    }

    function getTrackedTokens() external view returns (address[] memory) {
        return trackedTokensList;
    }

    function getProtocolsByChain(uint64 chainSelector) external view returns (bytes32[] memory) {
        bytes32[] memory chainProtocols = new bytes32[](protocolIds.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < protocolIds.length; i++) {
            bytes32 protocolId = protocolIds[i];
            if (lendingProtocols[protocolId].chainSelector == chainSelector && 
                lendingProtocols[protocolId].isActive) {
                chainProtocols[count] = protocolId;
                count++;
            }
        }
        
        // Resize array
        bytes32[] memory result = new bytes32[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = chainProtocols[i];
        }
        
        return result;
    }
} 