'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Copy, Eye, EyeOff, CheckCircle, Play, Bot, Globe, MessageCircle, Clock, User, RefreshCw, Trash2, Settings, Facebook } from 'lucide-react'

// Custom Instagram Icon with real colors
const InstagramIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="instagram-gradient-launch" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f09433" />
        <stop offset="25%" stopColor="#e6683c" />
        <stop offset="50%" stopColor="#dc2743" />
        <stop offset="75%" stopColor="#cc2366" />
        <stop offset="100%" stopColor="#bc1888" />
      </linearGradient>
    </defs>
    <path fill="url(#instagram-gradient-launch)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

// ✅ TYPES EXISTANTS - RIEN CHANGÉ
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
  webhookId?: string
}

// 🆕 NOUVEAUX TYPES POUR MONGODB
type ConversationSummary = {
  _id: string
  conversationId: string
  userId: string
  lastMessage: string
  lastMessageTime: number
  messageCount: number
  isUser: boolean
  platform: string
}

type ConversationMessage = {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  isFiltered?: boolean
}

type ConversationDetails = {
  _id: string
  conversationId: string
  userId: string
  platform: string
  agentName?: string
  messages: ConversationMessage[]
  messageCount: number
  totalMessages: number
  firstMessageAt: string
  lastMessageAt: string
}

export default function ConnectionDetailsPage() {
  const params = useParams()
  const connectionId = params.id as string
  const integrationType = params.type as string

  // ✅ STATES EXISTANTS - RIEN CHANGÉ
  const [connection, setConnection] = useState<Connection | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSecret, setShowSecret] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)
  
  // 🆕 NOUVEAUX STATES POUR CONVERSATIONS (MongoDB)
  const [activeTab, setActiveTab] = useState<'conversations' | 'configuration'>('conversations')
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [conversationsLoading, setConversationsLoading] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<ConversationDetails | null>(null)
  const [conversationDetailsLoading, setConversationDetailsLoading] = useState(false)
  
  // 🆕 PAGINATION STATES
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // ✅ FONCTION EXISTANTE - RIEN CHANGÉ
  useEffect(() => {
    if (connectionId) {
      fetchConnection()
    }
  }, [connectionId])

  // 🆕 CHARGER LES CONVERSATIONS QUAND ON CHANGE D'ONGLET
  useEffect(() => {
    if (activeTab === 'conversations' && connection?.webhookId) {
      fetchConversations()
    }
  }, [activeTab, connection])

  // ✅ FONCTION EXISTANTE - RIEN CHANGÉ
  const fetchConnection = async () => {
    try {
      const res = await fetch(`/api/connections/${connectionId}`)
      const data = await res.json()
      console.log('API Response:', data)
      
      // ✅ EXACT - RIEN CHANGÉ
      setConnection(data.connection)
      
    } catch (error) {
      console.error('Error fetching connection:', error)
    } finally {
      setLoading(false)
    }
  }

  // 🆕 FONCTION POUR CHARGER LES CONVERSATIONS (MongoDB)
  const fetchConversations = async () => {
    setConversationsLoading(true)
    try {
      const res = await fetch(`/api/connections/${connectionId}/conversations`)
      const data = await res.json()
      
      if (data.success) {
        setConversations(data.conversations || [])
        console.log(`✅ Loaded ${data.conversations?.length || 0} conversations from MongoDB`)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setConversationsLoading(false)
    }
  }

  // 🆕 FONCTION POUR CHARGER UNE CONVERSATION DÉTAILLÉE
  const fetchConversationDetails = async (conversationId: string, loadMore = false, lastTimestamp?: number) => {
    if (!loadMore) {
      setConversationDetailsLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const res = await fetch(`/api/connections/${connectionId}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          conversationId,
          limit: 50,
          loadMore,
          lastTimestamp
        })
      })
      const data = await res.json()
      
      if (data.success) {
        if (loadMore && selectedConversation) {
          // Ajouter les nouveaux messages au début
          setSelectedConversation({
            ...selectedConversation,
            messages: [...data.conversation.messages, ...selectedConversation.messages]
          })
        } else {
          // Premier chargement
          setSelectedConversation(data.conversation)
        }
        setHasMoreMessages(data.pagination.hasMore)
        console.log(`✅ Loaded conversation with ${data.conversation.messages.length} messages`)
      }
    } catch (error) {
      console.error('Error fetching conversation details:', error)
    } finally {
      setConversationDetailsLoading(false)
      setLoadingMore(false)
    }
  }

  // 🆕 FONCTION POUR SUPPRIMER UNE CONVERSATION
  const deleteConversation = async (conversationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) {
      return
    }

    try {
      const res = await fetch(`/api/connections/${connectionId}/conversations`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId })
      })

      if (res.ok) {
        // Retirer de la liste
        setConversations(prev => prev.filter(conv => conv.conversationId !== conversationId))
        
        // Si c'était la conversation sélectionnée, revenir à la liste
        if (selectedConversation?.conversationId === conversationId) {
          setSelectedConversation(null)
        }
        
        console.log(`✅ Conversation deleted: ${conversationId}`)
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
  }

  // 🆕 CHARGER PLUS DE MESSAGES (scroll infini)
  const loadMoreMessages = () => {
    if (selectedConversation && hasMoreMessages && !loadingMore && selectedConversation.messages.length > 0) {
      const oldestMessage = selectedConversation.messages[0]
      fetchConversationDetails(selectedConversation.conversationId, true, oldestMessage.timestamp)
    }
  }

  // ✅ TOUTES LES FONCTIONS EXISTANTES - RIEN CHANGÉ
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
      case 'instagram-dms': return 'Instagram DMs Agent'
      case 'facebook-messenger': return 'Facebook Messenger Agent'
      default: return type
    }
  }

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'instagram-dms': return <InstagramIcon size={24} />
      case 'facebook-messenger': return <Facebook size={24} className="text-blue-400" />
      default: return <Globe size={24} className="text-gray-400" />
    }
  }

  // 🆕 FONCTION POUR FORMATER LE TEMPS
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Il y a quelques minutes'
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffHours < 48) return 'Hier'
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  // ✅ LOADING ET ERROR STATES - ARRIÈRE-PLAN ORIGINAL
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
    <div className="h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar bg-gray-950">
      
      {/* 🎨 HEADER - ARRIÈRE-PLAN ORIGINAL + DESIGN SYSTEM */}
      <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left - Back + Title */}
            <div className="flex items-center gap-4">
              <Link href="/launch-agent" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Back to Deployment Center</span>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-800/50 border border-gray-700/50 rounded-xl flex items-center justify-center">
                  {getIntegrationIcon(integrationType)}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{connection.name}</h1>
                  <p className="text-gray-400 text-sm hidden sm:block">{getIntegrationDisplayName(integrationType)}</p>
                </div>
              </div>
            </div>

            {/* Right - Tabs */}
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab('conversations')}
                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2 ${
                  activeTab === 'conversations' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <MessageCircle size={16} />
                Conversations
              </button>
              <button 
                onClick={() => setActiveTab('configuration')}
                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2 ${
                  activeTab === 'configuration' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Settings size={16} />
                Configuration
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ ONGLET CONFIGURATION - DESIGN SYSTEM APPLIQUÉ */}
      {activeTab === 'configuration' && (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* 🌐 WEBHOOK DETAILS */}
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
                <label className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
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
                    {copiedUrl ? <CheckCircle size={16} className="text-blue-400" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Webhook Secret */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
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
                      {copiedSecret ? <CheckCircle size={16} className="text-blue-400" /> : <Copy size={16} />}
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

            {/* 🤖 AI BUILD CONFIGURATION */}
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/40 rounded-xl flex items-center justify-center">
                  <Bot className="text-blue-400" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">AI Build Configuration</h2>
                  <p className="text-gray-400 text-sm">Select and manage the AI build connected to this {integrationType.replace('-', ' ')} agent.</p>
                </div>
              </div>

              {/* Connected AI Build */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
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
        </div>
      )}

      {/* 💬 ONGLET CONVERSATIONS - STYLE MESSENGER ORIGINAL */}
      {activeTab === 'conversations' && (
        <div className="h-[calc(100vh-80px)]">
          {!connection.webhookId ? (
            /* Message pour connections sans webhook */
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Conversations not available</h3>
                <p className="text-gray-400">
                  This connection type ({integrationType}) does not support conversation history.
                </p>
              </div>
            </div>
          ) : (
            /* LAYOUT MESSENGER - 2 COLONNES */
            <div className="flex h-full">
              
              {/* 📋 COLONNE GAUCHE - LISTE CONVERSATIONS (30%) */}
              <div className="w-full md:w-96 border-r border-gray-800 bg-gray-950 flex flex-col">
                {/* Header liste */}
                <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600/20 border border-blue-500/40 rounded-lg flex items-center justify-center">
                      <MessageCircle className="text-blue-400" size={16} />
                    </div>
                    <div>
                      <h2 className="font-bold text-white">Conversations</h2>
                      <p className="text-gray-400 text-xs">
                        {conversations.length} total
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={fetchConversations}
                    disabled={conversationsLoading}
                    className="w-8 h-8 bg-blue-600/20 hover:bg-blue-600/30 disabled:opacity-50 rounded-lg flex items-center justify-center text-blue-400 transition-all"
                  >
                    <RefreshCw size={14} className={conversationsLoading ? 'animate-spin' : ''} />
                  </button>
                </div>

                {/* Liste scrollable */}
                <div className="flex-1 overflow-y-auto">
                  {conversationsLoading ? (
                    <div className="p-8 text-center text-gray-400">
                      <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                      Loading conversations...
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 bg-gray-800/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-6 h-6 text-gray-400" />
                      </div>
                      <h3 className="font-bold text-white mb-2">No conversations yet</h3>
                      <p className="text-gray-400 text-sm">
                        Conversations will appear here once users start chatting.
                      </p>
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <div
                        key={conv._id}
                        onClick={() => fetchConversationDetails(conv.conversationId)}
                        className={`p-4 border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer transition-all group ${
                          selectedConversation?.conversationId === conv.conversationId 
                            ? 'bg-blue-900/20 border-blue-500/30' 
                            : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center group-hover:bg-gray-600/50 transition-all">
                            <User className="text-gray-400 group-hover:text-gray-300" size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-white text-sm truncate">
                                Customer #{conv.userId}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {formatTime(conv.lastMessageTime)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs text-gray-500">
                                {conv.messageCount}
                              </span>
                              <span className="text-xs text-gray-600">•</span>
                              <span className="text-xs text-gray-500">{conv.platform}</span>
                              {conv.isUser && (
                                <>
                                  <span className="text-xs text-gray-600">•</span>
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                </>
                              )}
                            </div>
                          </div>
                          {/* Delete button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteConversation(conv.conversationId)
                            }}
                            className="opacity-0 group-hover:opacity-100 w-6 h-6 bg-red-600/20 hover:bg-red-600/30 rounded flex items-center justify-center text-red-400 transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 💬 COLONNE DROITE - CONVERSATION DÉTAILLÉE (70%) */}
              <div className="flex-1 flex flex-col bg-gray-950">
                {selectedConversation ? (
                  <>
                    {/* Header conversation */}
                    <div className="p-4 border-b border-gray-800 bg-gray-900/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center">
                          <User className="text-gray-300" size={18} />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">Customer #{selectedConversation.userId}</h3>
                          <p className="text-gray-400 text-sm">{selectedConversation.totalMessages} messages • {selectedConversation.platform}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => fetchConversationDetails(selectedConversation.conversationId)}
                          className="w-8 h-8 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg flex items-center justify-center text-blue-400 transition-all"
                        >
                          <RefreshCw size={14} />
                        </button>
                        <button
                          onClick={() => deleteConversation(selectedConversation.conversationId)}
                          className="w-8 h-8 bg-red-600/20 hover:bg-red-600/30 rounded-lg flex items-center justify-center text-red-400 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Messages avec scroll infini */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {/* Bouton Load More en haut */}
                      {hasMoreMessages && (
                        <div className="p-3 border-b border-gray-800/50">
                          <button
                            onClick={loadMoreMessages}
                            disabled={loadingMore}
                            className="w-full py-2 px-4 bg-gray-800/50 hover:bg-gray-700/50 disabled:opacity-50 rounded-lg text-gray-300 transition-all text-sm"
                          >
                            {loadingMore ? 'Loading...' : 'Load older messages'}
                          </button>
                        </div>
                      )}

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {conversationDetailsLoading ? (
                          <div className="text-center text-gray-400 py-8">
                            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            Loading messages...
                          </div>
                        ) : (
                          selectedConversation.messages.map((message, index) => (
                            <div
                              key={index}
                              className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
                            >
                              <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-xl ${
                                message.role === 'user'
                                  ? 'bg-gray-800/50 text-white'
                                  : 'bg-blue-600/20 text-blue-200 border border-blue-500/30'
                              }`}>
                                <p className="text-sm">{message.content}</p>
                                <p className="text-xs mt-1 opacity-70">
                                  {formatTime(message.timestamp)}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>
                  </>
                ) : (
                  /* État par défaut - Aucune conversation sélectionnée */
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">Select a conversation</h3>
                      <p className="text-gray-400">
                        Choose a conversation from the list to view the chat history.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}