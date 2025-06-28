'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

const partners = [
  { name: 'Chainlink', logo: '🔗' },
  { name: 'Polymarket', logo: '📊' },
  { name: 'Ethereum', logo: '⟠' },
  { name: 'Polygon', logo: '⬟' },
  { name: 'Arbitrum', logo: '🔷' },
  { name: 'Optimism', logo: '🔴' }
]

export function PartnersSection() {
  return (
    <section className="container py-8">
      <div className="text-center mb-8">
        <Badge variant="outline" className="text-sm mb-4">
          🤝 Partners
        </Badge>
      </div>
      <motion.div
        className="flex flex-wrap items-center justify-center gap-8 opacity-60"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.6 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        {partners.map((partner) => (
          <div key={partner.name} className="flex items-center gap-2">
            <span className="text-2xl">{partner.logo}</span>
            <span className="font-medium">{partner.name}</span>
          </div>
        ))}
      </motion.div>
    </section>
  )
} 