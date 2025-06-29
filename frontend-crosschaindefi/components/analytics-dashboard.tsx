"use client"

import { useState, useMemo } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Activity,
  Globe,
  Zap,
  Shield,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { useProtocolStats, useProtocolContracts } from '@/lib/hooks'

// Mock analytics data for demonstration
const mockChainData = [
  {
    chainId: 43113,
    name: 'Avalanche Fuji',
    type: 'Hub',
    tvl: 2450000,
    totalBorrowed: 1850000,
    users: 1240,
    transactions: 15670,
    utilization: 75.5,
    growth: 12.5,
    volume24h: 450000,
    fees24h: 2250,
    isActive: true
  },
  {
    chainId: 84532,
    name: 'Base Sepolia',
    type: 'Spoke',
    tvl: 890000,
    totalBorrowed: 0, // Spoke chains don't have borrowing
    users: 560,
    transactions: 8430,
    utilization: 0,
    growth: 18.7,
    volume24h: 180000,
    fees24h: 890,
    isActive: true
  },
  {
    chainId: 11155111,
    name: 'Ethereum Sepolia',
    type: 'Spoke',
    tvl: 650000,
    totalBorrowed: 0,
    users: 320,
    transactions: 4520,
    utilization: 0,
    growth: 8.9,
    volume24h: 120000,
    fees24h: 610,
    isActive: false
  }
]

const mockTimeSeriesData = [
  { date: '2024-01-01', tvl: 1200000, volume: 250000, users: 800 },
  { date: '2024-01-02', tvl: 1350000, volume: 280000, users: 850 },
  { date: '2024-01-03', tvl: 1500000, volume: 320000, users: 920 },
  { date: '2024-01-04', tvl: 1680000, volume: 350000, users: 980 },
  { date: '2024-01-05', tvl: 1850000, volume: 380000, users: 1050 },
  { date: '2024-01-06', tvl: 2100000, volume: 420000, users: 1150 },
  { date: '2024-01-07', tvl: 2450000, volume: 450000, users: 1240 }
]

const tokenAnalytics = [
  {
    symbol: 'USDC',
    tvl: 1200000,
    borrowed: 850000,
    supplyApy: 4.25,
    borrowApy: 6.85,
    utilization: 70.8,
    chains: ['Avalanche Fuji', 'Base Sepolia', 'Ethereum Sepolia']
  },
  {
    symbol: 'ETH',
    tvl: 890000,
    borrowed: 620000,
    supplyApy: 3.89,
    borrowApy: 5.67,
    utilization: 69.7,
    chains: ['Avalanche Fuji', 'Base Sepolia']
  },
  {
    symbol: 'WBTC',
    tvl: 450000,
    borrowed: 280000,
    supplyApy: 2.45,
    borrowApy: 4.12,
    utilization: 62.2,
    chains: ['Avalanche Fuji']
  }
]

export default function AnalyticsDashboard() {
  const { address, isConnected } = useAccount()
  const { contracts, isHub } = useProtocolContracts()
  const { hubStats, depositorStats, minterStats, isLoading } = useProtocolStats()
  
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d')
  const [selectedChain, setSelectedChain] = useState('all')

  // Calculate totals
  const totals = useMemo(() => {
    const activeChainsData = mockChainData.filter(chain => 
      selectedChain === 'all' || chain.chainId.toString() === selectedChain
    )
    
    return {
      totalTVL: activeChainsData.reduce((sum, chain) => sum + chain.tvl, 0),
      totalBorrowed: activeChainsData.reduce((sum, chain) => sum + chain.totalBorrowed, 0),
      totalUsers: activeChainsData.reduce((sum, chain) => sum + chain.users, 0),
      totalTransactions: activeChainsData.reduce((sum, chain) => sum + chain.transactions, 0),
      totalVolume24h: activeChainsData.reduce((sum, chain) => sum + chain.volume24h, 0),
      totalFees24h: activeChainsData.reduce((sum, chain) => sum + chain.fees24h, 0),
    }
  }, [selectedChain])

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    }
    return `$${amount.toLocaleString()}`
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`
    }
    return num.toLocaleString()
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground mb-4">
              Connect your wallet to view detailed protocol analytics
            </p>
            <Button className="w-full">Connect Wallet</Button>
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
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Protocol Analytics
          </h1>
          <p className="text-muted-foreground">
            Cross-chain performance metrics and insights
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <div className="flex gap-1">
            {['1d', '7d', '30d', '90d'].map((period) => (
              <Button
                key={period}
                variant={selectedTimeframe === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeframe(period)}
              >
                {period}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value Locked</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.totalTVL)}</div>
            <p className="text-xs text-green-600 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Borrowed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.totalBorrowed)}</div>
            <p className="text-xs text-green-600 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +8.7% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totals.totalUsers)}</div>
            <p className="text-xs text-green-600 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +15.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.totalVolume24h)}</div>
            <p className="text-xs text-red-600 flex items-center">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              -3.2% from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="chains" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chains" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Chains
          </TabsTrigger>
          <TabsTrigger value="tokens" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Tokens
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chains" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Cross-Chain Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockChainData.map((chain) => (
                  <div
                    key={chain.chainId}
                    className={`p-4 rounded-lg border ${
                      chain.isActive 
                        ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20' 
                        : 'border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{chain.name}</h4>
                          <Badge variant={chain.type === 'Hub' ? 'default' : 'secondary'}>
                            {chain.type}
                          </Badge>
                          <Badge variant={chain.isActive ? 'default' : 'destructive'}>
                            {chain.isActive ? 'Active' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Growth</div>
                        <div className={`font-medium ${chain.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {chain.growth > 0 ? '+' : ''}{chain.growth.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">TVL</div>
                        <div className="text-lg font-medium">{formatCurrency(chain.tvl)}</div>
                      </div>
                      {chain.type === 'Hub' && (
                        <div>
                          <div className="text-sm text-muted-foreground">Borrowed</div>
                          <div className="text-lg font-medium">{formatCurrency(chain.totalBorrowed)}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-sm text-muted-foreground">Users</div>
                        <div className="text-lg font-medium">{formatNumber(chain.users)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Transactions</div>
                        <div className="text-lg font-medium">{formatNumber(chain.transactions)}</div>
                      </div>
                    </div>

                    {chain.type === 'Hub' && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-muted-foreground">Utilization Rate</span>
                          <span className="font-medium">{chain.utilization.toFixed(1)}%</span>
                        </div>
                        <Progress value={chain.utilization} className="h-2" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Token Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tokenAnalytics.map((token) => (
                  <div key={token.symbol} className="p-4 rounded-lg border">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-lg">{token.symbol}</h4>
                        <div className="flex gap-1 mt-1">
                          {token.chains.map((chain) => (
                            <Badge key={chain} variant="outline" className="text-xs">
                              {chain.split(' ')[0]}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Utilization</div>
                        <div className="text-lg font-medium">{token.utilization.toFixed(1)}%</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">TVL</div>
                        <div className="text-lg font-medium">{formatCurrency(token.tvl)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Borrowed</div>
                        <div className="text-lg font-medium">{formatCurrency(token.borrowed)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Supply APY</div>
                        <div className="text-lg font-medium text-green-600">{token.supplyApy.toFixed(2)}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Borrow APY</div>
                        <div className="text-lg font-medium text-red-600">{token.borrowApy.toFixed(2)}%</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Utilization Rate</span>
                        <span className="font-medium">{token.utilization.toFixed(1)}%</span>
                      </div>
                      <Progress value={token.utilization} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Protocol Fees (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{formatCurrency(totals.totalFees24h)}</div>
                <p className="text-sm text-muted-foreground">
                  Generated across all chains
                </p>
                <div className="mt-4 space-y-2">
                  {mockChainData.filter(c => c.isActive).map((chain) => (
                    <div key={chain.chainId} className="flex justify-between">
                      <span className="text-sm">{chain.name}</span>
                      <span className="font-medium">{formatCurrency(chain.fees24h)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cross-Chain Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">CCIP Messages</span>
                      <span className="font-medium">1,240</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Cross-Chain Volume</span>
                      <span className="font-medium">{formatCurrency(320000)}</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Success Rate</span>
                      <span className="font-medium text-green-600">99.2%</span>
                    </div>
                    <Progress value={99.2} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Historical Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Historical charts will be displayed here</p>
                <p className="text-sm mt-2">Integration with charting library coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 