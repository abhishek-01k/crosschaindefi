// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {CCIPReceiver} from "@chainlink/contracts-ccip/contracts/applications/CCIPReceiver.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts/src/v0.8/shared/access/OwnerIsCreator.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CrossChainDepositor
 * @author CrossChainDefi Team
 * @notice Handles asset deposits from source chains to the hub with AI-powered optimization
 * @dev Supports multi-asset deposits, cross-chain messaging via CCIP, and automated yield strategies
 */
contract CrossChainDepositor is 
    CCIPReceiver,
    AutomationCompatibleInterface,
    OwnerIsCreator,
    ReentrancyGuard,
    Pausable,
    AccessControl
{
    // Override supportsInterface to resolve conflicts between CCIPReceiver and AccessControl
    function supportsInterface(bytes4 interfaceId) public view virtual override(CCIPReceiver, AccessControl) returns (bool) {
        return CCIPReceiver.supportsInterface(interfaceId) || AccessControl.supportsInterface(interfaceId);
    }
    using SafeERC20 for IERC20;

    // Role definitions
    bytes32 public constant HUB_ROLE = keccak256("HUB_ROLE");
    bytes32 public constant STRATEGY_ROLE = keccak256("STRATEGY_ROLE");
    bytes32 public constant KEEPER_ROLE = keccak256("KEEPER_ROLE");

    // Structs
    struct DepositInfo {
        address user;
        address token;
        uint256 amount;
        uint64 destinationChain;
        uint256 timestamp;
        DepositStatus status;
        bytes32 ccipMessageId;
        uint256 yieldEarned;
        StrategyType strategy;
    }

    struct TokenConfig {
        bool isSupported;
        uint256 minDeposit;
        uint256 maxDeposit;
        uint256 depositFee; // in basis points
        address priceFeed;
        bool yieldEnabled;
        uint256 yieldRate; // APY in basis points
    }

    struct YieldStrategy {
        string name;
        address strategyContract;
        uint256 expectedAPY;
        uint256 riskLevel; // 1-10 scale
        uint256 minAmount;
        bool isActive;
        uint256 totalDeposited;
        uint256 totalYieldGenerated;
    }

    struct UserProfile {
        uint256 totalDeposited;
        uint256 totalYieldEarned;
        uint256 depositCount;
        mapping(address => uint256) tokenBalances;
        mapping(address => uint256) yieldBalances;
        uint256 lastDepositTime;
        uint256 riskTolerance; // 1-10 scale
        bool autoYieldEnabled;
        StrategyType preferredStrategy;
    }

    struct CrossChainMessage {
        address user;
        address token;
        uint256 amount;
        uint256 timestamp;
        MessageType messageType;
        bytes additionalData;
    }

    enum DepositStatus {
        PENDING,
        PROCESSING,
        SENT_TO_HUB,
        CONFIRMED,
        FAILED
    }

    enum StrategyType {
        CONSERVATIVE,
        BALANCED,
        AGGRESSIVE,
        CUSTOM,
        AUTO_OPTIMIZED
    }

    enum MessageType {
        DEPOSIT,
        WITHDRAW,
        YIELD_CLAIM,
        STRATEGY_UPDATE
    }

    // Constants
    uint256 public constant MAX_DEPOSIT_FEE = 1000; // 10% max fee
    uint256 public constant MIN_DEPOSIT_AMOUNT = 1e6; // $1 minimum
    uint256 public constant YIELD_COMPOUND_INTERVAL = 1 days;
    uint256 public constant STRATEGY_REBALANCE_INTERVAL = 7 days;
    uint256 public constant PRECISION = 1e18;

    // Chainlink configuration
    LinkTokenInterface public immutable linkToken;
    uint64 public immutable hubChainSelector;
    address public immutable hubContract;

    // State variables
    mapping(bytes32 => DepositInfo) public deposits;
    mapping(address => TokenConfig) public tokenConfigs;
    mapping(uint256 => YieldStrategy) public yieldStrategies;
    mapping(address => UserProfile) public userProfiles;
    mapping(bytes32 => CrossChainMessage) public crossChainMessages;
    mapping(address => mapping(address => uint256)) public userTokenDeposits;
    mapping(address => uint256) public tokenTotalDeposits;

    uint256 public totalValueLocked;
    uint256 public totalYieldGenerated;
    uint256 public totalDepositsCount;
    uint256 public protocolFees;
    uint256 public lastMaintenanceTime;
    uint256 public strategiesCount;

    bytes32[] public depositIds;
    address[] public supportedTokens;

    // Events
    event DepositInitiated(
        bytes32 indexed depositId,
        address indexed user,
        address indexed token,
        uint256 amount,
        uint64 destinationChain
    );

    event DepositSentToHub(
        bytes32 indexed depositId,
        bytes32 indexed ccipMessageId,
        address indexed user,
        uint256 amount
    );

    event DepositConfirmed(
        bytes32 indexed depositId,
        address indexed user,
        uint256 finalAmount
    );

    event YieldEarned(
        address indexed user,
        address indexed token,
        uint256 yieldAmount,
        StrategyType strategy
    );

    event StrategyUpdated(
        address indexed user,
        StrategyType oldStrategy,
        StrategyType newStrategy
    );

    event TokenConfigUpdated(
        address indexed token,
        uint256 minDeposit,
        uint256 maxDeposit,
        uint256 depositFee
    );

    event YieldStrategyAdded(
        uint256 indexed strategyId,
        string name,
        address strategyContract,
        uint256 expectedAPY
    );

    event AutoYieldCompounded(
        address indexed user,
        address indexed token,
        uint256 compoundedAmount
    );

    // Custom errors
    error TokenNotSupported(address token);
    error InsufficientAmount(uint256 amount, uint256 minimum);
    error ExcessiveAmount(uint256 amount, uint256 maximum);
    error DepositNotFound(bytes32 depositId);
    error UnauthorizedAccess(address caller);
    error InvalidDestinationChain(uint64 chainSelector);
    error InsufficientBalance(uint256 requested, uint256 available);
    error YieldStrategyNotFound(uint256 strategyId);
    error InvalidRiskTolerance(uint256 riskTolerance);

    modifier tokenSupported(address token) {
        if (!tokenConfigs[token].isSupported) revert TokenNotSupported(token);
        _;
    }

    modifier validAmount(address token, uint256 amount) {
        TokenConfig memory config = tokenConfigs[token];
        if (amount < config.minDeposit) revert InsufficientAmount(amount, config.minDeposit);
        if (amount > config.maxDeposit) revert ExcessiveAmount(amount, config.maxDeposit);
        _;
    }

    constructor(
        address _router,
        address _linkToken,
        uint64 _hubChainSelector,
        address _hubContract
    ) CCIPReceiver(_router) {
        linkToken = LinkTokenInterface(_linkToken);
        hubChainSelector = _hubChainSelector;
        hubContract = _hubContract;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(HUB_ROLE, _hubContract);
        
        lastMaintenanceTime = block.timestamp;
    }

    /**
     * @notice Deposit tokens with optional yield strategy
     * @param token Token address to deposit
     * @param amount Amount to deposit
     * @param strategy Yield strategy to use
     * @param enableAutoCompound Whether to enable auto-compounding
     */
    function deposit(
        address token,
        uint256 amount,
        StrategyType strategy,
        bool enableAutoCompound
    ) external nonReentrant whenNotPaused tokenSupported(token) validAmount(token, amount) returns (bytes32 depositId) {
        
        // Transfer tokens from user
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // Calculate deposit fee
        TokenConfig memory config = tokenConfigs[token];
        uint256 fee = (amount * config.depositFee) / 10000;
        uint256 netAmount = amount - fee;

        // Update protocol fees
        protocolFees += fee;

        // Create deposit record
        depositId = keccak256(abi.encodePacked(
            msg.sender, token, amount, block.timestamp, totalDepositsCount
        ));

        deposits[depositId] = DepositInfo({
            user: msg.sender,
            token: token,
            amount: netAmount,
            destinationChain: hubChainSelector,
            timestamp: block.timestamp,
            status: DepositStatus.PENDING,
            ccipMessageId: bytes32(0),
            yieldEarned: 0,
            strategy: strategy
        });

        // Update user profile
        UserProfile storage userProfile = userProfiles[msg.sender];
        userProfile.totalDeposited += netAmount;
        userProfile.depositCount++;
        userProfile.tokenBalances[token] += netAmount;
        userProfile.lastDepositTime = block.timestamp;
        userProfile.autoYieldEnabled = enableAutoCompound;
        userProfile.preferredStrategy = strategy;

        // Update global state
        userTokenDeposits[msg.sender][token] += netAmount;
        tokenTotalDeposits[token] += netAmount;
        totalValueLocked += _getTokenValueInUSD(token, netAmount);
        totalDepositsCount++;
        depositIds.push(depositId);

        emit DepositInitiated(depositId, msg.sender, token, netAmount, hubChainSelector);

        // Apply yield strategy if enabled
        if (config.yieldEnabled && strategy != StrategyType.CONSERVATIVE) {
            _applyYieldStrategy(msg.sender, token, netAmount, strategy);
        }

        // Send to hub via CCIP
        _sendDepositToHub(depositId, msg.sender, token, netAmount);

        return depositId;
    }

    /**
     * @notice Withdraw deposited tokens
     * @param token Token address to withdraw
     * @param amount Amount to withdraw
     */
    function withdraw(
        address token,
        uint256 amount
    ) external nonReentrant whenNotPaused tokenSupported(token) {
        UserProfile storage userProfile = userProfiles[msg.sender];
        
        if (userProfile.tokenBalances[token] < amount) {
            revert InsufficientBalance(amount, userProfile.tokenBalances[token]);
        }

        // Calculate any pending yield
        uint256 pendingYield = _calculatePendingYield(msg.sender, token);
        
        // Update user profile
        userProfile.tokenBalances[token] -= amount;
        userProfile.totalDeposited -= amount;
        
        if (pendingYield > 0) {
            userProfile.yieldBalances[token] += pendingYield;
            userProfile.totalYieldEarned += pendingYield;
        }

        // Update global state
        userTokenDeposits[msg.sender][token] -= amount;
        tokenTotalDeposits[token] -= amount;
        totalValueLocked -= _getTokenValueInUSD(token, amount);

        // Transfer tokens to user
        IERC20(token).safeTransfer(msg.sender, amount);

        // Send withdrawal message to hub
        _sendWithdrawalToHub(msg.sender, token, amount);
    }

    /**
     * @notice Claim accumulated yield
     * @param token Token address to claim yield for
     */
    function claimYield(address token) external nonReentrant whenNotPaused tokenSupported(token) {
        UserProfile storage userProfile = userProfiles[msg.sender];
        
        uint256 pendingYield = _calculatePendingYield(msg.sender, token);
        uint256 totalYield = userProfile.yieldBalances[token] + pendingYield;
        
        require(totalYield > 0, "No yield to claim");

        // Update user profile
        userProfile.yieldBalances[token] = 0;
        userProfile.totalYieldEarned += pendingYield;

        // Update global state
        totalYieldGenerated += totalYield;

        // Transfer yield to user
        IERC20(token).safeTransfer(msg.sender, totalYield);

        emit YieldEarned(msg.sender, token, totalYield, userProfile.preferredStrategy);
    }

    /**
     * @notice Update user's yield strategy
     * @param newStrategy New strategy to use
     * @param riskTolerance Risk tolerance level (1-10)
     */
    function updateStrategy(
        StrategyType newStrategy,
        uint256 riskTolerance
    ) external whenNotPaused {
        if (riskTolerance == 0 || riskTolerance > 10) {
            revert InvalidRiskTolerance(riskTolerance);
        }

        UserProfile storage userProfile = userProfiles[msg.sender];
        StrategyType oldStrategy = userProfile.preferredStrategy;
        
        userProfile.preferredStrategy = newStrategy;
        userProfile.riskTolerance = riskTolerance;

        emit StrategyUpdated(msg.sender, oldStrategy, newStrategy);
    }

    /**
     * @notice Handle CCIP received messages
     */
    function _ccipReceive(Client.Any2EVMMessage memory message) internal override {
        bytes32 messageId = message.messageId;
        address sender = abi.decode(message.sender, (address));
        
        // Only accept messages from hub
        require(sender == hubContract, "Unauthorized sender");

        // Decode message data
        (MessageType messageType, bytes memory data) = abi.decode(message.data, (MessageType, bytes));

        if (messageType == MessageType.DEPOSIT) {
            _handleDepositConfirmation(messageId, data);
        } else if (messageType == MessageType.WITHDRAW) {
            _handleWithdrawalConfirmation(messageId, data);
        } else if (messageType == MessageType.YIELD_CLAIM) {
            _handleYieldClaimConfirmation(messageId, data);
        }
    }

    /**
     * @notice Chainlink Automation upkeep check
     */
    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData) {
        bool needsYieldCompounding = _needsYieldCompounding();
        bool needsStrategyRebalancing = _needsStrategyRebalancing();
        bool needsMaintenance = (block.timestamp - lastMaintenanceTime) > 1 hours;

        upkeepNeeded = needsYieldCompounding || needsStrategyRebalancing || needsMaintenance;
        
        if (upkeepNeeded) {
            performData = abi.encode(needsYieldCompounding, needsStrategyRebalancing, needsMaintenance);
        }
    }

    /**
     * @notice Chainlink Automation upkeep performance
     */
    function performUpkeep(bytes calldata performData) external override {
        (bool needsYieldCompounding, bool needsStrategyRebalancing, bool needsMaintenance) = 
            abi.decode(performData, (bool, bool, bool));

        if (needsYieldCompounding) {
            _performYieldCompounding();
        }
        
        if (needsStrategyRebalancing) {
            _performStrategyRebalancing();
        }
        
        if (needsMaintenance) {
            _performMaintenance();
        }
        
        lastMaintenanceTime = block.timestamp;
    }

    // Internal functions
    function _sendDepositToHub(
        bytes32 depositId,
        address user,
        address token,
        uint256 amount
    ) internal {
        // Prepare token transfer
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: token,
            amount: amount
        });

        // Prepare message
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(hubContract),
            data: abi.encode(MessageType.DEPOSIT, abi.encode(depositId, user, token, amount)),
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 300_000})
            ),
            feeToken: address(linkToken)
        });

        // Get router and calculate fees
        IRouterClient router = IRouterClient(this.getRouter());
        uint256 fees = router.getFee(hubChainSelector, message);

        // Approve tokens and LINK
        IERC20(token).approve(address(router), amount);
        linkToken.approve(address(router), fees);

        // Send message
        bytes32 ccipMessageId = router.ccipSend(hubChainSelector, message);

        // Update deposit status
        deposits[depositId].status = DepositStatus.SENT_TO_HUB;
        deposits[depositId].ccipMessageId = ccipMessageId;

        emit DepositSentToHub(depositId, ccipMessageId, user, amount);
    }

    function _sendWithdrawalToHub(
        address user,
        address token,
        uint256 amount
    ) internal {
        // Prepare message for withdrawal
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(hubContract),
            data: abi.encode(MessageType.WITHDRAW, abi.encode(user, token, amount)),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 200_000})
            ),
            feeToken: address(linkToken)
        });

        // Get router and send
        IRouterClient router = IRouterClient(this.getRouter());
        uint256 fees = router.getFee(hubChainSelector, message);
        
        linkToken.approve(address(router), fees);
        router.ccipSend(hubChainSelector, message);
    }

    function _applyYieldStrategy(
        address user,
        address token,
        uint256 amount,
        StrategyType strategy
    ) internal {
        // Implementation would integrate with various DeFi protocols
        // For now, we'll simulate yield generation
        
        UserProfile storage userProfile = userProfiles[user];
        TokenConfig memory config = tokenConfigs[token];
        
        if (config.yieldEnabled) {
            // Calculate expected yield based on strategy
            uint256 expectedYield = _calculateExpectedYield(amount, strategy, config.yieldRate);
            userProfile.yieldBalances[token] += expectedYield;
        }
    }

    function _calculatePendingYield(address user, address token) internal view returns (uint256) {
        UserProfile storage userProfile = userProfiles[user];
        TokenConfig memory config = tokenConfigs[token];
        
        if (!config.yieldEnabled) return 0;
        
        uint256 timeElapsed = block.timestamp - userProfile.lastDepositTime;
        uint256 principal = userProfile.tokenBalances[token];
        
        // Simple yield calculation (in production, this would be more sophisticated)
        uint256 yield = (principal * config.yieldRate * timeElapsed) / (365 days * 10000);
        
        return yield;
    }

    function _calculateExpectedYield(
        uint256 amount,
        StrategyType strategy,
        uint256 baseYieldRate
    ) internal pure returns (uint256) {
        uint256 multiplier = 10000; // 100% base
        
        if (strategy == StrategyType.CONSERVATIVE) {
            multiplier = 8000; // 80% of base rate
        } else if (strategy == StrategyType.BALANCED) {
            multiplier = 10000; // 100% of base rate
        } else if (strategy == StrategyType.AGGRESSIVE) {
            multiplier = 15000; // 150% of base rate
        }
        
        return (amount * baseYieldRate * multiplier) / (10000 * 10000);
    }

    function _getTokenValueInUSD(address token, uint256 amount) internal view returns (uint256) {
        TokenConfig memory config = tokenConfigs[token];
        if (config.priceFeed == address(0)) return 0;
        
        AggregatorV3Interface priceFeed = AggregatorV3Interface(config.priceFeed);
        (, int256 price, , , ) = priceFeed.latestRoundData();
        
        return (amount * uint256(price) * 1e10) / PRECISION; // Convert to 18 decimals
    }

    function _handleDepositConfirmation(bytes32 messageId, bytes memory data) internal {
        (bytes32 depositId, uint256 finalAmount) = abi.decode(data, (bytes32, uint256));
        
        deposits[depositId].status = DepositStatus.CONFIRMED;
        
        emit DepositConfirmed(depositId, deposits[depositId].user, finalAmount);
    }

    function _handleWithdrawalConfirmation(bytes32 messageId, bytes memory data) internal {
        // Handle withdrawal confirmation from hub
    }

    function _handleYieldClaimConfirmation(bytes32 messageId, bytes memory data) internal {
        // Handle yield claim confirmation from hub
    }

    function _needsYieldCompounding() internal view returns (bool) {
        // Check if any users need yield compounding
        return (block.timestamp - lastMaintenanceTime) > YIELD_COMPOUND_INTERVAL;
    }

    function _needsStrategyRebalancing() internal view returns (bool) {
        // Check if strategies need rebalancing
        return (block.timestamp - lastMaintenanceTime) > STRATEGY_REBALANCE_INTERVAL;
    }

    function _performYieldCompounding() internal {
        // Compound yield for users with auto-compound enabled
        // This would iterate through users and compound their yields
    }

    function _performStrategyRebalancing() internal {
        // Rebalance yield strategies based on market conditions
        // This would analyze performance and adjust allocations
    }

    function _performMaintenance() internal {
        // Perform regular maintenance tasks
        // Clean up old data, update configurations, etc.
    }

    // Admin functions
    function addSupportedToken(
        address token,
        uint256 minDeposit,
        uint256 maxDeposit,
        uint256 depositFee,
        address priceFeed,
        bool yieldEnabled,
        uint256 yieldRate
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(depositFee <= MAX_DEPOSIT_FEE, "Fee too high");
        
        tokenConfigs[token] = TokenConfig({
            isSupported: true,
            minDeposit: minDeposit,
            maxDeposit: maxDeposit,
            depositFee: depositFee,
            priceFeed: priceFeed,
            yieldEnabled: yieldEnabled,
            yieldRate: yieldRate
        });
        
        supportedTokens.push(token);
        
        emit TokenConfigUpdated(token, minDeposit, maxDeposit, depositFee);
    }

    function addYieldStrategy(
        string memory name,
        address strategyContract,
        uint256 expectedAPY,
        uint256 riskLevel,
        uint256 minAmount
    ) external onlyRole(STRATEGY_ROLE) {
        require(riskLevel >= 1 && riskLevel <= 10, "Invalid risk level");
        
        yieldStrategies[strategiesCount] = YieldStrategy({
            name: name,
            strategyContract: strategyContract,
            expectedAPY: expectedAPY,
            riskLevel: riskLevel,
            minAmount: minAmount,
            isActive: true,
            totalDeposited: 0,
            totalYieldGenerated: 0
        });
        
        emit YieldStrategyAdded(strategiesCount, name, strategyContract, expectedAPY);
        strategiesCount++;
    }

    function updateTokenConfig(
        address token,
        uint256 minDeposit,
        uint256 maxDeposit,
        uint256 depositFee,
        uint256 yieldRate
    ) external onlyRole(DEFAULT_ADMIN_ROLE) tokenSupported(token) {
        require(depositFee <= MAX_DEPOSIT_FEE, "Fee too high");
        
        TokenConfig storage config = tokenConfigs[token];
        config.minDeposit = minDeposit;
        config.maxDeposit = maxDeposit;
        config.depositFee = depositFee;
        config.yieldRate = yieldRate;
        
        emit TokenConfigUpdated(token, minDeposit, maxDeposit, depositFee);
    }

    function withdrawProtocolFees(address token, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(amount <= protocolFees, "Insufficient fees");
        
        protocolFees -= amount;
        IERC20(token).safeTransfer(msg.sender, amount);
    }

    function emergencyPause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function emergencyUnpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // View functions
    function getDepositInfo(bytes32 depositId) external view returns (DepositInfo memory) {
        return deposits[depositId];
    }

    function getUserProfile(address user) external view returns (
        uint256 totalDeposited,
        uint256 totalYieldEarned,
        uint256 depositCount,
        uint256 lastDepositTime,
        uint256 riskTolerance,
        bool autoYieldEnabled,
        StrategyType preferredStrategy
    ) {
        UserProfile storage profile = userProfiles[user];
        return (
            profile.totalDeposited,
            profile.totalYieldEarned,
            profile.depositCount,
            profile.lastDepositTime,
            profile.riskTolerance,
            profile.autoYieldEnabled,
            profile.preferredStrategy
        );
    }

    function getUserTokenBalance(address user, address token) external view returns (uint256) {
        return userProfiles[user].tokenBalances[token];
    }

    function getUserYieldBalance(address user, address token) external view returns (uint256) {
        return userProfiles[user].yieldBalances[token] + _calculatePendingYield(user, token);
    }

    function getTokenConfig(address token) external view returns (TokenConfig memory) {
        return tokenConfigs[token];
    }

    function getYieldStrategy(uint256 strategyId) external view returns (YieldStrategy memory) {
        return yieldStrategies[strategyId];
    }

    function getProtocolStats() external view returns (
        uint256 _totalValueLocked,
        uint256 _totalYieldGenerated,
        uint256 _totalDepositsCount,
        uint256 _protocolFees,
        uint256 _supportedTokensCount
    ) {
        return (
            totalValueLocked,
            totalYieldGenerated,
            totalDepositsCount,
            protocolFees,
            supportedTokens.length
        );
    }

    function getSupportedTokens() external view returns (address[] memory) {
        return supportedTokens;
    }

    function getUserDepositHistory(address user) external view returns (bytes32[] memory userDeposits) {
        uint256 count = 0;
        
        // Count user deposits
        for (uint256 i = 0; i < depositIds.length; i++) {
            if (deposits[depositIds[i]].user == user) {
                count++;
            }
        }
        
        // Populate array
        userDeposits = new bytes32[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < depositIds.length; i++) {
            if (deposits[depositIds[i]].user == user) {
                userDeposits[index] = depositIds[i];
                index++;
            }
        }
        
        return userDeposits;
    }
} 