'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Shield, Zap, DollarSign, Percent, Clock } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const lendingPools = [
  {
    asset: 'USDC',
    apy: '8.45%',
    totalDeposited: '$12.4M',
    chain: 'Ethereum',
    icon: '💰',
    utilization: 78,
    risk: 'Low',
    chainColor: 'bg-blue-500'
  },
  {
    asset: 'ETH',
    apy: '6.23%',
    totalDeposited: '$8.7M',
    chain: 'Arbitrum',
    icon: '⟠',
    utilization: 65,
    risk: 'Medium',
    chainColor: 'bg-cyan-500'
  },
  {
    asset: 'WBTC',
    apy: '4.89%',
    totalDeposited: '$5.2M',
    chain: 'Polygon',
    icon: '₿',
    utilization: 45,
    risk: 'Low',
    chainColor: 'bg-purple-500'
  },
  {
    asset: 'USDT',
    apy: '7.92%',
    totalDeposited: '$15.6M',
    chain: 'Avalanche',
    icon: '💵',
    utilization: 82,
    risk: 'Low',
    chainColor: 'bg-red-600'
  },
  {
    asset: 'AVAX',
    apy: '9.15%',
    totalDeposited: '$3.4M',
    chain: 'Avalanche',
    icon: '🔺',
    utilization: 55,
    risk: 'Medium',
    chainColor: 'bg-red-600'
  },
  {
    asset: 'MATIC',
    apy: '11.28%',
    totalDeposited: '$2.8M',
    chain: 'Polygon',
    icon: '⬟',
    utilization: 70,
    risk: 'Medium',
    chainColor: 'bg-purple-500'
  }
]

const lendingFeatures = [
  {
    icon: TrendingUp,
    title: 'High Yield Opportunities',
    description: 'Earn competitive APY rates across multiple chains',
    metric: 'Up to 11.28%'
  },
  {
    icon: Shield,
    title: 'Secure & Audited',
    description: 'Smart contracts audited by leading security firms',
    metric: '100% Secure'
  },
  {
    icon: Zap,
    title: 'Cross-Chain Lending',
    description: 'Lend assets across 8+ blockchain networks',
    metric: '8+ Chains'
  },
  {
    icon: Clock,
    title: 'Instant Withdrawals',
    description: 'Withdraw your funds anytime without lock periods',
    metric: '24/7 Access'
  }
]

export function LendingSection() {
  return (
    <section className="container space-y-6 py-8 md:py-12 lg:py-24">
      <div className="mx-auto flex max-w-[980px] flex-col items-center gap-2 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Badge variant="outline" className="mb-4">
            💰 Lending Pools
          </Badge>
        </motion.div>
        <motion.h2
          className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          Earn While You Sleep
        </motion.h2>
        <motion.p
          className="max-w-[700px] text-lg text-muted-foreground sm:text-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Deposit your crypto assets into our lending pools and earn passive income with competitive APY rates across multiple blockchain networks.
        </motion.p>
      </div>

      {/* Lending Features */}
      <motion.div
        className="mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        viewport={{ once: true }}
      >
        {lendingFeatures.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="text-center transition-all hover:shadow-lg">
              <CardHeader className="pb-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {feature.description}
                </p>
                <div className="text-xl font-bold text-primary">
                  {feature.metric}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Lending Pools */}
      <motion.div
        className="mx-auto max-w-6xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        viewport={{ once: true }}
      >
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-2">Active Lending Pools</h3>
          <p className="text-muted-foreground">
            Choose from our high-yield lending opportunities
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lendingPools.map((pool, index) => (
            <motion.div
              key={`${pool.asset}-${pool.chain}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="transition-all hover:shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{pool.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{pool.asset}</CardTitle>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${pool.chainColor}`}></div>
                          <span className="text-sm text-muted-foreground">{pool.chain}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={pool.risk === 'Low' ? 'secondary' : 'outline'} className="text-xs">
                      {pool.risk} Risk
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-2xl text-green-600">{pool.apy}</div>
                      <div className="text-muted-foreground">APY</div>
                    </div>
                    <div>
                      <div className="font-medium">{pool.totalDeposited}</div>
                      <div className="text-muted-foreground">Total Deposited</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Utilization Rate</span>
                      <span className="font-medium">{pool.utilization}%</span>
                    </div>
                    <Progress value={pool.utilization} className="h-2" />
                  </div>

                  <Button className="w-full">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Lend {pool.asset}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        className="mx-auto max-w-2xl text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        viewport={{ once: true }}
      >
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Earning?</h3>
            <p className="text-muted-foreground mb-6">
              Connect your wallet and start earning passive income with our secure lending pools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                Connect Wallet
              </Button>
              <Button variant="outline" size="lg">
                View All Pools
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  )
} 