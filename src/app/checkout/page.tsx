'use client'

import { useState } from 'react'

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: { name: 'Testmyai Premium' },
                unit_amount: 990
              },
              quantity: 1
            }
          ]
        })
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Erreur lors de la redirection.')
      }
    } catch (err) {
      console.error(err)
      alert('Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
      >
        {loading ? 'Redirection...' : 'Acheter maintenant – 9,90 $'}
      </button>
    </main>
  )
}
