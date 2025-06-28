'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const chains = [
  { name: 'Ethereum', logo: '⟠', tvl: '$890M', color: 'bg-blue-500' },
  { name: 'Polygon', logo: '⬟', tvl: '$234M', color: 'bg-purple-500' },
  { name: 'Arbitrum', logo: '◆', tvl: '$567M', color: 'bg-cyan-500' },
  { name: 'Optimism', logo: '🔴', tvl: '$123M', color: 'bg-red-500' },
  { name: 'Base', logo: '🔵', tvl: '$89M', color: 'bg-blue-600' },
  { name: 'Avalanche', logo: '🔺', tvl: '$345M', color: 'bg-red-600' },
  { name: 'BSC', logo: '🟡', tvl: '$178M', color: 'bg-yellow-500' },
  { name: 'Solana', logo: '◉', tvl: '$456M', color: 'bg-gradient-to-r from-purple-400 to-pink-400' }
]

export function CrossChainSection() {
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
            🌐 Cross-Chain
          </Badge>
        </motion.div>

        <motion.h2
          className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          8+ Blockchain Networks
        </motion.h2>

        <motion.p
          className="max-w-[700px] text-lg text-muted-foreground sm:text-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Seamlessly operate across multiple blockchains with Chainlink CCIP ensuring secure and reliable cross-chain transactions.
        </motion.p>
      </div>

      <motion.div
        className="mx-auto grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        viewport={{ once: true }}
      >
        {chains.map((chain, index) => (
          <motion.div
            key={chain.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
            viewport={{ once: true }}
          >
            <Card className="text-center transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="text-4xl mb-2">{chain.logo}</div>
                <h3 className="font-semibold text-lg">{chain.name}</h3>
                <p className="text-sm text-muted-foreground">TVL: {chain.tvl}</p>
                <div className={`mt-3 h-1 rounded-full ${chain.color}`} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
} 