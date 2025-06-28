'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, DollarSign, Zap } from 'lucide-react'

const stats = [
  {
    icon: DollarSign,
    label: 'Total Value Locked',
    value: '$2.4B',
    description: 'Assets secured across all chains'
  },
  {
    icon: TrendingUp,
    label: 'Average APY',
    value: '8.7%',
    description: 'Competitive lending rates'
  },
  {
    icon: Users,
    label: 'Active Users',
    value: '89.5K',
    description: 'Lending and borrowing participants'
  },
  {
    icon: Zap,
    label: 'Cross-Chain Pools',
    value: '127',
    description: 'Active pools across 8 chains'
  }
]

export function StatsSection() {
  return (
    <section className="border-t bg-muted/50">
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-[980px] text-center">
          <motion.h2
            className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Trusted by DeFi Users Worldwide
          </motion.h2>
          <motion.p
            className="mt-4 text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Join thousands of users earning yield and accessing liquidity across multiple blockchain networks
          </motion.p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold md:text-4xl">{stat.value}</div>
              <div className="mt-2 font-medium">{stat.label}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {stat.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
} 