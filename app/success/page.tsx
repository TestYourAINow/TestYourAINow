"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function SuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const sessionId = searchParams.get("session_id")
    if (!sessionId) return

    const confirmSubscription = async () => {
      try {
        await fetch("/api/stripe/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        })

        router.push("/agents")
      } catch (error) {
        console.error("Erreur de confirmation", error)
      }
    }

    confirmSubscription()
  }, [searchParams, router])

  return (
    <div className="text-center text-white mt-20">
      Vérification du paiement...
    </div>
  )
}
