'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Bot, Zap, Shield, TrendingUp, Activity } from 'lucide-react'
import { motion } from 'framer-motion'

import { siteConfig } from '@/config/site'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const stats = [
  { label: 'Total Value Locked', value: '$2.4B', change: '+23.1%' },
  { label: 'Cross-Chain Transactions', value: '1.2M+', change: '+45.7%' },
  { label: 'AI Agents Active', value: '7/7', change: '100%' },
  { label: 'Supported Chains', value: '8', change: '+2 new' },
]

const features = [
  {
    icon: Bot,
    title: 'AI-Powered Agents',
    description: 'Autonomous agents executing strategies 24/7'
  },
  {
    icon: Zap,
    title: 'Cross-Chain Bridge',
    description: 'Seamless asset transfers via Chainlink CCIP'
  },
  {
    icon: Shield,
    title: 'Secure & Audited',
    description: 'Battle-tested smart contracts'
  },
  {
    icon: TrendingUp,
    title: 'Prediction Markets',
    description: 'Trade on real-world events'
  },
]

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section className="container relative space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
      <div className="mx-auto flex max-w-[980px] flex-col items-center gap-2 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="outline" className="text-sm">
            🎉 v1.0 Now Live - 7 AI Agents Operational
          </Badge>
        </motion.div>

        <motion.h1
          className="font-heading text-3xl leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          The Future of{' '}
          <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Cross-Chain DeFi
          </span>{' '}
          is Here
        </motion.h1>

        <motion.p
          className="max-w-[700px] text-lg text-muted-foreground sm:text-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Powered by AI agents, Chainlink services, and advanced prediction markets. 
          Trade, arbitrage, and earn across multiple blockchains with autonomous assistance.
        </motion.p>

        <motion.div
          className="flex flex-col gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button size="lg" className="h-12 px-8">
            Launch App
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="lg" className="h-12 px-8" asChild>
            <Link href="/dashboard">
              View Dashboard
            </Link>
          </Button>
        </motion.div>

        {/* Live Stats */}
        <motion.div
          className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold sm:text-3xl">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              <div className="text-xs text-green-500">{stat.change}</div>
            </div>
          ))}
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="relative rounded-lg border bg-background p-6 text-center shadow-sm transition-all hover:shadow-md"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 mx-0 max-w-none overflow-hidden">
        <div className="absolute left-1/2 top-0 ml-[-38rem] h-[25rem] w-[81.25rem] dark:[mask-image:linear-gradient(white,transparent)]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#36b49f] to-[#DBFF75] opacity-40 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] dark:from-[#36b49f]/30 dark:to-[#DBFF75]/30 dark:opacity-100">
            <svg
              aria-hidden="true"
              className="absolute inset-x-0 inset-y-[-50%] h-[200%] w-full skew-y-[-18deg] fill-black/40 stroke-black/50 mix-blend-overlay dark:fill-white/2.5 dark:stroke-white/5"
            >
              <defs>
                <pattern
                  id="83fd4e5a-9d52-42fc-97b6-718e5d7ee527"
                  width={72}
                  height={56}
                  patternUnits="userSpaceOnUse"
                  x="50%"
                  y={-1}
                >
                  <path d="M.5 56V.5H72" fill="none" />
                </pattern>
              </defs>
              <rect
                width="100%"
                height="100%"
                strokeWidth={0}
                fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
} 