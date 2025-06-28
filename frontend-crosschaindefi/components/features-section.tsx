'use client'

import { motion } from 'framer-motion'
import { 
  Bot, 
  Zap, 
  Shield, 
  TrendingUp, 
  Coins, 
  Network,
  Lock,
  Activity
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    icon: Bot,
    title: 'AI-Powered Automation',
    description: 'Seven autonomous agents working 24/7 to optimize your DeFi strategies, analyze markets, and execute trades across multiple chains.',
    benefits: ['24/7 Operation', 'ML-Driven Strategies', 'Risk Management', 'Autonomous Execution']
  },
  {
    icon: Zap,
    title: 'Cross-Chain CCIP Bridge',
    description: 'Seamlessly transfer assets across 8+ blockchains using Chainlink CCIP with enterprise-grade security and reliability.',
    benefits: ['8+ Supported Chains', 'Instant Transfers', 'Low Fees', 'High Security']
  },
  {
    icon: TrendingUp,
    title: 'Prediction Markets',
    description: 'Access real-world prediction markets via Polymarket integration with AI-enhanced insights and automated trading strategies.',
    benefits: ['Real Events Trading', 'AI Market Analysis', 'Automated Strategies', 'High Liquidity']
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Battle-tested smart contracts, multi-signature wallets, and comprehensive audit trails ensure maximum security.',
    benefits: ['Smart Contract Audits', 'Multi-Sig Wallets', 'Insurance Coverage', 'Risk Monitoring']
  },
  {
    icon: Coins,
    title: 'Advanced Trading',
    description: 'Sophisticated trading tools including arbitrage detection, MEV protection, and advanced order types.',
    benefits: ['Arbitrage Detection', 'MEV Protection', 'Advanced Orders', 'Portfolio Analytics']
  },
  {
    icon: Network,
    title: 'Multi-Chain Portfolio',
    description: 'Unified dashboard to manage assets across all supported chains with real-time portfolio tracking and analytics.',
    benefits: ['Unified Dashboard', 'Real-time Tracking', 'Cross-Chain Analytics', 'Performance Metrics']
  }
]

export function FeaturesSection() {
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
            ⚡ Platform Features
          </Badge>
        </motion.div>

        <motion.h2
          className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          Next-Generation DeFi Features
        </motion.h2>

        <motion.p
          className="max-w-[700px] text-lg text-muted-foreground sm:text-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Built with cutting-edge technology and powered by Chainlink's oracle infrastructure 
          to deliver the most advanced cross-chain DeFi experience.
        </motion.p>
      </div>

      <motion.div
        className="mx-auto grid justify-center gap-6 sm:grid-cols-2 lg:grid-cols-3"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        viewport={{ once: true }}
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
            viewport={{ once: true }}
          >
            <Card className="h-full transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Key Benefits:</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {feature.benefits.map((benefit) => (
                      <div key={benefit} className="flex items-center text-sm">
                        <div className="mr-2 h-1 w-1 rounded-full bg-primary" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
} 