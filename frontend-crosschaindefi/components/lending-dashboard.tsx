"use client"

import { useState, useEffect } from 'react'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { formatUnits, parseUnits } from 'viem'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, TrendingUp, DollarSign, Shield, Zap, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  useProtocolContracts, 
  useUserProfile, 
  useProtocolStats, 
  useTokenBalance,
  useTokenAllowance,
  useApproval,
  useDeposit,
  useWithdraw,
  useBorrow,
  useRepay,
  useMint,
  useUserBalances,
  useTransactionStatus
} from '@/lib/hooks'
import { StrategyType } from '@/lib/abis'
import { supportedChains } from '@/lib/web3'

// Mock token addresses for testnets
export const TESTNET_TOKENS = {
  // Avalanche Fuji
  43113: {
    USDC: '0x5425890298aed601595a70AB815c96711a31Bc65',
    USDT: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
    WETH: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB',
    WBTC: '0x50b7545627a5162F82A992c33b87aDc75187B218'
  },
  // Base Sepolia
  84532: {
    USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    USDT: '0x2E8D98fd126a32362F2Bd8aA427E59a1ec63F780',
    WETH: '0x4200000000000000000000000000000000000006',
    WBTC: '0x7f7b0d7c8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b'
  },
  // Ethereum Sepolia
  11155111: {
    USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    USDT: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06',
    WETH: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
    WBTC: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'
  }
}

export default function LendingDashboard() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { contracts, isHub } = useProtocolContracts()
  
  // Component state
  const [activeTab, setActiveTab] = useState('lend')
  const [selectedToken, setSelectedToken] = useState('USDC')
  const [amount, setAmount] = useState('')
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyType>(StrategyType.BALANCED)
  const [autoCompound, setAutoCompound] = useState(false)
  const [destinationChain, setDestinationChain] = useState<string>('')

  // Get user data
  const { profile, isLoading: profileLoading } = useUserProfile()
  const { hubStats, depositorStats, minterStats, isLoading: statsLoading } = useProtocolStats()
  
  // Get token addresses for current chain
  const tokens = TESTNET_TOKENS[chainId as keyof typeof TESTNET_TOKENS] || TESTNET_TOKENS[43113]
  const selectedTokenAddress = tokens[selectedToken as keyof typeof tokens]
  
  // Token data
  const { balance, symbol, decimals, formatted: tokenBalance } = useTokenBalance(selectedTokenAddress)
  const { deposits, borrowed, depositorBalance } = useUserBalances(selectedTokenAddress)
  const { allowance } = useTokenAllowance(
    selectedTokenAddress, 
    isHub ? contracts?.crossChainDefiHub || '' : contracts?.crossChainDepositor || ''
  )
  
  // Contract operations
  const { approve, isPending: approvalPending, isSuccess: approvalSuccess } = useApproval()
  const { deposit, isPending: depositPending, isSuccess: depositSuccess } = useDeposit()
  const { withdraw, isPending: withdrawPending, isSuccess: withdrawSuccess } = useWithdraw()
  const { borrow, isPending: borrowPending, isSuccess: borrowSuccess } = useBorrow()
  const { repay, isPending: repayPending, isSuccess: repaySuccess } = useRepay()
  const { mint, isPending: mintPending, isSuccess: mintSuccess } = useMint()

  // Calculate if approval is needed
  const needsApproval = allowance && amount ? 
    parseUnits(amount, decimals || 18) > allowance : 
    true

  // Handle approval
  const handleApproval = async () => {
    if (!selectedTokenAddress || !amount) return
    
    const spenderAddress = isHub ? contracts?.crossChainDefiHub : contracts?.crossChainDepositor
    if (!spenderAddress) return

    try {
      await approve(selectedTokenAddress, spenderAddress, amount, decimals || 18)
    } catch (error) {
      console.error('Approval failed:', error)
    }
  }

  // Handle deposit
  const handleDeposit = async () => {
    if (!selectedTokenAddress || !amount) return

    try {
      await deposit(
        selectedTokenAddress,
        amount,
        decimals || 18,
        selectedStrategy,
        autoCompound,
        destinationChain ? BigInt(destinationChain) : undefined
      )
    } catch (error) {
      console.error('Deposit failed:', error)
    }
  }

  // Handle withdraw
  const handleWithdraw = async () => {
    if (!selectedTokenAddress || !amount) return

    try {
      await withdraw(selectedTokenAddress, amount, decimals || 18)
    } catch (error) {
      console.error('Withdrawal failed:', error)
    }
  }

  // Handle borrow
  const handleBorrow = async () => {
    if (!selectedTokenAddress || !amount) return

    try {
      await borrow(selectedTokenAddress, amount, decimals || 18)
    } catch (error) {
      console.error('Borrow failed:', error)
    }
  }

  // Handle repay
  const handleRepay = async () => {
    if (!selectedTokenAddress || !amount) return

    try {
      await repay(selectedTokenAddress, amount, decimals || 18)
    } catch (error) {
      console.error('Repay failed:', error)
    }
  }

  // Handle mint
  const handleMint = async () => {
    if (!selectedTokenAddress || !amount) return

    try {
      const collateralAmount = amount
      const mintAmount = (parseFloat(amount) * 0.75).toString() // 75% LTV
      await mint(selectedTokenAddress, collateralAmount, mintAmount, decimals || 18)
    } catch (error) {
      console.error('Mint failed:', error)
    }
  }

  // Calculate health factor color
  const getHealthFactorColor = (healthFactor?: bigint) => {
    if (!healthFactor) return 'text-gray-500'
    const factor = Number(formatUnits(healthFactor, 18))
    if (factor >= 2) return 'text-green-500'
    if (factor >= 1.5) return 'text-yellow-500'
    return 'text-red-500'
  }

  // Calculate utilization rate
  const getUtilizationRate = () => {
    if (isHub && hubStats) {
      const [totalDeposits, totalBorrowed] = hubStats as [bigint, bigint, bigint, bigint]
      if (totalDeposits > 0n) {
        return Number(formatUnits((totalBorrowed * 100n) / totalDeposits, 18))
      }
    }
    return 0
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Connect Your Wallet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground mb-4">
              Please connect your wallet to access the CrossChain DeFi platform
            </p>
            <Button className="w-full" onClick={() => {/* Connect wallet logic */}}>
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">CrossChain DeFi Dashboard</h1>
          <p className="text-muted-foreground">
            Lend, borrow, and earn across multiple blockchains
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={isHub ? 'default' : 'secondary'}>
            {isHub ? 'Hub Chain' : 'Spoke Chain'}
          </Badge>
          <Badge variant="outline">
            {supportedChains.find(chain => chain.id === chainId)?.name || 'Unknown Chain'}
          </Badge>
        </div>
      </div>

      {/* Protocol Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value Locked</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${depositorStats ? formatUnits(depositorStats[0], 18) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Borrowed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${hubStats ? formatUnits(hubStats[1], 18) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getUtilizationRate().toFixed(1)}%</div>
            <Progress value={getUtilizationRate()} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Factor</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthFactorColor(profile?.[0])}`}>
              {profile ? Number(formatUnits(profile[0], 18)).toFixed(2) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {profile && Number(formatUnits(profile[0], 18)) >= 1.5 ? 'Healthy' : 'At Risk'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operations Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Protocol Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="lend">Lend</TabsTrigger>
                  <TabsTrigger value="borrow" disabled={!isHub}>Borrow</TabsTrigger>
                  <TabsTrigger value="repay" disabled={!isHub}>Repay</TabsTrigger>
                  <TabsTrigger value="mint">Mint</TabsTrigger>
                  <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                </TabsList>

                {/* Token Selection */}
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="token">Select Token</Label>
                      <Select value={selectedToken} onValueChange={setSelectedToken}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a token" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(tokens).map((token) => (
                            <SelectItem key={token} value={token}>
                              {token}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">
                        Balance: {tokenBalance} {symbol}
                      </p>
                    </div>
                  </div>

                  {/* Strategy Selection for Lending */}
                  {activeTab === 'lend' && !isHub && (
                    <div className="space-y-2">
                      <Label htmlFor="strategy">Yield Strategy</Label>
                      <Select 
                        value={selectedStrategy.toString()} 
                        onValueChange={(value) => setSelectedStrategy(Number(value) as StrategyType)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select strategy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Conservative (Low Risk)</SelectItem>
                          <SelectItem value="1">Balanced (Medium Risk)</SelectItem>
                          <SelectItem value="2">Aggressive (High Risk)</SelectItem>
                          <SelectItem value="4">Auto-Optimized</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Destination Chain for Hub */}
                  {activeTab === 'lend' && isHub && (
                    <div className="space-y-2">
                      <Label htmlFor="destination">Destination Chain</Label>
                      <Select value={destinationChain} onValueChange={setDestinationChain}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination chain" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="84532">Base Sepolia</SelectItem>
                          <SelectItem value="11155111">Ethereum Sepolia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Tab Content */}
                <TabsContent value="lend" className="mt-6">
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {isHub 
                          ? "Deposit tokens to earn yield and provide liquidity for borrowers"
                          : "Deposit tokens to earn optimized yield across DeFi protocols"
                        }
                      </AlertDescription>
                    </Alert>

                    <div className="flex gap-2">
                      {needsApproval && (
                        <Button 
                          onClick={handleApproval}
                          disabled={approvalPending || !amount}
                          className="flex-1"
                        >
                          {approvalPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                          Approve {selectedToken}
                        </Button>
                      )}
                      
                      <Button 
                        onClick={handleDeposit}
                        disabled={depositPending || needsApproval || !amount}
                        className="flex-1"
                      >
                        {depositPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                        Deposit {selectedToken}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="borrow" className="mt-6">
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Borrow tokens against your collateral. Maintain health factor above 1.5.
                      </AlertDescription>
                    </Alert>

                    <Button 
                      onClick={handleBorrow}
                      disabled={borrowPending || !amount}
                      className="w-full"
                    >
                      {borrowPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                      Borrow {selectedToken}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="repay" className="mt-6">
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Repay your borrowed tokens to improve your health factor.
                      </AlertDescription>
                    </Alert>

                    <div className="flex gap-2">
                      {needsApproval && (
                        <Button 
                          onClick={handleApproval}
                          disabled={approvalPending || !amount}
                          className="flex-1"
                        >
                          {approvalPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                          Approve {selectedToken}
                        </Button>
                      )}
                      
                      <Button 
                        onClick={handleRepay}
                        disabled={repayPending || needsApproval || !amount}
                        className="flex-1"
                      >
                        {repayPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                        Repay {selectedToken}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="mint" className="mt-6">
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Mint synthetic tokens backed by your collateral (75% LTV).
                      </AlertDescription>
                    </Alert>

                    <div className="flex gap-2">
                      {needsApproval && (
                        <Button 
                          onClick={handleApproval}
                          disabled={approvalPending || !amount}
                          className="flex-1"
                        >
                          {approvalPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                          Approve {selectedToken}
                        </Button>
                      )}
                      
                      <Button 
                        onClick={handleMint}
                        disabled={mintPending || needsApproval || !amount}
                        className="flex-1"
                      >
                        {mintPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                        Mint Synthetic {selectedToken}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="withdraw" className="mt-6">
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Withdraw your deposited tokens and earned yield.
                      </AlertDescription>
                    </Alert>

                    <Button 
                      onClick={handleWithdraw}
                      disabled={withdrawPending || !amount}
                      className="w-full"
                    >
                      {withdrawPending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                      Withdraw {selectedToken}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* User Info Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Portfolio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Deposited {selectedToken}</Label>
                <p className="text-2xl font-bold">
                  {isHub 
                    ? (deposits ? formatUnits(deposits, decimals || 18) : '0.00')
                    : (depositorBalance ? formatUnits(depositorBalance, decimals || 18) : '0.00')
                  }
                </p>
              </div>

              {isHub && (
                <div>
                  <Label className="text-sm font-medium">Borrowed {selectedToken}</Label>
                  <p className="text-2xl font-bold">
                    {borrowed ? formatUnits(borrowed, decimals || 18) : '0.00'}
                  </p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Wallet Balance</Label>
                <p className="text-2xl font-bold">{tokenBalance}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Risk Assessment
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Zap className="h-4 w-4 mr-2" />
                Yield Optimization
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 