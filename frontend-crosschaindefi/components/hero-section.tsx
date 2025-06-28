'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, TrendingUp, Shield, Zap, DollarSign } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const platformStats = [
  { label: 'TVL', value: '$2.4B', icon: DollarSign },
  { label: 'Cross-chain Pools', value: '8+ Chains', icon: Zap },
  { label: 'Active Users', value: '89.5K', icon: TrendingUp },
  { label: 'Avg APY', value: '8.7%', icon: Shield },
]

const features = [
  'Cross-Chain Lending & Borrowing',
  'Competitive Interest Rates',
  'Real-time Health Factor Monitoring',
  'Instant Collateral Management',
]

export function HeroSection() {
  return (
    <section className="container space-y-6 py-8 md:py-12 lg:py-24">
      <div className="mx-auto flex max-w-[980px] flex-col items-center gap-2 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="outline" className="mb-4">
            🚀 Next-Generation DeFi Platform
          </Badge>
        </motion.div>
        
        <motion.h1
          className="font-heading text-3xl leading-[1.1] sm:text-5xl md:text-6xl lg:text-7xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Cross-Chain DeFi
          <br />
          <span className="gradient-text">Lending & Borrowing</span>
        </motion.h1>
        
        <motion.p
          className="max-w-[700px] text-lg text-muted-foreground sm:text-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Unlock the power of your crypto assets with our advanced lending and borrowing protocol. 
          Earn competitive yields and access liquidity across 8+ blockchain networks with Chainlink-powered security.
        </motion.p>

        <motion.div
          className="flex flex-col gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button size="lg" className="group">
            Start Lending
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button variant="outline" size="lg">
            Explore Borrowing
          </Button>
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {features.map((feature, index) => (
            <div key={feature} className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary"></div>
              <span>{feature}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Platform Stats */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {platformStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="rounded-xl border bg-card text-card-foreground shadow transition-all hover:shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
          >
            <div className="p-6 text-center">
              <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Benefits showcase */}
      <motion.div
        className="mx-auto max-w-4xl mt-16"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="grid gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 mb-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Earn High Yields</h3>
            <p className="text-muted-foreground">
              Lend your crypto assets and earn up to 11.28% APY with our optimized liquidity pools
            </p>
          </div>
          
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Borrowing</h3>
            <p className="text-muted-foreground">
              Borrow against your collateral with transparent health factor monitoring and no hidden fees
            </p>
          </div>
          
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 mb-4">
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Cross-Chain Access</h3>
            <p className="text-muted-foreground">
              Access DeFi opportunities across 8+ blockchain networks with Chainlink CCIP integration
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  )
} 