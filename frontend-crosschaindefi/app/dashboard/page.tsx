'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Activity, 
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  BarChart3,
  RefreshCw
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const portfolioStats = [
  {
    title: 'Total Portfolio Value',
    value: '$47,239.82',
    change: '+12.5%',
    changeType: 'positive' as const,
    icon: DollarSign,
  },
  {
    title: 'Lending Balance',
    value: '$28,456.34',
    change: '+8.7%',
    changeType: 'positive' as const,
    icon: TrendingUp,
  },
  {
    title: 'Borrowing Balance',
    value: '$12,847.92',
    change: '-3.2%',
    changeType: 'negative' as const,
    icon: TrendingDown,
  },
  {
    title: 'Health Factor',
    value: '2.47',
    change: '+0.12',
    changeType: 'positive' as const,
    icon: Shield,
  },
]

const lendingPositions = [
  { asset: 'USDC', amount: '$8,543.21', apy: '8.45%', earnings: '+$234.56', chain: 'Ethereum' },
  { asset: 'ETH', amount: '$12,456.78', apy: '6.23%', earnings: '+$412.33', chain: 'Arbitrum' },
  { asset: 'WBTC', amount: '$4,234.56', apy: '4.89%', earnings: '+$156.78', chain: 'Polygon' },
  { asset: 'AVAX', amount: '$3,221.79', apy: '9.15%', earnings: '+$198.45', chain: 'Avalanche' },
]

const borrowingPositions = [
  { 
    asset: 'USDT', 
    amount: '$5,000.00', 
    rate: '3.25%', 
    collateral: 'ETH',
    collateralValue: '$8,750.00',
    healthFactor: 2.47,
    chain: 'Ethereum'
  },
  { 
    asset: 'USDC', 
    amount: '$7,847.92', 
    rate: '2.89%', 
    collateral: 'WBTC',
    collateralValue: '$13,200.00',
    healthFactor: 1.89,
    chain: 'Arbitrum'
  },
]

const recentTransactions = [
  {
    id: 1,
    type: 'Lend',
    asset: 'USDC',
    amount: '$1,000.00',
    chain: 'Ethereum',
    time: '2 minutes ago',
    status: 'Completed'
  },
  {
    id: 2,
    type: 'Borrow',
    asset: 'USDT',
    amount: '$500.00',
    chain: 'Arbitrum',
    time: '15 minutes ago',
    status: 'Completed'
  },
  {
    id: 3,
    type: 'Repay',
    asset: 'USDC',
    amount: '$200.00',
    chain: 'Polygon',
    time: '1 hour ago',
    status: 'Completed'
  },
]

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your lending, borrowing positions and health factor across chains
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet
          </Button>
        </div>
      </div>

      {/* Portfolio Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {portfolioStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs flex items-center ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lending Positions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Lending Positions
              </CardTitle>
              <CardDescription>
                Your active lending positions across different chains
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {lendingPositions.map((position, index) => (
                <motion.div
                  key={position.asset}
                  className="flex items-center justify-between p-4 border rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{position.asset}</h4>
                      <Badge variant="outline" className="text-xs">
                        {position.chain}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium">{position.amount}</div>
                        <div className="text-muted-foreground">Deposited</div>
                      </div>
                      <div>
                        <div className="font-medium text-green-600">{position.apy}</div>
                        <div className="text-muted-foreground">APY</div>
                      </div>
                      <div>
                        <div className="font-medium text-green-600">{position.earnings}</div>
                        <div className="text-muted-foreground">Earnings</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Withdraw
                    </Button>
                    <Button size="sm">
                      Add More
                    </Button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Health Factor & Borrowing */}
        <div className="space-y-6">
          {/* Health Factor Monitor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Health Factor
              </CardTitle>
              <CardDescription>
                Monitor your borrowing position safety
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-green-600 mb-2">2.47</div>
                <Badge variant="secondary" className="text-green-600">
                  Healthy
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Safety Level</span>
                  <span className="font-medium">Excellent</span>
                </div>
                <Progress value={85} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  Health factor above 2.0 indicates a safe position
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest lending and borrowing transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentTransactions.map((tx, index) => (
                <motion.div
                  key={tx.id}
                  className="flex items-start gap-3 p-3 border rounded-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <Badge 
                        variant={tx.type === 'Lend' ? 'default' : tx.type === 'Borrow' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {tx.type}
                      </Badge>
                      <span className="text-sm font-medium">{tx.amount}</span>
                    </div>
                    <h4 className="font-medium text-sm">{tx.asset}</h4>
                    <p className="text-xs text-muted-foreground">{tx.chain}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{tx.time}</span>
                      <Badge variant="outline" className="text-xs">
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Borrowing Positions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Borrowing Positions
          </CardTitle>
          <CardDescription>
            Monitor your loans and collateral positions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {borrowingPositions.map((position, index) => (
              <motion.div
                key={`${position.asset}-${position.chain}`}
                className="p-4 border rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium">{position.asset} Loan</h4>
                    <Badge variant="outline" className="text-xs mt-1">
                      {position.chain}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{position.amount}</div>
                    <div className="text-sm text-red-600">{position.rate}</div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Collateral ({position.collateral})</span>
                    <span>{position.collateralValue}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Health Factor</span>
                    <span className={position.healthFactor > 2 ? 'text-green-600' : position.healthFactor > 1.5 ? 'text-yellow-600' : 'text-red-600'}>
                      {position.healthFactor}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    Add Collateral
                  </Button>
                  <Button size="sm">
                    Repay
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your DeFi positions efficiently
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button className="h-20 flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              Lend Assets
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <TrendingDown className="h-6 w-6" />
              Borrow Assets
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <RefreshCw className="h-6 w-6" />
              Repay Loan
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <BarChart3 className="h-6 w-6" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 