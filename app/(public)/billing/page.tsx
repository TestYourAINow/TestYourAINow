// app/billing/page.tsx
"use client"

import { useEffect } from "react"

export default function BillingPage() {
  useEffect(() => {
    const goToPortal = async () => {
      const res = await fetch("/api/stripe/portal", { method: "POST" })
      const data = await res.json()
      if (data?.url) {
        window.location.href = data.url
      } else {
        alert("Erreur de redirection vers le portail de facturation")
      }
    }

    goToPortal()
  }, [])

  return <p className="text-white p-8">Redirection vers le portail Stripe...</p>
}
