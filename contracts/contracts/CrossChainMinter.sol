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
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CrossChainMinter
 * @author CrossChainDefi Team
 * @notice Manages minting and burning of protocol tokens on destination chains
 * @dev Handles cross-chain token minting/burning, collateralization management, and automated rebalancing
 */
contract CrossChainMinter is 
    CCIPReceiver,
    AutomationCompatibleInterface,
    ERC20,
    ERC20Burnable,
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
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant LIQUIDATOR_ROLE = keccak256("LIQUIDATOR_ROLE");

    // Structs
    struct MintRequest {
        bytes32 requestId;
        address user;
        address collateralToken;
        uint256 collateralAmount;
        uint256 mintAmount;
        uint64 sourceChain;
        uint256 timestamp;
        MintStatus status;
        uint256 healthFactor;
    }

    struct BurnRequest {
        bytes32 requestId;
        address user;
        uint256 burnAmount;
        address collateralToken;
        uint256 collateralToReturn;
        uint64 destinationChain;
        uint256 timestamp;
        BurnStatus status;
    }

    struct UserPosition {
        mapping(address => uint256) collateralBalances;
        uint256 totalMinted;
        uint256 lastUpdateTime;
        uint256 healthFactor;
        uint256 liquidationThreshold;
        bool isActive;
    }

    struct CollateralConfig {
        bool isSupported;
        uint256 collateralizationRatio; // in basis points (e.g., 15000 = 150%)
        uint256 liquidationRatio; // in basis points (e.g., 12000 = 120%)
        uint256 maxMintAmount;
        address priceFeed;
        uint256 stabilityFee; // annual fee in basis points
        bool isActive;
    }

    struct RebalanceOperation {
        bytes32 operationId;
        address token;
        uint256 amount;
        RebalanceType rebalanceType;
        uint64 targetChain;
        uint256 timestamp;
        OperationStatus status;
    }

    enum MintStatus {
        PENDING,
        PROCESSING,
        COMPLETED,
        FAILED,
        EXPIRED
    }

    enum BurnStatus {
        PENDING,
        PROCESSING,
        COMPLETED,
        FAILED,
        EXPIRED
    }

    enum RebalanceType {
        LIQUIDITY_REBALANCE,
        YIELD_OPTIMIZATION,
        RISK_MITIGATION,
        EMERGENCY_WITHDRAWAL
    }

    enum OperationStatus {
        PENDING,
        EXECUTING,
        COMPLETED,
        FAILED
    }

    // Constants
    uint256 public constant MIN_HEALTH_FACTOR = 110; // 110%
    uint256 public constant LIQUIDATION_PENALTY = 500; // 5%
    uint256 public constant MAX_COLLATERALIZATION_RATIO = 30000; // 300%
    uint256 public constant REBALANCE_THRESHOLD = 100; // 1%
    uint256 public constant PRECISION = 1e18;

    // Chainlink configuration
    LinkTokenInterface public immutable linkToken;
    uint64 public immutable hubChainSelector;
    address public immutable hubContract;

    // State variables
    mapping(bytes32 => MintRequest) public mintRequests;
    mapping(bytes32 => BurnRequest) public burnRequests;
    mapping(address => UserPosition) public userPositions;
    mapping(address => CollateralConfig) public collateralConfigs;
    mapping(bytes32 => RebalanceOperation) public rebalanceOperations;
    mapping(address => AggregatorV3Interface) public priceFeeds;
    mapping(address => uint256) public totalCollateral;
    mapping(address => bool) public supportedCollaterals;

    uint256 public totalSupplyMinted;
    uint256 public totalCollateralValue;
    uint256 public protocolFees;
    uint256 public lastRebalanceTime;
    uint256 public stabilityPoolBalance;
    uint256 public liquidationReserve;

    bytes32[] public mintRequestIds;
    bytes32[] public burnRequestIds;
    bytes32[] public rebalanceOperationIds;
    address[] public collateralTokens;

    // Events
    event MintRequested(
        bytes32 indexed requestId,
        address indexed user,
        address indexed collateralToken,
        uint256 collateralAmount,
        uint256 mintAmount
    );

    event TokensMinted(
        bytes32 indexed requestId,
        address indexed user,
        uint256 mintAmount,
        uint256 healthFactor
    );

    event BurnRequested(
        bytes32 indexed requestId,
        address indexed user,
        uint256 burnAmount,
        uint256 collateralToReturn
    );

    event TokensBurned(
        bytes32 indexed requestId,
        address indexed user,
        uint256 burnAmount,
        uint256 collateralReturned
    );

    event PositionLiquidated(
        address indexed user,
        address indexed liquidator,
        address indexed collateralToken,
        uint256 collateralLiquidated,
        uint256 debtRepaid
    );

    event CollateralAdded(
        address indexed token,
        uint256 collateralizationRatio,
        uint256 liquidationRatio
    );

    event RebalanceInitiated(
        bytes32 indexed operationId,
        address indexed token,
        uint256 amount,
        RebalanceType rebalanceType
    );

    event HealthFactorUpdated(
        address indexed user,
        uint256 oldHealthFactor,
        uint256 newHealthFactor
    );

    // Custom errors
    error CollateralNotSupported(address token);
    error InsufficientCollateral(uint256 provided, uint256 required);
    error BelowMinHealthFactor(uint256 healthFactor, uint256 minimum);
    error RequestNotFound(bytes32 requestId);
    error UnauthorizedAccess(address caller);
    error InvalidCollateralizationRatio(uint256 ratio);
    error PositionNotLiquidatable(uint256 healthFactor);
    error InsufficientMintedTokens(uint256 requested, uint256 available);

    modifier collateralSupported(address token) {
        if (!supportedCollaterals[token]) revert CollateralNotSupported(token);
        _;
    }

    modifier onlyHub() {
        if (!hasRole(HUB_ROLE, msg.sender)) revert UnauthorizedAccess(msg.sender);
        _;
    }

    constructor(
        address _router,
        address _linkToken,
        uint64 _hubChainSelector,
        address _hubContract,
        string memory _name,
        string memory _symbol
    ) 
        CCIPReceiver(_router)
        ERC20(_name, _symbol)
    {
        linkToken = LinkTokenInterface(_linkToken);
        hubChainSelector = _hubChainSelector;
        hubContract = _hubContract;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(HUB_ROLE, _hubContract);
        _grantRole(MINTER_ROLE, msg.sender);
        
        lastRebalanceTime = block.timestamp;
    }

    /**
     * @notice Request minting of tokens against collateral
     * @param collateralToken Token to use as collateral
     * @param collateralAmount Amount of collateral to deposit
     * @param mintAmount Amount of tokens to mint
     */
    function requestMint(
        address collateralToken,
        uint256 collateralAmount,
        uint256 mintAmount
    ) external nonReentrant whenNotPaused collateralSupported(collateralToken) returns (bytes32 requestId) {
        require(collateralAmount > 0, "Invalid collateral amount");
        require(mintAmount > 0, "Invalid mint amount");

        // Check collateralization ratio
        CollateralConfig memory config = collateralConfigs[collateralToken];
        uint256 collateralValue = _getCollateralValue(collateralToken, collateralAmount);
        uint256 requiredCollateral = (mintAmount * config.collateralizationRatio) / 10000;
        
        if (collateralValue < requiredCollateral) {
            revert InsufficientCollateral(collateralValue, requiredCollateral);
        }

        // Transfer collateral from user
        IERC20(collateralToken).safeTransferFrom(msg.sender, address(this), collateralAmount);

        // Create mint request
        requestId = keccak256(abi.encodePacked(
            msg.sender, collateralToken, collateralAmount, mintAmount, block.timestamp
        ));

        mintRequests[requestId] = MintRequest({
            requestId: requestId,
            user: msg.sender,
            collateralToken: collateralToken,
            collateralAmount: collateralAmount,
            mintAmount: mintAmount,
            sourceChain: hubChainSelector,
            timestamp: block.timestamp,
            status: MintStatus.PENDING,
            healthFactor: _calculateHealthFactor(msg.sender, collateralToken, collateralAmount, mintAmount)
        });

        mintRequestIds.push(requestId);

        emit MintRequested(requestId, msg.sender, collateralToken, collateralAmount, mintAmount);

        // Process mint if health factor is sufficient
        if (mintRequests[requestId].healthFactor >= MIN_HEALTH_FACTOR) {
            _processMint(requestId);
        }

        return requestId;
    }

    /**
     * @notice Request burning of tokens to retrieve collateral
     * @param burnAmount Amount of tokens to burn
     * @param collateralToken Collateral token to retrieve
     * @param collateralAmount Amount of collateral to retrieve
     */
    function requestBurn(
        uint256 burnAmount,
        address collateralToken,
        uint256 collateralAmount
    ) external nonReentrant whenNotPaused collateralSupported(collateralToken) returns (bytes32 requestId) {
        require(burnAmount > 0, "Invalid burn amount");
        require(collateralAmount > 0, "Invalid collateral amount");

        UserPosition storage position = userPositions[msg.sender];
        require(position.totalMinted >= burnAmount, "Insufficient minted tokens");
        require(position.collateralBalances[collateralToken] >= collateralAmount, "Insufficient collateral");

        // Check if withdrawal maintains healthy position
        uint256 newHealthFactor = _calculateHealthFactorAfterBurn(
            msg.sender, collateralToken, collateralAmount, burnAmount
        );
        
        if (newHealthFactor < MIN_HEALTH_FACTOR && position.totalMinted > burnAmount) {
            revert BelowMinHealthFactor(newHealthFactor, MIN_HEALTH_FACTOR);
        }

        // Create burn request
        requestId = keccak256(abi.encodePacked(
            msg.sender, burnAmount, collateralToken, collateralAmount, block.timestamp
        ));

        burnRequests[requestId] = BurnRequest({
            requestId: requestId,
            user: msg.sender,
            burnAmount: burnAmount,
            collateralToken: collateralToken,
            collateralToReturn: collateralAmount,
            destinationChain: hubChainSelector,
            timestamp: block.timestamp,
            status: BurnStatus.PENDING
        });

        burnRequestIds.push(requestId);

        emit BurnRequested(requestId, msg.sender, burnAmount, collateralAmount);

        // Process burn
        _processBurn(requestId);

        return requestId;
    }

    /**
     * @notice Liquidate an undercollateralized position
     * @param user User to liquidate
     * @param collateralToken Collateral token to liquidate
     * @param maxAmount Maximum amount to liquidate
     */
    function liquidatePosition(
        address user,
        address collateralToken,
        uint256 maxAmount
    ) external nonReentrant whenNotPaused onlyRole(LIQUIDATOR_ROLE) collateralSupported(collateralToken) {
        UserPosition storage position = userPositions[user];
        require(position.isActive, "Position not active");

        uint256 healthFactor = _calculateCurrentHealthFactor(user);
        if (healthFactor >= MIN_HEALTH_FACTOR) {
            revert PositionNotLiquidatable(healthFactor);
        }

        uint256 collateralBalance = position.collateralBalances[collateralToken];
        uint256 liquidationAmount = maxAmount > collateralBalance ? collateralBalance : maxAmount;
        
        // Calculate debt to repay
        uint256 collateralValue = _getCollateralValue(collateralToken, liquidationAmount);
        uint256 debtToRepay = (collateralValue * 10000) / collateralConfigs[collateralToken].liquidationRatio;
        
        // Add liquidation penalty
        uint256 penalty = (debtToRepay * LIQUIDATION_PENALTY) / 10000;
        uint256 totalDebtToRepay = debtToRepay + penalty;

        // Ensure liquidator has enough tokens
        require(balanceOf(msg.sender) >= totalDebtToRepay, "Insufficient liquidator balance");

        // Burn liquidator's tokens
        _burn(msg.sender, totalDebtToRepay);

        // Update user position
        position.collateralBalances[collateralToken] -= liquidationAmount;
        position.totalMinted -= debtToRepay;
        
        // Transfer collateral to liquidator
        IERC20(collateralToken).safeTransfer(msg.sender, liquidationAmount);
        
        // Add penalty to stability pool
        stabilityPoolBalance += penalty;

        // Update global state
        totalCollateral[collateralToken] -= liquidationAmount;
        totalSupplyMinted -= debtToRepay;

        // Update health factor
        position.healthFactor = _calculateCurrentHealthFactor(user);

        emit PositionLiquidated(user, msg.sender, collateralToken, liquidationAmount, totalDebtToRepay);
    }

    /**
     * @notice Handle CCIP received messages
     */
    function _ccipReceive(Client.Any2EVMMessage memory message) internal override {
        bytes32 messageId = message.messageId;
        address sender = abi.decode(message.sender, (address));
        
        // Only accept messages from hub
        require(sender == hubContract, "Unauthorized sender");

        // Process cross-chain message
        _processCrossChainMessage(messageId, message.data, message.destTokenAmounts);
    }

    /**
     * @notice Chainlink Automation upkeep check
     */
    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData) {
        bool needsRebalancing = _needsRebalancing();
        bool needsLiquidationCheck = _needsLiquidationCheck();
        bool needsMaintenance = (block.timestamp - lastRebalanceTime) > 1 hours;

        upkeepNeeded = needsRebalancing || needsLiquidationCheck || needsMaintenance;
        
        if (upkeepNeeded) {
            performData = abi.encode(needsRebalancing, needsLiquidationCheck, needsMaintenance);
        }
    }

    /**
     * @notice Chainlink Automation upkeep performance
     */
    function performUpkeep(bytes calldata performData) external override {
        (bool needsRebalancing, bool needsLiquidationCheck, bool needsMaintenance) = 
            abi.decode(performData, (bool, bool, bool));

        if (needsRebalancing) {
            _performRebalancing();
        }
        
        if (needsLiquidationCheck) {
            _checkForLiquidations();
        }
        
        if (needsMaintenance) {
            _performMaintenance();
        }
        
        lastRebalanceTime = block.timestamp;
    }

    // Internal functions
    function _processMint(bytes32 requestId) internal {
        MintRequest storage request = mintRequests[requestId];
        request.status = MintStatus.PROCESSING;

        // Mint tokens to user
        _mint(request.user, request.mintAmount);

        // Update user position
        UserPosition storage position = userPositions[request.user];
        position.collateralBalances[request.collateralToken] += request.collateralAmount;
        position.totalMinted += request.mintAmount;
        position.lastUpdateTime = block.timestamp;
        position.healthFactor = request.healthFactor;
        position.isActive = true;

        // Update global state
        totalCollateral[request.collateralToken] += request.collateralAmount;
        totalSupplyMinted += request.mintAmount;

        request.status = MintStatus.COMPLETED;

        emit TokensMinted(requestId, request.user, request.mintAmount, request.healthFactor);
    }

    function _processBurn(bytes32 requestId) internal {
        BurnRequest storage request = burnRequests[requestId];
        request.status = BurnStatus.PROCESSING;

        // Burn tokens from user
        _burn(request.user, request.burnAmount);

        // Update user position
        UserPosition storage position = userPositions[request.user];
        position.collateralBalances[request.collateralToken] -= request.collateralToReturn;
        position.totalMinted -= request.burnAmount;
        position.lastUpdateTime = block.timestamp;
        position.healthFactor = _calculateCurrentHealthFactor(request.user);

        // Transfer collateral back to user
        IERC20(request.collateralToken).safeTransfer(request.user, request.collateralToReturn);

        // Update global state
        totalCollateral[request.collateralToken] -= request.collateralToReturn;
        totalSupplyMinted -= request.burnAmount;

        request.status = BurnStatus.COMPLETED;

        emit TokensBurned(requestId, request.user, request.burnAmount, request.collateralToReturn);
    }

    function _calculateHealthFactor(
        address user,
        address collateralToken,
        uint256 collateralAmount,
        uint256 mintAmount
    ) internal view returns (uint256) {
        UserPosition storage position = userPositions[user];
        
        uint256 currentCollateralValue = _getCollateralValue(collateralToken, collateralAmount);
        uint256 localTotalCollateralValue = currentCollateralValue;
        for (uint256 i = 0; i < collateralTokens.length; i++) {
            address token = collateralTokens[i];
            if (token != collateralToken) {
                localTotalCollateralValue += _getCollateralValue(token, position.collateralBalances[token]);
            }
        }
        
        uint256 totalDebt = position.totalMinted + mintAmount;
        
        if (totalDebt == 0) return type(uint256).max;
        
        return (localTotalCollateralValue * MIN_HEALTH_FACTOR * PRECISION) / (totalDebt * 100);
    }

    function _calculateCurrentHealthFactor(address user) internal view returns (uint256) {
        UserPosition storage position = userPositions[user];
        
        uint256 currentCollateralValue = 0;
        for (uint256 i = 0; i < collateralTokens.length; i++) {
            address token = collateralTokens[i];
            currentCollateralValue += _getCollateralValue(token, position.collateralBalances[token]);
        }
        
        if (position.totalMinted == 0) return type(uint256).max;
        
        return (currentCollateralValue * MIN_HEALTH_FACTOR * PRECISION) / (position.totalMinted * 100);
    }

    function _calculateHealthFactorAfterBurn(
        address user,
        address collateralToken,
        uint256 collateralAmount,
        uint256 burnAmount
    ) internal view returns (uint256) {
        UserPosition storage position = userPositions[user];
        
        uint256 afterBurnCollateralValue = 0;
        for (uint256 i = 0; i < collateralTokens.length; i++) {
            address token = collateralTokens[i];
            uint256 balance = position.collateralBalances[token];
            if (token == collateralToken) {
                balance -= collateralAmount;
            }
            afterBurnCollateralValue += _getCollateralValue(token, balance);
        }
        
        uint256 remainingDebt = position.totalMinted - burnAmount;
        if (remainingDebt == 0) return type(uint256).max;
        
        return (afterBurnCollateralValue * MIN_HEALTH_FACTOR * PRECISION) / (remainingDebt * 100);
    }

    function _getCollateralValue(address token, uint256 amount) internal view returns (uint256) {
        if (amount == 0) return 0;
        
        AggregatorV3Interface priceFeed = priceFeeds[token];
        require(address(priceFeed) != address(0), "Price feed not found");
        
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return (amount * uint256(price) * 1e10) / PRECISION; // Convert to 18 decimals
    }

    function _processCrossChainMessage(
        bytes32 messageId,
        bytes memory data,
        Client.EVMTokenAmount[] memory tokenAmounts
    ) internal {
        // Decode message and process accordingly
        // This could be rebalancing instructions, liquidation requests, etc.
    }

    function _needsRebalancing() internal view returns (bool) {
        // Check if any collateral pools need rebalancing
        return (block.timestamp - lastRebalanceTime) > 24 hours;
    }

    function _needsLiquidationCheck() internal view returns (bool) {
        // Check if any positions might need liquidation
        return true; // Simplified - would check actual positions
    }

    function _performRebalancing() internal {
        // Perform automated rebalancing across chains
        // This would analyze utilization rates and move funds accordingly
    }

    function _checkForLiquidations() internal {
        // Check all positions for liquidation eligibility
        // This would iterate through positions and check health factors
    }

    function _performMaintenance() internal {
        // Perform regular maintenance tasks
        // Update fees, clean up expired requests, etc.
    }

    // Admin functions
    function addCollateralToken(
        address token,
        uint256 collateralizationRatio,
        uint256 liquidationRatio,
        uint256 maxMintAmount,
        address priceFeed,
        uint256 stabilityFee
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(collateralizationRatio <= MAX_COLLATERALIZATION_RATIO, "Ratio too high");
        require(liquidationRatio < collateralizationRatio, "Invalid liquidation ratio");
        
        collateralConfigs[token] = CollateralConfig({
            isSupported: true,
            collateralizationRatio: collateralizationRatio,
            liquidationRatio: liquidationRatio,
            maxMintAmount: maxMintAmount,
            priceFeed: priceFeed,
            stabilityFee: stabilityFee,
            isActive: true
        });
        
        supportedCollaterals[token] = true;
        priceFeeds[token] = AggregatorV3Interface(priceFeed);
        collateralTokens.push(token);
        
        emit CollateralAdded(token, collateralizationRatio, liquidationRatio);
    }

    function updateCollateralizationRatio(
        address token,
        uint256 newRatio
    ) external onlyRole(DEFAULT_ADMIN_ROLE) collateralSupported(token) {
        require(newRatio <= MAX_COLLATERALIZATION_RATIO, "Ratio too high");
        collateralConfigs[token].collateralizationRatio = newRatio;
    }

    function emergencyPause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function emergencyUnpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function withdrawProtocolFees(address token, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(amount <= protocolFees, "Insufficient fees");
        protocolFees -= amount;
        IERC20(token).safeTransfer(msg.sender, amount);
    }

    // View functions
    function getMintRequest(bytes32 requestId) external view returns (MintRequest memory) {
        return mintRequests[requestId];
    }

    function getBurnRequest(bytes32 requestId) external view returns (BurnRequest memory) {
        return burnRequests[requestId];
    }

    function getUserPosition(address user) external view returns (
        uint256 totalMinted,
        uint256 lastUpdateTime,
        uint256 healthFactor,
        bool isActive
    ) {
        UserPosition storage position = userPositions[user];
        return (
            position.totalMinted,
            position.lastUpdateTime,
            position.healthFactor,
            position.isActive
        );
    }

    function getUserCollateralBalance(address user, address token) external view returns (uint256) {
        return userPositions[user].collateralBalances[token];
    }

    function getCollateralConfig(address token) external view returns (CollateralConfig memory) {
        return collateralConfigs[token];
    }

    function getProtocolStats() external view returns (
        uint256 _totalSupplyMinted,
        uint256 _totalCollateralValue,
        uint256 _protocolFees,
        uint256 _stabilityPoolBalance,
        uint256 collateralizationRatio
    ) {
        uint256 ratio = totalSupplyMinted > 0 ? 
            (totalCollateralValue * 10000) / totalSupplyMinted : 0;
            
        return (
            totalSupplyMinted,
            totalCollateralValue,
            protocolFees,
            stabilityPoolBalance,
            ratio
        );
    }

    function getSupportedCollaterals() external view returns (address[] memory) {
        return collateralTokens;
    }

    function calculateMaxMintAmount(address user, address collateralToken, uint256 collateralAmount) 
        external 
        view 
        returns (uint256) 
    {
        uint256 collateralValue = _getCollateralValue(collateralToken, collateralAmount);
        CollateralConfig memory config = collateralConfigs[collateralToken];
        
        return (collateralValue * 10000) / config.collateralizationRatio;
    }

    function isPositionHealthy(address user) external view returns (bool) {
        return _calculateCurrentHealthFactor(user) >= MIN_HEALTH_FACTOR;
    }
}