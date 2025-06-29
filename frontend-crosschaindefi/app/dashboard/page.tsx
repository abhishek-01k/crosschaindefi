import { Metadata } from "next"
import LendingDashboard from "@/components/lending-dashboard"

export const metadata: Metadata = {
  title: "Dashboard | CrossChain DeFi",
  description: "Manage your cross-chain DeFi positions, lend, borrow, and earn yield across multiple blockchains.",
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <LendingDashboard />
    </div>
  )
} 