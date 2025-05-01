'use client'

import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          Transforme une idée en un agent AI prêt à déployer
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Tape ton idée de prompt. Teste-la. Optimise. Déploie ton propre agent AI en quelques secondes.
        </p>
        <button
          onClick={() => router.push('/builder')}
          className="mt-8 bg-black text-white px-6 py-3 rounded-lg text-lg hover:bg-gray-800 transition"
        >
          Créer mon agent
        </button>
      </div>
    </main>
  )
}
