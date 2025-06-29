import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  Bot, 
  BarChart3, 
  DollarSign, 
  Globe, 
  Shield, 
  Zap,
  TrendingUp,
  Users,
  Activity,
  Wallet
} from "lucide-react"

import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { LendingSection } from "@/components/lending-section"
import { BorrowingSection } from "@/components/borrowing-section"
import { CrossChainSection } from "@/components/cross-chain-section"
import { AgentsSection } from "@/components/agents-section"
import { TradingSection } from "@/components/trading-section"
// import { PredictionMarketsSection } from "@/components/prediction-markets-section"
import { PartnersSection } from "@/components/partners-section"
import { StatsSection } from "@/components/stats-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { Newsletter } from "@/components/newsletter"

// Protocol stats for the homepage
const protocolStats = [
  {
    title: "Total Value Locked",
    value: "$4.2M",
    description: "Across all supported chains",
    icon: DollarSign,
    color: "text-green-600"
  },
  {
    title: "Active Users",
    value: "2,120",
    description: "Cross-chain participants",
    icon: Users,
    color: "text-blue-600"
  },
  {
    title: "Transactions",
    value: "28,450",
    description: "Successfully processed",
    icon: Activity,
    color: "text-purple-600"
  },
  {
    title: "Supported Chains",
    value: "8+",
    description: "Multi-chain ecosystem",
    icon: Globe,
    color: "text-orange-600"
  }
]

const dashboardFeatures = [
  {
    title: "Lending & Borrowing",
    description: "Deposit assets to earn yield or borrow against your collateral across multiple chains with AI-optimized strategies.",
    icon: DollarSign,
    href: "/dashboard",
    features: ["Cross-chain deposits", "Dynamic yield optimization", "Health factor monitoring", "Automated liquidation protection"],
    color: "from-green-500 to-emerald-600"
  },
  {
    title: "AI Agents",
    description: "Automated arbitrage opportunities and market intelligence powered by Chainlink Functions and VRF.",
    icon: Bot,
    href: "/dashboard?tab=agents",
    features: ["Arbitrage detection", "Market analysis", "Risk assessment", "Automated execution"],
    color: "from-blue-500 to-cyan-600"
  },
  {
    title: "Analytics",
    description: "Comprehensive protocol metrics, cross-chain performance insights, and real-time market data.",
    icon: BarChart3,
    href: "/dashboard?tab=analytics",
    features: ["Protocol performance", "Cross-chain metrics", "User analytics", "Market trends"],
    color: "from-purple-500 to-violet-600"
  }
]

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Quick Stats */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {protocolStats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm font-medium mb-1">{stat.title}</div>
                  <div className="text-xs text-muted-foreground">{stat.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Comprehensive DeFi Dashboard</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Access all protocol features through our intuitive dashboard. Manage your positions, 
              monitor AI agents, and analyze performance across multiple chains.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {dashboardFeatures.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.color} text-white`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href={feature.href}>
                    <Button className="w-full group-hover:translate-y-[-2px] transition-transform">
                      Access {feature.title}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
              <CardContent className="pt-8">
                <div className="flex items-center justify-center mb-4">
                  <Wallet className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
                <p className="text-muted-foreground mb-6">
                  Connect your wallet and start earning yield across multiple blockchains with 
                  our AI-powered DeFi platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/dashboard">
                    <Button size="lg" className="w-full sm:w-auto">
                      <Wallet className="mr-2 h-5 w-5" />
                      Launch Dashboard
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    View Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <FeaturesSection />
      <LendingSection />
      <BorrowingSection />
      <CrossChainSection />
      <AgentsSection />
      <TradingSection />
      {/* <PredictionMarketsSection /> */}
      <StatsSection />
      <PartnersSection />
      <TestimonialsSection />
      <Newsletter />
    </div>
  )
}
