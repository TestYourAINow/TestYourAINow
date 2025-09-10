'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Copy, Eye, EyeOff, CheckCircle, Bot, Globe, MessageCircle, User, RefreshCw, Trash2, Settings, Facebook, Zap, Webhook, Calendar,File } from 'lucide-react'
import { DeleteConversationModal } from '@/components/DeleteConversationModal';

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

// Types - MODIFIÉS
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

type ConversationSummary = {
  _id: string
  conversationId: string
  userId: string
  userFirstName?: string
  userLastName?: string
  userFullName?: string
  userProfilePic?: string
  userUsername?: string
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
  userFirstName?: string
  userLastName?: string
  userFullName?: string
  userProfilePic?: string
  userUsername?: string
  userGender?: string
  userLocale?: string
  userTimezone?: string
  messages: ConversationMessage[]
  messageCount: number
  totalMessages: number
  firstMessageAt: string
  lastMessageAt: string
}

// Avatar utilisateur avec fallback
const UserAvatar = ({ 
  profilePic, 
  firstName, 
  lastName, 
  username, 
  size = 40 
}: { 
  profilePic?: string
  firstName?: string
  lastName?: string
  username?: string
  size?: number 
}) => {
  const [imgError, setImgError] = useState(false)
  
  const getInitials = () => {
    if (firstName || lastName) {
      return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
    }
    if (username) {
      return username.substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  if (profilePic && !imgError) {
    return (
      <img
        src={profilePic}
        alt="Profile"
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
        onLoad={() => setImgError(false)}
      />
    )
  }

  return (
    <div 
      className="rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {getInitials()}
    </div>
  )
}

export default function ConnectionDetailsPage() {
  const params = useParams()
  const connectionId = params.id as string
  const integrationType = params.type as string

  // Basic states
  const [connection, setConnection] = useState<Connection | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSecret, setShowSecret] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)

  // Agent details states
  const [agentDetails, setAgentDetails] = useState<any>(null)
  const [agentLoading, setAgentLoading] = useState(false)
  const [userApiKeys, setUserApiKeys] = useState<any[]>([])

  // Conversation states
  const [activeTab, setActiveTab] = useState<'conversations' | 'configuration'>('conversations')
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [conversationsLoading, setConversationsLoading] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<ConversationDetails | null>(null)
  const [conversationDetailsLoading, setConversationDetailsLoading] = useState(false)

  // Pagination states
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // FONCTIONS D'AFFICHAGE
  const getUserDisplayName = (conv: ConversationSummary | ConversationDetails) => {
    // Instagram : Priorité au username Instagram si disponible
    if (conv.platform === 'instagram-dms' && conv.userUsername) {
      return `@${conv.userUsername}`;
    }
    
    // Facebook ou pas de username : Utiliser le nom complet
    if (conv.userFullName) return conv.userFullName;
    if (conv.userFirstName && conv.userLastName) return `${conv.userFirstName} ${conv.userLastName}`;
    if (conv.userFirstName) return conv.userFirstName;
    return `Customer #${conv.userId}`;
  }

  const getUserSubtitle = (conv: ConversationSummary | ConversationDetails) => {
    const details = [];
    
    // Instagram : Si on affiche @username, montrer le nom réel en sous-titre
    if (conv.platform === 'instagram-dms' && conv.userUsername) {
      const realName = conv.userFullName || 
                      (conv.userFirstName && conv.userLastName ? `${conv.userFirstName} ${conv.userLastName}` : null) ||
                      conv.userFirstName;
      if (realName) {
        details.push(realName);
      }
    }
    
    // Ajouter le nombre de messages
    if ('messageCount' in conv) {
      details.push(`${conv.messageCount} messages`);
    }
    
    // Platform en dernier seulement si pas d'autres infos importantes
    if (details.length === 0 || conv.platform !== 'instagram-dms') {
      details.push(conv.platform);
    }
    
    return details.join(' • ');
  }

  // Effects
  useEffect(() => {
    if (connectionId) {
      fetchConnection()
    }
  }, [connectionId])

  useEffect(() => {
    if (activeTab === 'conversations' && connection?.webhookId) {
      fetchConversations()
    }
  }, [activeTab, connection])

  useEffect(() => {
    if (activeTab === 'configuration' && connection?.aiBuildId) {
      fetchAgentDetails()
      fetchUserApiKeys()
    }
  }, [activeTab, connection])

  // Functions
  const fetchConnection = async () => {
    try {
      const res = await fetch(`/api/connections/${connectionId}`)
      const data = await res.json()
      console.log('API Response:', data)
      setConnection(data.connection)
    } catch (error) {
      console.error('Error fetching connection:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const fetchAgentDetails = async () => {
    setAgentLoading(true)
    try {
      const res = await fetch(`/api/agents/${connection?.aiBuildId}`)
      const data = await res.json()
      if (res.ok) {
        setAgentDetails(data)
      }
    } catch (error) {
      console.error('Error fetching agent details:', error)
    } finally {
      setAgentLoading(false)
    }
  }

  const fetchUserApiKeys = async () => {
    try {
      const res = await fetch('/api/user/api-key')
      const data = await res.json()
      if (res.ok) {
        setUserApiKeys(data.apiKeys || [])
      }
    } catch (error) {
      console.error('Error fetching user API keys:', error)
    }
  }

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
          setSelectedConversation({
            ...selectedConversation,
            messages: [...data.conversation.messages, ...selectedConversation.messages]
          })
        } else {
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

  const initiateDelete = (conversationId: string) => {
    setConversationToDelete(conversationId)
    setShowDeleteModal(true)
  }

  const cancelDelete = () => {
    if (!isDeleting) {
      setShowDeleteModal(false)
      setConversationToDelete(null)
    }
  }

  const confirmDelete = async () => {
    if (!conversationToDelete) return

    setIsDeleting(true)
    console.log(`🗑️ [FRONTEND] Delete conversation request: ${conversationToDelete}`)

    try {
      console.log(`🗑️ [FRONTEND] Sending DELETE request to /api/connections/${connectionId}/conversations`)
      console.log(`🗑️ [FRONTEND] Payload:`, { conversationId: conversationToDelete })

      const res = await fetch(`/api/connections/${connectionId}/conversations`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: conversationToDelete })
      })

      console.log(`🗑️ [FRONTEND] DELETE response status: ${res.status} ${res.statusText}`)

      const responseData = await res.json()
      console.log(`🗑️ [FRONTEND] DELETE response data:`, responseData)

      if (res.ok && responseData.success) {
        console.log(`✅ [FRONTEND] Delete successful, updating UI...`)

        setConversations(prev => {
          const filtered = prev.filter(conv => conv.conversationId !== conversationToDelete)
          console.log(`🔄 [FRONTEND] Conversations list updated: ${prev.length} -> ${filtered.length}`)
          return filtered
        })

        if (selectedConversation?.conversationId === conversationToDelete) {
          console.log(`🔄 [FRONTEND] Clearing selected conversation`)
          setSelectedConversation(null)
        }

        setShowDeleteModal(false)
        setConversationToDelete(null)

        console.log(`🔄 [FRONTEND] Waiting 500ms before refreshing list...`)
        setTimeout(() => {
          console.log(`🔄 [FRONTEND] Refreshing conversations list from server...`)
          fetchConversations()
        }, 500)

        console.log(`✅ [FRONTEND] Conversation deleted: ${conversationToDelete}`)

      } else {
        console.error(`❌ [FRONTEND] Delete failed:`, responseData)
        alert(`Error during deletion: ${responseData.error || 'Unknown error'}`)
        fetchConversations()
      }

    } catch (error) {
      console.error('❌ [FRONTEND] Error deleting conversation:', error)
      alert('Network error during deletion. Please try again.')
      fetchConversations()
    } finally {
      setIsDeleting(false)
    }
  }

  const loadMoreMessages = () => {
    if (selectedConversation && hasMoreMessages && !loadingMore && selectedConversation.messages.length > 0) {
      const oldestMessage = selectedConversation.messages[0]
      fetchConversationDetails(selectedConversation.conversationId, true, oldestMessage.timestamp)
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
      case 'instagram-dms': return 'Instagram DMs Agent'
      case 'facebook-messenger': return 'Facebook Messenger Agent'
      default: return type
    }
  }

 const getIntegrationIcon = (type: string) => {
  switch (type) {
    case 'webhook':
      return <Webhook size={12} className="text-blue-400" />
    case 'calendly':
      return <Calendar size={12} className="text-emerald-400" />
    case 'files':
      return <File size={12} className="text-purple-400" />
    case 'instagram-dms':
      return <InstagramIcon size={12} className="text-pink-400" />
    case 'facebook-messenger':
      return <Facebook size={12} className="text-blue-400" />
    default:
      return <Settings size={12} className="text-gray-400" />
  }
}

const getPlatformIcon = (type: string) => {
  switch (type) {
    case 'instagram-dms': 
      return <InstagramIcon size={24} />
    case 'facebook-messenger': 
      return <Facebook size={24} className="text-blue-400" />
    default: 
      return <Globe size={24} className="text-gray-400" />
  }
}

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffHours < 1) return 'A few minutes ago'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffHours < 48) return 'Yesterday'
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  const getApiKeyName = (apiKeyString: string) => {
    if (apiKeyString.length === 24 && /^[0-9a-fA-F]{24}$/.test(apiKeyString)) {
      const foundKey = userApiKeys.find(key => key.id === apiKeyString)
      return foundKey ? foundKey.name : 'Unknown Key'
    }
    
    const foundKey = userApiKeys.find(key => {
      return key.maskedKey.includes(apiKeyString.slice(-4))
    })
    
    return foundKey ? foundKey.name : 'Unknown Key'
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
    <div className="h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar bg-gray-950">

      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="px-4 md:px-8 py-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4 flex-shrink-0">
              <Link href="/launch-agent" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Back</span>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-800/50 border border-gray-700/50 rounded-xl flex items-center justify-center">
                  {getPlatformIcon(integrationType)}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{connection.name}</h1>
                  <p className="text-gray-400 text-sm hidden sm:block">{getIntegrationDisplayName(integrationType)}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setActiveTab('conversations')}
                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2 ${activeTab === 'conversations'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
              >
                <MessageCircle size={16} />
                <span className="hidden sm:inline">Conversations</span>
              </button>
              <button
                onClick={() => setActiveTab('configuration')}
                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2 ${activeTab === 'configuration'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
              >
                <Settings size={16} />
                <span className="hidden sm:inline">Configuration</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Tab */}
      {activeTab === 'configuration' && (
        <div className="w-full p-4 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

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

              <div className="space-y-4">
                <a
                  href="https://manychat.com/free-trial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Zap size={18} />
                  Get ManyChat Free Month
                </a>

                <div className="bg-gray-800/40 rounded-xl p-4 space-y-3">
                  <h4 className="font-semibold text-white text-sm mb-3">Step-by-step:</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p><strong>1 -</strong> Create a ManyChat account for 1 month free by clicking above.</p>
                    <p>
                      <strong>2 - </strong>
                      <a
                        href="https://manychat.com/template/instagram-ai-agent"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 underline font-medium"
                      >
                        Click this template
                      </a>
                      <span> to add it to your ManyChat account.</span>
                    </p>
                    <p><strong>3 -</strong> Connect your social accounts and get your first AI response.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Build Configuration */}
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/40 rounded-xl flex items-center justify-center">
                  <Bot className="text-blue-400" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">AI Build Configuration</h2>
                  <p className="text-gray-400 text-sm">AI agent connected to this {integrationType.replace('-', ' ')} integration.</p>
                </div>
              </div>

              {agentLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <label className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      Connected AI Agent
                    </label>
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
                          <Bot className="text-blue-400" size={18} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{agentDetails?.name || connection.aiName || 'AI Agent'}</h3>
                          <p className="text-gray-400 text-sm">Agent ID: {connection.aiBuildId}</p>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-600/20 border border-green-500/30 rounded-full">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-green-400 text-xs font-medium">Connected</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {agentDetails && (
                    <div className="mb-6">
                      <label className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        Technical Configuration
                      </label>
                      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-gray-400 text-sm">Model:</span>
                            <p className="text-white font-medium">{agentDetails.openaiModel}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 text-sm">Temperature:</span>
                            <p className="text-white font-medium">{agentDetails.temperature}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 text-sm">Top P:</span>
                            <p className="text-white font-medium">{agentDetails.top_p}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 text-sm">API Key:</span>
                            <p className="text-white font-medium">{getApiKeyName(agentDetails.apiKey)}</p>
                          </div>
                        </div>
                        
                        {agentDetails.integrations && agentDetails.integrations.length > 0 && (
                          <div className="pt-2 border-t border-gray-700/50">
                            <span className="text-gray-400 text-sm">Integrations:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {agentDetails.integrations.map((integration: any, index: number) => (
                                <div
                                  key={index}
                                  className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-200 text-xs"
                                >
                                  {getIntegrationIcon(integration.type)}
                                  <span className="truncate max-w-[80px]">
                                    {integration.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-gray-800/40 rounded-xl">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Connection Status:</span>
                        <span className="text-green-400 text-sm font-medium">Active</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Created:</span>
                        <span className="text-white text-sm">
                          {connection.createdAt ? new Date(connection.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : 'Unknown date'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Platform:</span>
                        <span className="text-white text-sm capitalize">{integrationType.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Conversations Tab */}
      {activeTab === 'conversations' && (
        <div className="h-[calc(100vh-80px)]">
          {!connection.webhookId ? (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Conversations not available</h3>
                <p className="text-gray-400">
                  This connection type ({integrationType}) does not support conversation history.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile: Navigation liste ↔ détail */}
              <div className="lg:hidden h-full">
                {selectedConversation ? (
                  <div className="flex flex-col h-full">
                    <div className="p-3 border-b border-gray-800 flex items-center gap-3 bg-gray-900/30">
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                      >
                        <ArrowLeft size={16} />
                      </button>
                      <div className="flex items-center gap-3 flex-1">
                        <UserAvatar 
                          profilePic={selectedConversation.userProfilePic}
                          firstName={selectedConversation.userFirstName}
                          lastName={selectedConversation.userLastName}
                          username={selectedConversation.userUsername}
                          size={32}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white text-sm truncate">
                            {getUserDisplayName(selectedConversation)}
                          </h3>
                          <p className="text-gray-400 text-xs">
                            {getUserSubtitle(selectedConversation)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => initiateDelete(selectedConversation.conversationId)}
                        className="w-8 h-8 bg-red-600/20 hover:bg-red-600/30 rounded-lg flex items-center justify-center text-red-400 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex-1 flex flex-col overflow-hidden">
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

                      <div className="flex-1 overflow-y-auto p-3 space-y-3">
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
                              <div className={`max-w-xs px-3 py-2 rounded-xl ${message.role === 'user'
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
                  </div>
                ) : (
                  <div className="h-full overflow-y-auto">
                    <div className="p-3 border-b border-gray-800 flex items-center justify-between bg-gray-900/30">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-600/20 border border-blue-500/40 rounded-lg flex items-center justify-center">
                          <MessageCircle className="text-blue-400" size={12} />
                        </div>
                        <div>
                          <h2 className="font-bold text-white text-sm">Conversations</h2>
                          <p className="text-gray-400 text-xs">
                            {conversations.length} total
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={fetchConversations}
                        disabled={conversationsLoading}
                        className="w-6 h-6 bg-blue-600/20 hover:bg-blue-600/30 disabled:opacity-50 rounded-lg flex items-center justify-center text-blue-400 transition-all"
                      >
                        <RefreshCw size={12} className={conversationsLoading ? 'animate-spin' : ''} />
                      </button>
                    </div>

                    {conversationsLoading ? (
                      <div className="p-6 text-center text-gray-400">
                        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        Loading conversations...
                      </div>
                    ) : conversations.length === 0 ? (
                      <div className="p-6 text-center">
                        <div className="w-12 h-12 bg-gray-800/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <MessageCircle className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="font-bold text-white mb-2 text-sm">No conversations yet</h3>
                        <p className="text-gray-400 text-xs">
                          Conversations will appear here once users start chatting.
                        </p>
                      </div>
                    ) : (
                      conversations.map((conv) => (
                        <div
                          key={conv._id}
                          onClick={() => fetchConversationDetails(conv.conversationId)}
                          className="p-3 border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <UserAvatar 
                              profilePic={conv.userProfilePic}
                              firstName={conv.userFirstName}
                              lastName={conv.userLastName}
                              username={conv.userUsername}
                              size={32}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-white text-xs truncate">
                                  {getUserDisplayName(conv)}
                                </h4>
                                <span className="text-xs text-gray-500">
                                  {formatTime(conv.lastMessageTime)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs text-gray-500">
                                  {getUserSubtitle(conv)}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                initiateDelete(conv.conversationId)
                              }}
                              className="w-6 h-6 bg-red-600/20 hover:bg-red-600/30 rounded flex items-center justify-center text-red-400 transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Desktop: Layout 2 colonnes */}
              <div className="hidden lg:flex h-full">
                <div className="w-96 border-r border-gray-800 bg-gray-950 flex flex-col">
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
                          className={`p-4 border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer transition-all group ${selectedConversation?.conversationId === conv.conversationId
                              ? 'bg-blue-900/20 border-blue-500/30'
                              : ''
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <UserAvatar 
                              profilePic={conv.userProfilePic}
                              firstName={conv.userFirstName}
                              lastName={conv.userLastName}
                              username={conv.userUsername}
                              size={40}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-white text-sm truncate">
                                  {getUserDisplayName(conv)}
                                </h4>
                                <span className="text-xs text-gray-500">
                                  {formatTime(conv.lastMessageTime)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs text-gray-500">
                                  {getUserSubtitle(conv)}
                                </span>
                                {conv.isUser && (
                                  <>
                                    <span className="text-xs text-gray-600">•</span>
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                  </>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                initiateDelete(conv.conversationId)
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

                <div className="flex-1 flex flex-col bg-gray-950">
                  {selectedConversation ? (
                    <>
                      <div className="p-4 border-b border-gray-800 bg-gray-900/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <UserAvatar 
                            profilePic={selectedConversation.userProfilePic}
                            firstName={selectedConversation.userFirstName}
                            lastName={selectedConversation.userLastName}
                            username={selectedConversation.userUsername}
                            size={40}
                          />
                          <div>
                            <h3 className="font-bold text-white">{getUserDisplayName(selectedConversation)}</h3>
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                              <span>{getUserSubtitle(selectedConversation)}</span>
                            </div>
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
                            onClick={() => initiateDelete(selectedConversation.conversationId)}
                            className="w-8 h-8 bg-red-600/20 hover:bg-red-600/30 rounded-lg flex items-center justify-center text-red-400 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col overflow-hidden">
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
                                <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-xl ${message.role === 'user'
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
            </>
          )}
        </div>
      )}

      <DeleteConversationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="Delete Conversation"
        message="Are you sure you want to delete this conversation? This action cannot be undone and will permanently remove all messages from the database."
      />

    </div>
  )
}