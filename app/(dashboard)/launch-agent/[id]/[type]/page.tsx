'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Copy, Eye, EyeOff, CheckCircle, Play, Bot, Globe } from 'lucide-react'

type Connection = {
  _id: string
  name: string
  integrationType: string
  aiBuildId: string
  isActive: boolean
  webhookUrl?: string
  webhookSecret?: string
  aiName?: string
  createdAt?: string
}

export default function ConnectionDetailsPage() {
  const params = useParams()
  const connectionId = params.id as string
  const integrationType = params.type as string

  const [connection, setConnection] = useState<Connection | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSecret, setShowSecret] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)

  useEffect(() => {
    if (connectionId) {
      fetchConnection()
    }
  }, [connectionId])

const fetchConnection = async () => {
  try {
    const res = await fetch(`/api/connections/${connectionId}`)
    const data = await res.json()
    console.log('API Response:', data)
    
    // ✅ DIRECT
    setConnection(data.connection)
    
  } catch (error) {
    console.error('Error fetching connection:', error)
  } finally {
    setLoading(false)
  }
}

  const copyToClipboard = async (text: string, type: 'url' | 'secret') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'url') {
        setCopiedUrl(true)
        setTimeout(() => setCopiedUrl(false), 2000)
      } else {
        setCopiedSecret(true)
        setTimeout(() => setCopiedSecret(false), 2000)
      }
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const getIntegrationDisplayName = (type: string) => {
    switch (type) {
      case 'instagram-dms': return 'Instagram DM Agent'
      case 'facebook-messenger': return 'Facebook Messenger Agent'
      default: return type
    }
  }

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'instagram-dms': return '📱'
      case 'facebook-messenger': return '💬'
      default: return '🔗'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 p-4 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!connection) {
    return (
      <div className="min-h-screen bg-gray-950 p-4 flex items-center justify-center">
        <div className="text-white">Connection not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link href="/launch-agent" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeft size={16} />
          <span>Back to Deployment Center</span>
        </Link>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="text-3xl">{getIntegrationIcon(integrationType)}</div>
          <div>
            <h1 className="text-3xl font-bold text-white">{connection.name}</h1>
            <p className="text-gray-400">Agent ID: {connection._id} • Type: {getIntegrationDisplayName(integrationType)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-800">
          <button className="px-4 py-2 text-white border-b-2 border-emerald-500 bg-emerald-500/10">
            💬 Conversations
          </button>
          <button className="px-4 py-2 text-emerald-500 bg-emerald-600/20 border border-emerald-500/40 rounded-lg">
            ⚙️ Configuration
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Webhook Details */}
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-cyan-600/20 border border-cyan-500/40 rounded-xl flex items-center justify-center">
              <Globe className="text-cyan-400" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Webhook Details</h2>
              <p className="text-gray-400 text-sm">Use these details to connect your {integrationType.replace('-', ' ')} account via ManyChat.</p>
            </div>
          </div>

          {/* Webhook URL */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-3">
              Webhook URL
            </label>
            <div className="relative">
              <input
                type="text"
                value={connection.webhookUrl || 'Not generated'}
                readOnly
                className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl pr-12 font-mono text-sm"
              />
              <button
                onClick={() => connection.webhookUrl && copyToClipboard(connection.webhookUrl, 'url')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                disabled={!connection.webhookUrl}
              >
                {copiedUrl ? <CheckCircle size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Webhook Secret */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-3">
              Webhook Secret
            </label>
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                value={connection.webhookSecret || 'Not generated'}
                readOnly
                className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl pr-20 font-mono text-sm"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2">
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled={!connection.webhookSecret}
                >
                  {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => connection.webhookSecret && copyToClipboard(connection.webhookSecret, 'secret')}
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled={!connection.webhookSecret}
                >
                  {copiedSecret ? <CheckCircle size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Setup Guide Button */}
          <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
            <Play size={18} />
            Show Setup Guide & Video
          </button>
        </div>

        {/* AI Build Configuration */}
        <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-600/20 border border-emerald-500/40 rounded-xl flex items-center justify-center">
              <Bot className="text-emerald-400" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Build Configuration</h2>
              <p className="text-gray-400 text-sm">Select and manage the AI build connected to this {integrationType.replace('-', ' ')} agent.</p>
            </div>
          </div>

          {/* Connected AI Build */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-3">
              Connected AI Build
            </label>
            <input
              type="text"
              value={connection.aiName || connection.aiBuildId}
              readOnly
              className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl"
            />
          </div>

          {/* Manage AI Builds Button */}
          <Link
            href="/agents"
            className="w-full bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center"
          >
            Manage AI Builds
          </Link>

          {/* Connection Info */}
          <div className="mt-8 p-4 bg-gray-800/40 rounded-xl">
            <p className="text-gray-400 text-sm">
              This connection was created on {connection.createdAt ? new Date(connection.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long', 
                day: 'numeric'
              }) : 'Unknown date'}.
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Agent Name: <span className="text-white">{connection.name}</span> (Connection Name: <span className="text-white">{connection.name}</span>)
            </p>
          </div>
        </div>
      </div>

      {/* Empty Conversations State */}
      <div className="max-w-4xl mx-auto mt-12">
        <div className="bg-gray-900/30 border border-gray-700/50 rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <div className="text-4xl">💬</div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No conversations yet</h3>
          <p className="text-gray-400 mb-6">
            Once your {integrationType.replace('-', ' ')} is connected, conversations will appear here.
          </p>
          <div className="text-sm text-gray-500">
            Make sure to set up your ManyChat webhook with the details above.
          </div>
        </div>
      </div>
    </div>
  )
}