'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'DeFi Trader',
    content: 'The AI agents have completely transformed my trading strategy. I\'m earning 30% more with significantly less effort.',
    rating: 5,
    avatar: '👩‍💻'
  },
  {
    name: 'Marcus Rodriguez', 
    role: 'Crypto Fund Manager',
    content: 'CrossChainDefi\'s cross-chain capabilities are unmatched. We\'ve moved $50M+ across chains with zero issues.',
    rating: 5,
    avatar: '👨‍💼'
  },
  {
    name: 'Emma Thompson',
    role: 'Institutional Investor', 
    content: 'The prediction markets integration with AI insights has given us an edge in portfolio allocation decisions.',
    rating: 5,
    avatar: '👩‍💼'
  }
]

export function TestimonialsSection() {
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
            💬 Testimonials
          </Badge>
        </motion.div>

        <motion.h2
          className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          Trusted by Thousands
        </motion.h2>
      </div>

      <motion.div
        className="mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        viewport={{ once: true }}
      >
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
            viewport={{ once: true }}
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">{testimonial.content}</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{testimonial.avatar}</span>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
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