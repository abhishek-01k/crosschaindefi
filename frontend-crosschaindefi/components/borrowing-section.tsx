'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Shield, TrendingDown, AlertTriangle, Calculator, Wallet, RefreshCw } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const borrowingAssets = [
  {
    asset: 'USDC',
    borrowRate: '3.25%',
    available: '$8.7M',
    collateralFactor: '85%',
    chain: 'Ethereum',
    icon: '💰',
    chainColor: 'bg-blue-500'
  },
  {
    asset: 'ETH',
    borrowRate: '2.89%',
    available: '$5.4M',
    collateralFactor: '75%',
    chain: 'Arbitrum',
    icon: '⟠',
    chainColor: 'bg-cyan-500'
  },
  {
    asset: 'WBTC',
    borrowRate: '1.95%',
    available: '$3.2M',
    collateralFactor: '70%',
    chain: 'Polygon',
    icon: '₿',
    chainColor: 'bg-purple-500'
  },
  {
    asset: 'USDT',
    borrowRate: '3.15%',
    available: '$9.1M',
    collateralFactor: '85%',
    chain: 'Avalanche',
    icon: '💵',
    chainColor: 'bg-red-600'
  }
]

const healthFactorExamples = [
  {
    range: '2.0+',
    status: 'Healthy',
    color: 'bg-green-500',
    description: 'Safe borrowing position',
    risk: 'Low Risk'
  },
  {
    range: '1.5 - 2.0',
    status: 'Moderate',
    color: 'bg-yellow-500',
    description: 'Monitor your position',
    risk: 'Medium Risk'
  },
  {
    range: '1.0 - 1.5',
    status: 'Risky',
    color: 'bg-orange-500',
    description: 'Consider adding collateral',
    risk: 'High Risk'
  },
  {
    range: '< 1.0',
    status: 'Liquidation',
    color: 'bg-red-500',
    description: 'Position will be liquidated',
    risk: 'Liquidation Zone'
  }
]

const borrowingFeatures = [
  {
    icon: Shield,
    title: 'Overcollateralized Lending',
    description: 'Secure borrowing with crypto collateral',
    metric: 'Up to 85% LTV'
  },
  {
    icon: TrendingDown,
    title: 'Low Interest Rates',
    description: 'Competitive borrowing rates across chains',
    metric: 'From 1.95%'
  },
  {
    icon: AlertTriangle,
    title: 'Health Factor Monitoring',
    description: 'Real-time position tracking and alerts',
    metric: 'Live Updates'
  },
  {
    icon: RefreshCw,
    title: 'Flexible Repayment',
    description: 'Repay anytime with no penalties',
    metric: 'No Lock Period'
  }
]

export function BorrowingSection() {
  return (
    <section className="container space-y-6 py-8 md:py-12 lg:py-24 bg-muted/50">
      <div className="mx-auto flex max-w-[980px] flex-col items-center gap-2 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Badge variant="outline" className="mb-4">
            🏦 Borrowing
          </Badge>
        </motion.div>
        <motion.h2
          className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          Unlock Liquidity from Your Assets
        </motion.h2>
        <motion.p
          className="max-w-[700px] text-lg text-muted-foreground sm:text-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Borrow against your crypto holdings with competitive rates and flexible terms. Monitor your health factor to maintain a safe borrowing position.
        </motion.p>
      </div>

      {/* Borrowing Features */}
      <motion.div
        className="mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        viewport={{ once: true }}
      >
        {borrowingFeatures.map((feature, index) => (
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

      {/* Health Factor Guide */}
      <motion.div
        className="mx-auto max-w-4xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        viewport={{ once: true }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Health Factor Guide
            </CardTitle>
            <CardDescription>
              Understand your borrowing position safety with the health factor metric
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {healthFactorExamples.map((factor, index) => (
                <motion.div
                  key={factor.range}
                  className="p-4 border rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`h-3 w-3 rounded-full ${factor.color}`}></div>
                    <span className="font-medium">{factor.status}</span>
                  </div>
                  <div className="text-2xl font-bold mb-1">{factor.range}</div>
                  <div className="text-sm text-muted-foreground mb-2">{factor.description}</div>
                  <Badge variant="outline" className="text-xs">{factor.risk}</Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Borrowing Assets */}
      <motion.div
        className="mx-auto max-w-6xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-2">Available for Borrowing</h3>
          <p className="text-muted-foreground">
            Borrow these assets using your crypto as collateral
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {borrowingAssets.map((asset, index) => (
            <motion.div
              key={`${asset.asset}-${asset.chain}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="transition-all hover:shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{asset.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{asset.asset}</CardTitle>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${asset.chainColor}`}></div>
                          <span className="text-sm text-muted-foreground">{asset.chain}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-2xl text-red-600">{asset.borrowRate}</div>
                      <div className="text-muted-foreground">Borrow Rate</div>
                    </div>
                    <div>
                      <div className="font-medium">{asset.available}</div>
                      <div className="text-muted-foreground">Available</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Max LTV</span>
                    <span className="font-medium">{asset.collateralFactor}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="w-full">
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate
                    </Button>
                    <Button className="w-full">
                      <Wallet className="h-4 w-4 mr-2" />
                      Borrow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* How Borrowing Works */}
      <motion.div
        className="mx-auto max-w-4xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        viewport={{ once: true }}
      >
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-6 text-center">How Borrowing Works</h3>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">1. Deposit Collateral</h4>
                <p className="text-sm text-muted-foreground">
                  Deposit your crypto assets as collateral to secure your loan
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 mb-4">
                  <Calculator className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">2. Calculate Borrowing Power</h4>
                <p className="text-sm text-muted-foreground">
                  Determine how much you can borrow based on your collateral value
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 mb-4">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">3. Borrow & Monitor</h4>
                <p className="text-sm text-muted-foreground">
                  Borrow assets and monitor your health factor to avoid liquidation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  )
} 