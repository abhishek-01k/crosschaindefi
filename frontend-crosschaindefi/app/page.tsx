import Link from "next/link"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { HeroSection } from "@/components/hero-section"
import { StatsSection } from "@/components/stats-section"
import { FeaturesSection } from "@/components/features-section"
import { LendingSection } from "@/components/lending-section"
import { BorrowingSection } from "@/components/borrowing-section"
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
      <LendingSection />
      <BorrowingSection />
      <CrossChainSection />
      <TestimonialsSection />
      <PartnersSection />
      <Newsletter />
    </>
  )
}
