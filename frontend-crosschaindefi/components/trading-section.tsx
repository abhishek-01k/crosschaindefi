'use client'

import { motion } from 'framer-motion'
import { LineChart, TrendingUp, Zap, Shield, Bot, Activity } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const tradingFeatures = [
  {
    icon: TrendingUp,
    title: 'Arbitrage Detection',
    description: 'AI-powered arbitrage opportunities across DEXs and chains',
    percentage: '94%',
    label: 'Success Rate'
  },
  {
    icon: Zap,
    title: 'Flash Loans',
    description: 'Capital-efficient trading with automated flash loan strategies',
    percentage: '$5.2M',
    label: 'Volume Today'
  },
  {
    icon: Shield,
    title: 'MEV Protection',
    description: 'Advanced protection against MEV attacks and front-running',
    percentage: '99.8%',
    label: 'Protection Rate'
  },
  {
    icon: Bot,
    title: 'AI Strategy',
    description: 'Machine learning models for optimal trading execution',
    percentage: '+31.2%',
    label: 'Avg Returns'
  }
]

export function TradingSection() {
  return (
    <section className="container space-y-6 py-8 md:py-12 lg:py-24 bg-muted/50">
      <div className="mx-auto flex max-w-[980px] flex-col items-center gap-2 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Badge variant="outline" className="text-sm mb-4">
            📈 Advanced Trading
          </Badge>
        </motion.div>

        <motion.h2
          className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          Professional Trading Tools
        </motion.h2>

        <motion.p
          className="max-w-[700px] text-lg text-muted-foreground sm:text-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Execute sophisticated trading strategies with AI assistance, MEV protection, 
          and cross-chain arbitrage opportunities.
        </motion.p>
      </div>

      <motion.div
        className="mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        viewport={{ once: true }}
      >
        {tradingFeatures.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
            viewport={{ once: true }}
          >
            <Card className="text-center transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {feature.description}
                </p>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary">
                    {feature.percentage}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {feature.label}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="mx-auto max-w-2xl text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        viewport={{ once: true }}
      >
        <Button size="lg" className="mr-4">
          Start Trading
        </Button>
        <Button variant="outline" size="lg">
          View Strategies
        </Button>
      </motion.div>
    </section>
  )
} 