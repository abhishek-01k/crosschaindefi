'use client'

import { motion } from 'framer-motion'
import { 
  Bot, 
  Brain, 
  Shuffle, 
  Cog,
  Activity, 
  TrendingUp, 
  DollarSign,
  Clock,
  Zap,
  Shield
} from 'lucide-react'

import { siteConfig } from '@/config/site'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const agents = [
  {
    id: 1,
    name: 'Arbitrage Coordinator',
    description: 'Orchestrates cross-chain arbitrage opportunities across multiple DEXs and chains',
    icon: TrendingUp,
    status: 'Active',
    performance: '+23.4%',
    successRate: 94,
    trades: '1,247',
    volume: '$2.1M',
    capabilities: ['Cross-chain Analysis', 'DEX Aggregation', 'Gas Optimization', 'Risk Assessment'],
    chainlinkServices: ['CCIP', 'Data Feeds', 'Automation'],
  },
  {
    id: 2,
    name: 'Market Intelligence',
    description: 'Analyzes prediction markets, generates insights, and identifies trading opportunities',
    icon: Brain,
    status: 'Active',
    performance: '+18.7%',
    successRate: 87,
    trades: '892',
    volume: '$1.4M',
    capabilities: ['Market Analysis', 'Sentiment Analysis', 'Price Prediction', 'Risk Modeling'],
    chainlinkServices: ['Data Streams', 'Functions', 'Price Feeds'],
  },
  {
    id: 3,
    name: 'Cross-Chain Bridge',
    description: 'Manages CCIP transactions, liquidity movement, and cross-chain asset transfers',
    icon: Zap,
    status: 'Active',
    performance: '+31.2%',
    successRate: 98,
    trades: '3,456',
    volume: '$5.7M',
    capabilities: ['Asset Bridging', 'Liquidity Management', 'Transaction Optimization', 'Failure Recovery'],
    chainlinkServices: ['CCIP', 'Automation', 'Data Feeds'],
  },
  {
    id: 4,
    name: 'AI Computation',
    description: 'Executes ML computations and predictions using Chainlink Functions',
    icon: Bot,
    status: 'Active',
    performance: '+15.9%',
    successRate: 91,
    trades: '654',
    volume: '$890K',
    capabilities: ['Machine Learning', 'Predictive Analytics', 'Data Processing', 'Model Training'],
    chainlinkServices: ['Functions', 'Data Streams', 'VRF'],
  },
  {
    id: 5,
    name: 'Automation Agent',
    description: 'Manages automated job execution, scheduling, and decentralized workflows',
    icon: Cog,
    status: 'Active',
    performance: '+27.1%',
    successRate: 96,
    trades: '2,103',
    volume: '$3.2M',
    capabilities: ['Job Scheduling', 'Workflow Automation', 'Event Monitoring', 'Task Orchestration'],
    chainlinkServices: ['Automation', 'Functions', 'Data Feeds'],
  },
  {
    id: 6,
    name: 'Randomization Agent',
    description: 'Provides verifiable randomness for strategy diversification and market making',
    icon: Shuffle,
    status: 'Active',
    performance: '+12.3%',
    successRate: 89,
    trades: '445',
    volume: '$670K',
    capabilities: ['Random Generation', 'Strategy Diversification', 'A/B Testing', 'Portfolio Rebalancing'],
    chainlinkServices: ['VRF', 'Automation', 'Functions'],
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function AgentsSection() {
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
            🤖 AI Agents
          </Badge>
        </motion.div>

        <motion.h2
          className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          6 Autonomous AI Agents
        </motion.h2>

        <motion.p
          className="max-w-[700px] text-lg text-muted-foreground sm:text-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Each agent specializes in different aspects of DeFi operations, working together to maximize 
          opportunities and minimize risks across the multi-chain ecosystem.
        </motion.p>
      </div>

      <motion.div
        className="mx-auto grid justify-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {agents.map((agent) => (
          <motion.div key={agent.id} variants={item}>
            <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <agent.icon className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {agent.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{agent.name}</CardTitle>
                <CardDescription className="text-sm">
                  {agent.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-green-600">{agent.performance}</div>
                    <div className="text-muted-foreground">Performance</div>
                  </div>
                  <div>
                    <div className="font-medium">{agent.successRate}%</div>
                    <div className="text-muted-foreground">Success Rate</div>
                  </div>
                  <div>
                    <div className="font-medium">{agent.trades}</div>
                    <div className="text-muted-foreground">Total Trades</div>
                  </div>
                  <div>
                    <div className="font-medium">{agent.volume}</div>
                    <div className="text-muted-foreground">Volume</div>
                  </div>
                </div>

                {/* Success Rate Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Success Rate</span>
                    <span className="font-medium">{agent.successRate}%</span>
                  </div>
                  <Progress value={agent.successRate} className="h-2" />
                </div>

                {/* Capabilities */}
                <div>
                  <div className="text-sm font-medium mb-2">Capabilities</div>
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 2).map((capability) => (
                      <Badge key={capability} variant="secondary" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                    {agent.capabilities.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{agent.capabilities.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Chainlink Services */}
                <div>
                  <div className="text-sm font-medium mb-2">Chainlink Services</div>
                  <div className="flex flex-wrap gap-1">
                    {agent.chainlinkServices.map((service) => (
                      <Badge key={service} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>

              {/* Hover effect */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 transition-opacity group-hover:opacity-100" />
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Overall Stats */}
      <motion.div
        className="mx-auto mt-16 max-w-4xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        viewport={{ once: true }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-center">AI Agent Performance Overview</CardTitle>
            <CardDescription className="text-center">
              Combined metrics from all 6 autonomous agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">+22.5%</div>
                <div className="text-sm text-muted-foreground">Avg Performance</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">93.2%</div>
                <div className="text-sm text-muted-foreground">Avg Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">10,586</div>
                <div className="text-sm text-muted-foreground">Total Trades</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">$17.9M</div>
                <div className="text-sm text-muted-foreground">Total Volume</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  )
} 