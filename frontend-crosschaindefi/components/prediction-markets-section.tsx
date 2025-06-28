'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Vote, Brain, Target } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const markets = [
  {
    title: '2024 US Presidential Election',
    probability: '67%',
    volume: '$12.4M',
    outcome: 'Democrat Win',
    change: '+3.2%'
  },
  {
    title: 'Bitcoin to reach $100K by 2024',
    probability: '42%',
    volume: '$8.7M',
    outcome: 'Yes',
    change: '+7.8%'
  },
  {
    title: 'Ethereum 2.0 Full Launch',
    probability: '89%',
    volume: '$5.3M',
    outcome: 'Before Q2 2024',
    change: '+1.4%'
  }
]

export function PredictionMarketsSection() {
  return (
    <section className="container space-y-6 py-8 md:py-12 lg:py-24">
      <div className="mx-auto flex max-w-[980px] flex-col items-center gap-2 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Badge variant="outline" className="text-sm mb-4">
            🎯 Prediction Markets
          </Badge>
        </motion.div>

        <motion.h2
          className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          Trade Real-World Events
        </motion.h2>

        <motion.p
          className="max-w-[700px] text-lg text-muted-foreground sm:text-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Access Polymarket's prediction markets with AI-powered insights and automated trading strategies.
        </motion.p>
      </div>

      <motion.div
        className="mx-auto max-w-4xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        viewport={{ once: true }}
      >
        <div className="grid gap-6 md:grid-cols-3">
          {markets.map((market, index) => (
            <motion.div
              key={market.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              viewport={{ once: true }}
            >
              <Card className="transition-all hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="text-base">{market.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Probability</span>
                    <span className="text-lg font-bold text-primary">{market.probability}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Volume</span>
                    <span className="font-medium">{market.volume}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Leading Outcome</span>
                    <span className="font-medium">{market.outcome}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">24h Change</span>
                    <span className="text-green-500 font-medium">{market.change}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="mx-auto max-w-2xl text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        viewport={{ once: true }}
      >
        <Button size="lg" className="mr-4">
          Explore Markets
        </Button>
        <Button variant="outline" size="lg">
          Learn More
        </Button>
      </motion.div>
    </section>
  )
} 