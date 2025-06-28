'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Users, Zap, DollarSign } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const stats = [
  { label: 'Total Value Locked', value: '$2.4B', icon: DollarSign },
  { label: 'Cross-Chain Txns', value: '1.2M+', icon: Zap },
  { label: 'Active Users', value: '89.5K', icon: Users },
  { label: 'Average APY', value: '18.7%', icon: TrendingUp },
]

export function StatsSection() {
  return (
    <section className="container py-8">
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        {stats.map((stat, index) => (
          <Card key={stat.label} className="transition-all hover:shadow-md">
            <CardContent className="p-6 text-center">
              <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </section>
  )
} 