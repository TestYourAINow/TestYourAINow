'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Settings, Zap, MessageSquare, Globe } from 'lucide-react'

// Composants d'icônes personnalisées
const InstagramIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f09433" />
        <stop offset="25%" stopColor="#e6683c" />
        <stop offset="50%" stopColor="#dc2743" />
        <stop offset="75%" stopColor="#cc2366" />
        <stop offset="100%" stopColor="#bc1888" />
      </linearGradient>
    </defs>
    <path
      fill="url(#instagram-gradient)"
      d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
    />
  </svg>
)

const FacebookIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="facebook-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00c6ff" />
        <stop offset="100%" stopColor="#0072ff" />
      </linearGradient>
    </defs>
    <path
      fill="url(#facebook-gradient)"
      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
    />
  </svg>
)

const SMSIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="sms-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00c851" />
        <stop offset="100%" stopColor="#007e33" />
      </linearGradient>
    </defs>
    <path
      fill="url(#sms-gradient)"
      d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"
    />
  </svg>
)

const WebsiteIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="website-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00d2ff" />
        <stop offset="100%" stopColor="#3a7bd5" />
      </linearGradient>
    </defs>
    <path
      fill="url(#website-gradient)"
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
    />
  </svg>
)

const integrations = [
  { label: 'Instagram DMs', value: 'instagram-dms', icon: InstagramIcon },
  { label: 'Website Widget', value: 'website-widget', icon: WebsiteIcon },
  { label: 'Facebook Messenger', value: 'facebook-messenger', icon: FacebookIcon },
  { label: 'SMS', value: 'sms', icon: SMSIcon },
]

type Agent = {
  _id: string
  name: string
  integrations?: { name: string; type: string }[]
}

export default function CreateConnectionPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [integration, setIntegration] = useState('')
  const [aiBuildId, setAiBuildId] = useState('')
  const [agents, setAgents] = useState<Agent[]>([])

  useEffect(() => {
    fetch('/api/agents')
      .then((res) => res.json())
      .then((data) => setAgents(data.agents || []))
      .catch((err) => console.error('Erreur lors du chargement des agents:', err))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          integrationType: integration,
          aiBuildId,
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Unknown error')

      router.push('/launch-agent')
    } catch (err) {
      alert('Error creating connection.')
      console.error(err)
    }
  }

  const selectedAgent = agents.find(a => a._id === aiBuildId)

  return (
    <div className="min-h-screen bg-transparent">
      <div className="flex justify-center min-h-screen py-6">
        <div className="w-full max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="mb-6">
            <Link href="/launch-agent" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4 transition">
              <ArrowLeft size={16} />
              Back to Launch Agent
            </Link>
            <h1 className="text-2xl font-semibold text-white mb-2">
              Create a Connection
            </h1>
            <p className="text-sm text-gray-400">
              Connect your AI agent to different platforms and services
            </p>
          </div>

          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            {/* Form Panel */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl text-white overflow-hidden" style={{ width: '600px' }}>
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* General Configuration */}
                  <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Settings className="text-blue-400" size={20} />
                      <h3 className="text-lg font-semibold text-blue-200">General Configuration</h3>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Connection Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="ex: Insta Inbound"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150 placeholder-gray-400"
                        required
                      />
                    </div>
                  </div>

                  {/* Choose Integration */}
                  <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Zap className="text-blue-400" size={20} />
                      <h3 className="text-lg font-semibold text-blue-200">Select an Integration</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {integrations.map((item) => {
                        const IconComponent = item.icon
                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => setIntegration(item.value)}
                            className={`border rounded-xl p-4 text-sm text-white transition-all duration-200 flex items-center gap-3 hover:scale-105
                              ${integration === item.value 
                                ? 'border-blue-400 bg-blue-500/20 shadow-lg ring-2 ring-blue-500/30' 
                                : 'border-gray-600 bg-gray-800/50 hover:border-blue-400 hover:bg-blue-500/10'
                              }`}
                          >
                            <IconComponent size={18} />
                            <span className="font-medium">{item.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Choose AI Build */}
                  <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <MessageSquare className="text-blue-400" size={20} />
                      <h3 className="text-lg font-semibold text-blue-200">Select an AI Agent</h3>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Select AI Build
                      </label>
                      <select
                        value={aiBuildId}
                        onChange={(e) => setAiBuildId(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150"
                        required
                      >
                        <option value="" disabled>Select one...</option>
                        {agents.map((agent) => (
                          <option key={agent._id} value={agent._id}>{agent.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Bouton de création */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={!name || !integration || !aiBuildId}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-700 disabled:opacity-50 text-white py-4 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                    >
                      <Settings className="w-5 h-5" />
                      Create Connection
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Info Panel */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl text-white overflow-hidden" style={{ width: '320px' }}>
              <div className="p-6 space-y-6">
                {/* Connection Preview */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Settings className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold text-blue-200">Connection Preview</h3>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>Name:</span>
                      <span className="text-white font-medium">{name || 'Not defined'}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Integration:</span>
                      <span className="text-white font-medium">
                        {integration ? integrations.find(i => i.value === integration)?.label : 'Not selected'}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>AI Agent:</span>
                      <span className="text-white font-medium">{selectedAgent?.name || 'Not selected'}</span>
                    </div>
                  </div>
                </div>

                {/* Information */}
                <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <MessageSquare className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold text-blue-200">Information</h3>
                  </div>
                  
                  <div className="text-sm text-gray-300 space-y-2">
                    <p>• A connection links an AI agent to a platform</p>
                    <p>• You can configure details after creation</p>
                    <p>• Each integration has its own settings</p>
                  </div>
                </div>

                {/* Available Integrations */}
                <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold text-blue-200">Available Integrations</h3>
                  </div>
                  
                  <div className="space-y-2">
                    {integrations.map((item) => {
                      const IconComponent = item.icon
                      return (
                        <div key={item.value} className="flex items-center gap-2 text-sm text-gray-300">
                          <IconComponent size={14} />
                          <span>{item.label}</span>
                          {integration === item.value && (
                            <span className="ml-auto text-blue-400 text-xs">✓ Selected</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}