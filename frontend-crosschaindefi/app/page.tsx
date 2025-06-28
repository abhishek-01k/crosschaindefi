import Link from "next/link"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { AgentsSection } from "@/components/agents-section"
import { StatsSection } from "@/components/stats-section"
import { TradingSection } from "@/components/trading-section"
import { PredictionMarketsSection } from "@/components/prediction-markets-section"
import { CrossChainSection } from "@/components/cross-chain-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { PartnersSection } from "@/components/partners-section"
import { Newsletter } from "@/components/newsletter"

export default function IndexPage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <AgentsSection />
      <TradingSection />
      <PredictionMarketsSection />
      <CrossChainSection />
      <TestimonialsSection />
      <PartnersSection />
      <Newsletter />
    </>
  )
}
