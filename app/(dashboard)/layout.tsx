  // app\(dashboard)\layout.tsx

import { ReactNode } from "react"
import { SidebarProvider } from "@/context/SidebarContext"
import ClientLayout from "@/components/ClientLayout"
import { Toaster } from "sonner"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { redirect } from "next/navigation"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Connect DB et check l’abonnement
  await connectToDatabase()
  const user = await User.findOne({ email: session.user.email })

  if (!user?.isSubscribed) {
    // 🔥 redirection directe vers Stripe Checkout
    redirect("/subscribe")
  }

  return (
    <SidebarProvider>
      <ClientLayout>
        {children}
      </ClientLayout>
    </SidebarProvider>
  )
}
