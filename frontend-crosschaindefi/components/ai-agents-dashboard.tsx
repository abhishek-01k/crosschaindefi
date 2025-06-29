"use client"

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { formatUnits } from 'viem'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bot, 
  TrendingUp, 
  Zap, 
  Brain, 
  Target, 
  Activity,
  ArrowUpDown,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  RefreshCw
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  useProtocolContracts, 
  useArbitrageOpportunities, 
  useMarketIntelligence 
} from '@/lib/hooks'
import { supportedChains } from '@/lib/web3'

// Mock arbitrage opportunities
const mockArbitrageOpportunities = [
  {
    id: '0x123...456',
    tokenA: 'USDC',
    tokenB: 'USDT',
    sourceChain: 'Ethereum',
    destinationChain: 'Arbitrum',
    profitPercentage: 2.45,
    maxAmount: '50000',
    sourcePrice: 1.0023,
    destinationPrice: 1.0268,
    timestamp: Date.now() - 300000, // 5 minutes ago
    isActive: true,
    estimatedProfit: '1225.00'
  },
  {
    id: '0x789...012',
    tokenA: 'ETH',
    tokenB: 'WETH',
    sourceChain: 'Polygon',
    destinationChain: 'Avalanche',
    profitPercentage: 1.87,
    maxAmount: '25',
    sourcePrice: 2341.45,
    destinationPrice: 2385.12,
    timestamp: Date.now() - 480000, // 8 minutes ago
    isActive: true,
    estimatedProfit: '1093.75'
  },
  {
    id: '0x345...678',
    tokenA: 'WBTC',
    tokenB: 'BTC',
    sourceChain: 'Base',
    destinationChain: 'Ethereum',
    profitPercentage: 0.95,
    maxAmount: '2.5',
    sourcePrice: 43521.30,
    destinationPrice: 43934.87,
    timestamp: Date.now() - 720000, // 12 minutes ago
    isActive: false,
    estimatedProfit: '1033.93'
  }
]

// Mock market intelligence data
const mockMarketData = [
  {
    protocol: 'Aave',
    token: 'USDC',
    chain: 'Ethereum',
    supplyRate: 4.25,
    borrowRate: 6.85,
    utilization: 78.5,
    liquidity: '125M',
    trend: 'up'
  },
  {
    protocol: 'Compound',
    token: 'USDC',
    chain: 'Arbitrum',
    supplyRate: 3.89,
    borrowRate: 7.12,
    utilization: 82.3,
    liquidity: '89M',
    trend: 'down'
  },
  {
    protocol: 'Venus',
    token: 'USDC',
    chain: 'Base',
    supplyRate: 4.67,
    borrowRate: 6.42,
    utilization: 71.2,
    liquidity: '45M',
    trend: 'up'
  }
]

export default function AIAgentsDashboard() {
  const { address, isConnected } = useAccount()
  const { contracts, isHub } = useProtocolContracts()
  
  // Get real data from hooks
  const { opportunities: realOpportunities, isLoading: opportunitiesLoading } = useArbitrageOpportunities()
  const { opportunities: marketOpportunities, agentStats, isLoading: marketLoading } = useMarketIntelligence()

  // Use mock data for now since contracts might not have data yet
  const opportunities = mockArbitrageOpportunities
  const marketData = mockMarketData

  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null)
  const [executingArbitrage, setExecutingArbitrage] = useState(false)

  const handleExecuteArbitrage = async (opportunityId: string) => {
    setExecutingArbitrage(true)
    // Mock execution - in real app, this would call the contract
    setTimeout(() => {
      setExecutingArbitrage(false)
      // Show success notification
    }, 3000)
  }

  const formatTimeAgo = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000)
    return `${minutes} min ago`
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Bot className="h-6 w-6" />
              AI Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground mb-4">
              Connect your wallet to access AI-powered arbitrage and market intelligence
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
            <Bot className="h-8 w-8" />
            AI Agents Dashboard
          </h1>
          <p className="text-muted-foreground">
            Automated arbitrage and intelligent market analysis powered by Chainlink
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={isHub ? 'default' : 'secondary'}>
            {isHub ? 'Hub Chain' : 'Spoke Chain'}
          </Badge>
          {!isHub && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                AI Agents are only available on the Hub Chain (Avalanche Fuji)
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Agent Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Opportunities</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {opportunities.filter(o => o.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {opportunities.length} total detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              $
              {opportunities
                .filter(o => o.isActive)
                .reduce((sum, o) => sum + parseFloat(o.estimatedProfit), 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From active opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.5%</div>
            <Progress value={87.5} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.4M</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="arbitrage" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="arbitrage" className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4" />
            Arbitrage Coordinator
          </TabsTrigger>
          <TabsTrigger value="intelligence" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Market Intelligence
          </TabsTrigger>
        </TabsList>

        <TabsContent value="arbitrage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Active Arbitrage Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {opportunities.map((opportunity) => (
                  <div
                    key={opportunity.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      opportunity.isActive 
                        ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20' 
                        : 'border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={opportunity.isActive ? 'default' : 'secondary'}>
                            {opportunity.isActive ? 'Active' : 'Expired'}
                          </Badge>
                          <Badge variant="outline">
                            {opportunity.tokenA} → {opportunity.tokenB}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatTimeAgo(opportunity.timestamp)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <div className="text-sm text-muted-foreground">Source</div>
                            <div className="font-medium">{opportunity.sourceChain}</div>
                            <div className="text-sm">${opportunity.sourcePrice.toFixed(4)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Destination</div>
                            <div className="font-medium">{opportunity.destinationChain}</div>
                            <div className="text-sm">${opportunity.destinationPrice.toFixed(4)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Profit</div>
                            <div className="font-medium text-green-600">
                              {opportunity.profitPercentage.toFixed(2)}%
                            </div>
                            <div className="text-sm">${opportunity.estimatedProfit}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Max Amount</div>
                            <div className="font-medium">{opportunity.maxAmount}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        {opportunity.isActive ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOpportunity(opportunity.id)}
                            >
                              Details
                            </Button>
                            <Button
                              size="sm"
                              disabled={executingArbitrage || !isHub}
                              onClick={() => handleExecuteArbitrage(opportunity.id)}
                            >
                              {executingArbitrage ? (
                                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                              ) : null}
                              Execute
                            </Button>
                          </>
                        ) : (
                          <Button variant="ghost" size="sm" disabled>
                            <Clock className="h-4 w-4 mr-2" />
                            Expired
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {opportunities.length === 0 && (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Opportunities Found</h3>
                    <p className="text-muted-foreground">
                      The AI agent is continuously scanning for arbitrage opportunities across chains.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intelligence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Market Intelligence & Best Rates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketData.map((market, index) => (
                  <div
                    key={`${market.protocol}-${market.chain}`}
                    className="p-4 rounded-lg border"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{market.protocol}</h4>
                        <Badge variant="outline">{market.chain}</Badge>
                        <Badge variant="secondary">{market.token}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {market.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                        )}
                        <span className="text-sm font-medium">
                          {market.trend === 'up' ? 'Rising' : 'Falling'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Supply APY</div>
                        <div className="text-lg font-medium text-green-600">
                          {market.supplyRate.toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Borrow APY</div>
                        <div className="text-lg font-medium text-red-600">
                          {market.borrowRate.toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Utilization</div>
                        <div className="text-lg font-medium">
                          {market.utilization.toFixed(1)}%
                        </div>
                        <Progress value={market.utilization} className="mt-1" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Liquidity</div>
                        <div className="text-lg font-medium">{market.liquidity}</div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Recommended for: {market.supplyRate > 4 ? 'Lending' : 'Borrowing'}
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Best Rates Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Best Supply Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {marketData
                    .sort((a, b) => b.supplyRate - a.supplyRate)
                    .slice(0, 3)
                    .map((market, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {market.protocol}
                          </Badge>
                          <span className="text-sm">{market.chain}</span>
                        </div>
                        <span className="font-medium text-green-600">
                          {market.supplyRate.toFixed(2)}%
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Best Borrow Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {marketData
                    .sort((a, b) => a.borrowRate - b.borrowRate)
                    .slice(0, 3)
                    .map((market, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {market.protocol}
                          </Badge>
                          <span className="text-sm">{market.chain}</span>
                        </div>
                        <span className="font-medium text-red-600">
                          {market.borrowRate.toFixed(2)}%
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 