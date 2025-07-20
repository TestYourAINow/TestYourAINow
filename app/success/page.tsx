// app/success/page.tsx
"use client"

import { useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"

function SuccessContent() {
  const router = useRouter()

  useEffect(() => {
    // Simple redirection après 3 secondes
    // Le webhook Stripe s'occupe maintenant de la mise à jour de la DB
    const timer = setTimeout(() => {
      router.push("/agents")
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="text-center text-white mt-20">
      <h1 className="text-3xl font-bold mb-4">🎉 Paiement réussi !</h1>
      <p className="text-lg mb-4">
        Votre abonnement est en cours d'activation...
      </p>
      <p className="text-sm opacity-75">
        Redirection automatique dans quelques secondes
      </p>
      
      {/* Loading spinner */}
      <div className="mt-8">
        <div className="inline-block w-8 h-8 border-4 border-white/20 border-l-white rounded-full animate-spin"></div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="text-center text-white mt-20">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}