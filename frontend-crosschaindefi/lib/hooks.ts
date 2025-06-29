"use client"

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId } from 'wagmi'
import { parseEther, formatEther, parseUnits, formatUnits } from 'viem'
import { useState, useEffect, useMemo } from 'react'
import { getProtocolContracts, isHubChain } from './web3'
import { 
  CrossChainDefiHubABI, 
  CrossChainDepositorABI, 
  CrossChainMinterABI, 
  ArbitrageCoordinatorAgentABI,
  MarketIntelligenceAgentABI,
  ERC20ABI,
  StrategyType,
  DepositStatus,
  MintStatus,
  BurnStatus
} from './abis'

// Types
export interface UserProfile {
  healthFactor: bigint
  creditScore: bigint
  lastActivity: bigint
  isActive: boolean
}

export interface DepositInfo {
  user: string
  token: string
  amount: bigint
  destinationChain: bigint
  timestamp: bigint
  status: DepositStatus
  ccipMessageId: string
  yieldEarned: bigint
  strategy: StrategyType
}

export interface ArbitrageOpportunity {
  tokenA: string
  tokenB: string
  sourceChain: bigint
  destinationChain: bigint
  sourcePrice: bigint
  destinationPrice: bigint
  profitPercentage: bigint
  maxAmount: bigint
  timestamp: bigint
  isActive: boolean
}

export interface ProtocolStats {
  totalDeposits?: bigint
  totalBorrowed?: bigint
  protocolFees?: bigint
  utilizationRate?: bigint
  totalValueLocked?: bigint
  totalYieldGenerated?: bigint
  totalDepositsCount?: bigint
  supportedTokensCount?: bigint
}

// Hook to get current protocol contracts
export function useProtocolContracts() {
  const chainId = useChainId()
  const contracts = useMemo(() => getProtocolContracts(chainId), [chainId])
  
  return {
    contracts,
    isHub: isHubChain(chainId),
    chainId
  }
}

// Hook for user profile data
export function useUserProfile(userAddress?: string) {
  const { address } = useAccount()
  const { contracts, isHub } = useProtocolContracts()
  const targetAddress = userAddress || address

  // Get user profile from hub
  const { data: hubProfile, isLoading: hubLoading } = useReadContract({
    address: contracts?.crossChainDefiHub as `0x${string}`,
    abi: CrossChainDefiHubABI,
    functionName: 'getUserProfile',
    args: [targetAddress as `0x${string}`],
    query: {
      enabled: !!targetAddress && !!contracts?.crossChainDefiHub && isHub
    }
  })

  // Get user profile from depositor (spoke chains)
  const { data: depositorProfile, isLoading: depositorLoading } = useReadContract({
    address: contracts?.crossChainDepositor as `0x${string}`,
    abi: CrossChainDepositorABI,
    functionName: 'getUserProfile',
    args: [targetAddress as `0x${string}`],
    query: {
      enabled: !!targetAddress && !!contracts?.crossChainDepositor && !isHub
    }
  })

  return {
    profile: isHub ? hubProfile : depositorProfile,
    isLoading: isHub ? hubLoading : depositorLoading
  }
}

// Hook for protocol statistics
export function useProtocolStats() {
  const { contracts, isHub } = useProtocolContracts()

  // Hub stats
  const { data: hubStats, isLoading: hubLoading } = useReadContract({
    address: contracts?.crossChainDefiHub as `0x${string}`,
    abi: CrossChainDefiHubABI,
    functionName: 'getProtocolStats',
    query: {
      enabled: !!contracts?.crossChainDefiHub && isHub
    }
  })

  // Depositor stats
  const { data: depositorStats, isLoading: depositorLoading } = useReadContract({
    address: contracts?.crossChainDepositor as `0x${string}`,
    abi: CrossChainDepositorABI,
    functionName: 'getProtocolStats',
    query: {
      enabled: !!contracts?.crossChainDepositor && !isHub
    }
  })

  // Minter stats
  const { data: minterStats, isLoading: minterLoading } = useReadContract({
    address: contracts?.crossChainMinter as `0x${string}`,
    abi: CrossChainMinterABI,
    functionName: 'getProtocolStats',
    query: {
      enabled: !!contracts?.crossChainMinter
    }
  })

  return {
    hubStats,
    depositorStats,
    minterStats,
    isLoading: hubLoading || depositorLoading || minterLoading
  }
}

// Hook for token balances
export function useTokenBalance(tokenAddress: string, userAddress?: string) {
  const { address } = useAccount()
  const targetAddress = userAddress || address

  const { data: balance, isLoading } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: [targetAddress as `0x${string}`],
    query: {
      enabled: !!targetAddress && !!tokenAddress
    }
  })

  const { data: tokenInfo } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'symbol',
    query: {
      enabled: !!tokenAddress
    }
  })

  const { data: decimals } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'decimals',
    query: {
      enabled: !!tokenAddress
    }
  })

  return {
    balance,
    symbol: tokenInfo,
    decimals,
    isLoading,
    formatted: balance && decimals ? formatUnits(balance, decimals) : '0'
  }
}

// Hook for token allowance
export function useTokenAllowance(tokenAddress: string, spenderAddress: string, userAddress?: string) {
  const { address } = useAccount()
  const targetAddress = userAddress || address

  const { data: allowance, isLoading } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: [targetAddress as `0x${string}`, spenderAddress as `0x${string}`],
    query: {
      enabled: !!targetAddress && !!tokenAddress && !!spenderAddress
    }
  })

  return {
    allowance,
    isLoading
  }
}

// Hook for deposit operations
export function useDeposit() {
  const { contracts, isHub } = useProtocolContracts()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const deposit = async (
    tokenAddress: string, 
    amount: string, 
    decimals: number = 18,
    strategy: StrategyType = StrategyType.BALANCED,
    enableAutoCompound: boolean = false,
    destinationChain?: bigint
  ) => {
    if (!contracts) throw new Error('No contracts available')
    
    const parsedAmount = parseUnits(amount, decimals)

    if (isHub) {
      // Hub chain deposit
      writeContract({
        address: contracts.crossChainDefiHub as `0x${string}`,
        abi: CrossChainDefiHubABI,
        functionName: 'deposit',
        args: [tokenAddress as `0x${string}`, parsedAmount, destinationChain || 0n]
      })
    } else {
      // Spoke chain deposit
      writeContract({
        address: contracts.crossChainDepositor as `0x${string}`,
        abi: CrossChainDepositorABI,
        functionName: 'deposit',
        args: [tokenAddress as `0x${string}`, parsedAmount, strategy, enableAutoCompound]
      })
    }
  }

  return {
    deposit,
    hash,
    isPending,
    isConfirming,
    isSuccess
  }
}

// Hook for withdrawal operations
export function useWithdraw() {
  const { contracts, isHub } = useProtocolContracts()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const withdraw = async (tokenAddress: string, amount: string, decimals: number = 18) => {
    if (!contracts) throw new Error('No contracts available')
    
    const parsedAmount = parseUnits(amount, decimals)

    if (isHub) {
      // Hub chain withdrawal
      writeContract({
        address: contracts.crossChainDefiHub as `0x${string}`,
        abi: CrossChainDefiHubABI,
        functionName: 'withdraw',
        args: [tokenAddress as `0x${string}`, parsedAmount]
      })
    } else {
      // Spoke chain withdrawal
      writeContract({
        address: contracts.crossChainDepositor as `0x${string}`,
        abi: CrossChainDepositorABI,
        functionName: 'withdraw',
        args: [tokenAddress as `0x${string}`, parsedAmount]
      })
    }
  }

  return {
    withdraw,
    hash,
    isPending,
    isConfirming,
    isSuccess
  }
}

// Hook for borrowing operations
export function useBorrow() {
  const { contracts, isHub } = useProtocolContracts()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const borrow = async (tokenAddress: string, amount: string, decimals: number = 18) => {
    if (!contracts?.crossChainDefiHub || !isHub) {
      throw new Error('Borrowing only available on hub chain')
    }
    
    const parsedAmount = parseUnits(amount, decimals)

    writeContract({
      address: contracts.crossChainDefiHub as `0x${string}`,
      abi: CrossChainDefiHubABI,
      functionName: 'borrow',
      args: [tokenAddress as `0x${string}`, parsedAmount]
    })
  }

  return {
    borrow,
    hash,
    isPending,
    isConfirming,
    isSuccess
  }
}

// Hook for repay operations
export function useRepay() {
  const { contracts, isHub } = useProtocolContracts()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const repay = async (tokenAddress: string, amount: string, decimals: number = 18) => {
    if (!contracts?.crossChainDefiHub || !isHub) {
      throw new Error('Repayment only available on hub chain')
    }
    
    const parsedAmount = parseUnits(amount, decimals)

    writeContract({
      address: contracts.crossChainDefiHub as `0x${string}`,
      abi: CrossChainDefiHubABI,
      functionName: 'repay',
      args: [tokenAddress as `0x${string}`, parsedAmount]
    })
  }

  return {
    repay,
    hash,
    isPending,
    isConfirming,
    isSuccess
  }
}

// Hook for minting operations
export function useMint() {
  const { contracts } = useProtocolContracts()
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const mint = async (
    collateralToken: string, 
    collateralAmount: string, 
    mintAmount: string,
    decimals: number = 18
  ) => {
    if (!contracts?.crossChainMinter) {
      throw new Error('Minter contract not available')
    }
    
    const parsedCollateralAmount = parseUnits(collateralAmount, decimals)
    const parsedMintAmount = parseUnits(mintAmount, decimals)

    writeContract({
      address: contracts.crossChainMinter as `0x${string}`,
      abi: CrossChainMinterABI,
      functionName: 'requestMint',
      args: [collateralToken as `0x${string}`, parsedCollateralAmount, parsedMintAmount]
    })
  }

  return {
    mint,
    hash,
    isPending,
    isConfirming,
    isSuccess
  }
}

// Hook for token approval
export function useApproval() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const approve = async (
    tokenAddress: string, 
    spenderAddress: string, 
    amount: string,
    decimals: number = 18
  ) => {
    const parsedAmount = parseUnits(amount, decimals)

    writeContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20ABI,
      functionName: 'approve',
      args: [spenderAddress as `0x${string}`, parsedAmount]
    })
  }

  const approveMax = async (tokenAddress: string, spenderAddress: string) => {
    writeContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20ABI,
      functionName: 'approve',
      args: [spenderAddress as `0x${string}`, BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639935')] // Max uint256
    })
  }

  return {
    approve,
    approveMax,
    hash,
    isPending,
    isConfirming,
    isSuccess
  }
}

// Hook for arbitrage opportunities
export function useArbitrageOpportunities() {
  const { contracts, isHub } = useProtocolContracts()

  const { data: opportunities, isLoading } = useReadContract({
    address: contracts?.arbitrageCoordinatorAgent as `0x${string}`,
    abi: ArbitrageCoordinatorAgentABI,
    functionName: 'getActiveOpportunities',
    query: {
      enabled: !!contracts?.arbitrageCoordinatorAgent && isHub
    }
  })

  return {
    opportunities,
    isLoading
  }
}

// Hook for market intelligence
export function useMarketIntelligence() {
  const { contracts, isHub } = useProtocolContracts()

  const { data: opportunities, isLoading } = useReadContract({
    address: contracts?.marketIntelligenceAgent as `0x${string}`,
    abi: MarketIntelligenceAgentABI,
    functionName: 'getActiveOpportunities',
    query: {
      enabled: !!contracts?.marketIntelligenceAgent && isHub
    }
  })

  const { data: agentStats, isLoading: statsLoading } = useReadContract({
    address: contracts?.marketIntelligenceAgent as `0x${string}`,
    abi: MarketIntelligenceAgentABI,
    functionName: 'getAgentStats',
    query: {
      enabled: !!contracts?.marketIntelligenceAgent && isHub
    }
  })

  return {
    opportunities,
    agentStats,
    isLoading: isLoading || statsLoading
  }
}

// Hook for user deposits/borrows
export function useUserBalances(tokenAddress: string, userAddress?: string) {
  const { address } = useAccount()
  const { contracts, isHub } = useProtocolContracts()
  const targetAddress = userAddress || address

  // Get user deposits
  const { data: deposits, isLoading: depositsLoading } = useReadContract({
    address: contracts?.crossChainDefiHub as `0x${string}`,
    abi: CrossChainDefiHubABI,
    functionName: 'getUserDeposits',
    args: [targetAddress as `0x${string}`, tokenAddress as `0x${string}`],
    query: {
      enabled: !!targetAddress && !!tokenAddress && !!contracts?.crossChainDefiHub && isHub
    }
  })

  // Get user borrowed amount
  const { data: borrowed, isLoading: borrowedLoading } = useReadContract({
    address: contracts?.crossChainDefiHub as `0x${string}`,
    abi: CrossChainDefiHubABI,
    functionName: 'getUserBorrowed',
    args: [targetAddress as `0x${string}`, tokenAddress as `0x${string}`],
    query: {
      enabled: !!targetAddress && !!tokenAddress && !!contracts?.crossChainDefiHub && isHub
    }
  })

  // Get user token balance on depositor
  const { data: depositorBalance, isLoading: depositorBalanceLoading } = useReadContract({
    address: contracts?.crossChainDepositor as `0x${string}`,
    abi: CrossChainDepositorABI,
    functionName: 'getUserTokenBalance',
    args: [targetAddress as `0x${string}`, tokenAddress as `0x${string}`],
    query: {
      enabled: !!targetAddress && !!tokenAddress && !!contracts?.crossChainDepositor && !isHub
    }
  })

  return {
    deposits,
    borrowed,
    depositorBalance,
    isLoading: depositsLoading || borrowedLoading || depositorBalanceLoading
  }
}

// Hook for monitoring transaction status
export function useTransactionStatus(hash?: `0x${string}`) {
  const { data: receipt, isLoading, isSuccess, isError } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash
    }
  })

  return {
    receipt,
    isLoading,
    isSuccess,
    isError
  }
} 