// app/(dashboard)/launch-agent/[id]/webhook/page.tsx

'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Copy, CheckCircle, ExternalLink, Download, 
  Webhook, Zap, Settings, Play, AlertCircle, Code,
  ChevronRight, FileCode, Sparkles, Globe, MessageCircle,
  Bot, Link2, RefreshCw, Trash2, User, MessageSquare
} from 'lucide-react'
import FadeInSection from '@/components/FadeInSection'
import { toast } from 'react-hot-toast'
import { DeleteConversationModal } from '@/components/DeleteConversationModal'
import { formatMessageContent } from '@/lib/formatMessage'

// ==================== TYPES ====================

type Connection = {
  _id: string
  name: string
  integrationType: string
  webhookUrl?: string
  webhookId?: string
  webhookSecret?: string
  isActive: boolean
  aiName?: string
  createdAt: string
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
  platformDetails?: string // ← whatsapp, sms, slack, discord
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
  platformDetails?: string
  agentName?: string
  userFirstName?: string
  userLastName?: string
  userFullName?: string
  userProfilePic?: string
  userUsername?: string
  messages: ConversationMessage[]
  messageCount: number
  totalMessages: number
  firstMessageAt: string
  lastMessageAt: string
}

// ==================== HELPER FUNCTIONS ====================

const getNumericId = (userId: string) => {
  const hash = userId.split('_').pop() || '';
  let numeric = '';
  for (let i = 0; i < Math.min(hash.length, 6); i++) {
    const char = hash[i];
    if (/[0-9]/.test(char)) {
      numeric += char;
    } else if (/[a-zA-Z]/.test(char)) {
      numeric += (char.toLowerCase().charCodeAt(0) - 96).toString().slice(-1);
    }
  }
  return numeric.substring(0, 6);
};

const getPlatformIcon = (platformDetails?: string) => {
  switch (platformDetails) {
    case 'whatsapp':
      return '💬';
    case 'sms':
      return '📱';
    case 'slack':
      return '💼';
    case 'discord':
      return '🎮';
    case 'telegram':
      return '✈️';
    default:
      return '🔗';
  }
};

const getPlatformName = (platformDetails?: string) => {
  switch (platformDetails) {
    case 'whatsapp':
      return 'WhatsApp';
    case 'sms':
      return 'SMS';
    case 'slack':
      return 'Slack';
    case 'discord':
      return 'Discord';
    case 'telegram':
      return 'Telegram';
    default:
      return 'Webhook';
  }
};

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffHours < 1) return 'A few minutes ago';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffHours < 48) return 'Yesterday';
  return date.toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'short', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// ==================== TEMPLATE GENERATORS ====================

const generateWhatsAppTemplate = (webhookUrl: string, connectionName: string) => ({
  "name": `${connectionName} - WhatsApp via Twilio`,
  "flow": [
    {
      "id": 1,
      "module": "twilio:TriggerIncomingMessage",
      "version": 1,
      "parameters": {
        "accountSid": "YOUR_TWILIO_ACCOUNT_SID",
        "authToken": "YOUR_TWILIO_AUTH_TOKEN"
      },
      "mapper": {},
      "metadata": {
        "designer": { "x": 0, "y": 0 },
        "restore": {},
        "expect": [
          { "name": "Body", "type": "text", "label": "Message Body" },
          { "name": "From", "type": "text", "label": "Phone Number" }
        ]
      }
    },
    {
      "id": 2,
      "module": "http:ActionSendData",
      "version": 3,
      "parameters": {},
      "mapper": {
        "url": webhookUrl,
        "method": "post",
        "headers": [
          { "name": "Content-Type", "value": "application/json" }
        ],
        "bodyType": "raw",
        "parseResponse": true,
        "body": JSON.stringify({
          message: "{{1.Body}}",
          from: "{{1.From}}",
          contactId: "{{1.From}}",
          platform: "whatsapp"
        }, null, 2)
      },
      "metadata": {
        "designer": { "x": 300, "y": 0 },
        "restore": {
          "expect": {
            "method": { "mode": "chose", "label": "POST" },
            "bodyType": { "label": "Raw" }
          }
        }
      }
    },
    {
      "id": 3,
      "module": "twilio:SendMessage",
      "version": 1,
      "parameters": {},
      "mapper": {
        "to": "{{1.From}}",
        "from": "YOUR_TWILIO_WHATSAPP_NUMBER",
        "body": "⏳ Processing your message..."
      },
      "metadata": {
        "designer": { "x": 600, "y": 0 }
      }
    },
    {
      "id": 4,
      "module": "builtin:Sleep",
      "version": 1,
      "parameters": {},
      "mapper": { "delay": "10" },
      "metadata": {
        "designer": { "x": 900, "y": 0 }
      }
    },
    {
      "id": 5,
      "module": "http:ActionSendData",
      "version": 3,
      "parameters": {},
      "mapper": {
        "url": `${webhookUrl}/fetchresponse`,
        "method": "post",
        "headers": [
          { "name": "Content-Type", "value": "application/json" }
        ],
        "bodyType": "raw",
        "parseResponse": true,
        "body": JSON.stringify({
          from: "{{1.From}}",
          contactId: "{{1.From}}"
        }, null, 2)
      },
      "metadata": {
        "designer": { "x": 1200, "y": 0 },
        "restore": {
          "expect": {
            "method": { "mode": "chose", "label": "POST" },
            "bodyType": { "label": "Raw" }
          }
        }
      }
    },
    {
      "id": 6,
      "module": "twilio:SendMessage",
      "version": 1,
      "parameters": {},
      "mapper": {
        "to": "{{1.From}}",
        "from": "YOUR_TWILIO_WHATSAPP_NUMBER",
        "body": "{{5.data.text}}"
      },
      "metadata": {
        "designer": { "x": 1500, "y": 0 }
      }
    }
  ],
  "metadata": {
    "version": 1,
    "scenario": {
      "roundtrips": 1,
      "maxErrors": 3,
      "autoCommit": true,
      "sequential": false,
      "confidential": false,
      "dataloss": false,
      "dlq": false
    },
    "designer": { "orphans": [] },
    "zone": "us1.make.com"
  }
})

const generateSMSTemplate = (webhookUrl: string, connectionName: string) => ({
  "name": `${connectionName} - SMS via Twilio`,
  "flow": [
    {
      "id": 1,
      "module": "twilio:TriggerIncomingSMS",
      "version": 1,
      "parameters": {
        "accountSid": "YOUR_TWILIO_ACCOUNT_SID",
        "authToken": "YOUR_TWILIO_AUTH_TOKEN"
      },
      "mapper": {},
      "metadata": {
        "designer": { "x": 0, "y": 0 },
        "restore": {},
        "expect": [
          { "name": "Body", "type": "text", "label": "Message Body" },
          { "name": "From", "type": "text", "label": "Phone Number" }
        ]
      }
    },
    {
      "id": 2,
      "module": "http:ActionSendData",
      "version": 3,
      "parameters": {},
      "mapper": {
        "url": webhookUrl,
        "method": "post",
        "headers": [
          { "name": "Content-Type", "value": "application/json" }
        ],
        "bodyType": "raw",
        "parseResponse": true,
        "body": JSON.stringify({
          message: "{{1.Body}}",
          from: "{{1.From}}",
          contactId: "{{1.From}}",
          platform: "sms"
        }, null, 2)
      },
      "metadata": {
        "designer": { "x": 300, "y": 0 },
        "restore": {
          "expect": {
            "method": { "mode": "chose", "label": "POST" },
            "bodyType": { "label": "Raw" }
          }
        }
      }
    },
    {
      "id": 3,
      "module": "builtin:Sleep",
      "version": 1,
      "parameters": {},
      "mapper": { "delay": "10" },
      "metadata": {
        "designer": { "x": 600, "y": 0 }
      }
    },
    {
      "id": 4,
      "module": "http:ActionSendData",
      "version": 3,
      "parameters": {},
      "mapper": {
        "url": `${webhookUrl}/fetchresponse`,
        "method": "post",
        "headers": [
          { "name": "Content-Type", "value": "application/json" }
        ],
        "bodyType": "raw",
        "parseResponse": true,
        "body": JSON.stringify({
          from: "{{1.From}}",
          contactId: "{{1.From}}"
        }, null, 2)
      },
      "metadata": {
        "designer": { "x": 900, "y": 0 },
        "restore": {
          "expect": {
            "method": { "mode": "chose", "label": "POST" },
            "bodyType": { "label": "Raw" }
          }
        }
      }
    },
    {
      "id": 5,
      "module": "twilio:SendSMS",
      "version": 1,
      "parameters": {},
      "mapper": {
        "to": "{{1.From}}",
        "from": "YOUR_TWILIO_PHONE_NUMBER",
        "body": "{{4.data.text}}"
      },
      "metadata": {
        "designer": { "x": 1200, "y": 0 }
      }
    }
  ],
  "metadata": {
    "version": 1,
    "scenario": {
      "roundtrips": 1,
      "maxErrors": 3,
      "autoCommit": true,
      "sequential": false,
      "confidential": false,
      "dataloss": false,
      "dlq": false
    },
    "designer": { "orphans": [] },
    "zone": "us1.make.com"
  }
})

const generateSlackTemplate = (webhookUrl: string, connectionName: string) => ({
  "name": `${connectionName} - Slack`,
  "flow": [
    {
      "id": 1,
      "module": "slack:TriggerNewMessage",
      "version": 1,
      "parameters": {
        "connection": "slack-connection"
      },
      "mapper": {},
      "metadata": {
        "designer": { "x": 0, "y": 0 },
        "restore": {},
        "expect": [
          { "name": "text", "type": "text", "label": "Message Text" },
          { "name": "user", "type": "text", "label": "User ID" },
          { "name": "channel", "type": "text", "label": "Channel ID" }
        ]
      }
    },
    {
      "id": 2,
      "module": "http:ActionSendData",
      "version": 3,
      "parameters": {},
      "mapper": {
        "url": webhookUrl,
        "method": "post",
        "headers": [
          { "name": "Content-Type", "value": "application/json" }
        ],
        "bodyType": "raw",
        "parseResponse": true,
        "body": JSON.stringify({
          message: "{{1.text}}",
          from: "{{1.user}}",
          contactId: "{{1.user}}",
          channel: "{{1.channel}}",
          platform: "slack"
        }, null, 2)
      },
      "metadata": {
        "designer": { "x": 300, "y": 0 },
        "restore": {
          "expect": {
            "method": { "mode": "chose", "label": "POST" },
            "bodyType": { "label": "Raw" }
          }
        }
      }
    },
    {
      "id": 3,
      "module": "builtin:Sleep",
      "version": 1,
      "parameters": {},
      "mapper": { "delay": "5" },
      "metadata": {
        "designer": { "x": 600, "y": 0 }
      }
    },
    {
      "id": 4,
      "module": "http:ActionSendData",
      "version": 3,
      "parameters": {},
      "mapper": {
        "url": `${webhookUrl}/fetchresponse`,
        "method": "post",
        "headers": [
          { "name": "Content-Type", "value": "application/json" }
        ],
        "bodyType": "raw",
        "parseResponse": true,
        "body": JSON.stringify({
          from: "{{1.user}}",
          contactId: "{{1.user}}"
        }, null, 2)
      },
      "metadata": {
        "designer": { "x": 900, "y": 0 },
        "restore": {
          "expect": {
            "method": { "mode": "chose", "label": "POST" },
            "bodyType": { "label": "Raw" }
          }
        }
      }
    },
    {
      "id": 5,
      "module": "slack:SendMessage",
      "version": 1,
      "parameters": {},
      "mapper": {
        "channel": "{{1.channel}}",
        "text": "{{4.data.text}}"
      },
      "metadata": {
        "designer": { "x": 1200, "y": 0 }
      }
    }
  ],
  "metadata": {
    "version": 1,
    "scenario": {
      "roundtrips": 1,
      "maxErrors": 3,
      "autoCommit": true,
      "sequential": false,
      "confidential": false,
      "dataloss": false,
      "dlq": false
    },
    "designer": { "orphans": [] },
    "zone": "us1.make.com"
  }
})

const generateDiscordTemplate = (webhookUrl: string, connectionName: string) => ({
  "name": `${connectionName} - Discord`,
  "flow": [
    {
      "id": 1,
      "module": "discord:TriggerNewMessage",
      "version": 1,
      "parameters": {
        "botToken": "YOUR_DISCORD_BOT_TOKEN"
      },
      "mapper": {},
      "metadata": {
        "designer": { "x": 0, "y": 0 },
        "restore": {},
        "expect": [
          { "name": "content", "type": "text", "label": "Message Content" },
          { "name": "author_id", "type": "text", "label": "Author ID" },
          { "name": "channel_id", "type": "text", "label": "Channel ID" }
        ]
      }
    },
    {
      "id": 2,
      "module": "http:ActionSendData",
      "version": 3,
      "parameters": {},
      "mapper": {
        "url": webhookUrl,
        "method": "post",
        "headers": [
          { "name": "Content-Type", "value": "application/json" }
        ],
        "bodyType": "raw",
        "parseResponse": true,
        "body": JSON.stringify({
          message: "{{1.content}}",
          from: "{{1.author_id}}",
          contactId: "{{1.author_id}}",
          channel: "{{1.channel_id}}",
          platform: "discord"
        }, null, 2)
      },
      "metadata": {
        "designer": { "x": 300, "y": 0 },
        "restore": {
          "expect": {
            "method": { "mode": "chose", "label": "POST" },
            "bodyType": { "label": "Raw" }
          }
        }
      }
    },
    {
      "id": 3,
      "module": "builtin:Sleep",
      "version": 1,
      "parameters": {},
      "mapper": { "delay": "5" },
      "metadata": {
        "designer": { "x": 600, "y": 0 }
      }
    },
    {
      "id": 4,
      "module": "http:ActionSendData",
      "version": 3,
      "parameters": {},
      "mapper": {
        "url": `${webhookUrl}/fetchresponse`,
        "method": "post",
        "headers": [
          { "name": "Content-Type", "value": "application/json" }
        ],
        "bodyType": "raw",
        "parseResponse": true,
        "body": JSON.stringify({
          from: "{{1.author_id}}",
          contactId: "{{1.author_id}}"
        }, null, 2)
      },
      "metadata": {
        "designer": { "x": 900, "y": 0 },
        "restore": {
          "expect": {
            "method": { "mode": "chose", "label": "POST" },
            "bodyType": { "label": "Raw" }
          }
        }
      }
    },
    {
      "id": 5,
      "module": "discord:SendMessage",
      "version": 1,
      "parameters": {},
      "mapper": {
        "channel_id": "{{1.channel_id}}",
        "content": "{{4.data.text}}"
      },
      "metadata": {
        "designer": { "x": 1200, "y": 0 }
      }
    }
  ],
  "metadata": {
    "version": 1,
    "scenario": {
      "roundtrips": 1,
      "maxErrors": 3,
      "autoCommit": true,
      "sequential": false,
      "confidential": false,
      "dataloss": false,
      "dlq": false
    },
    "designer": { "orphans": [] },
    "zone": "us1.make.com"
  }
})

// ==================== MAIN COMPONENT ====================

export default function WebhookConnectionPage() {
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Lire l'onglet actif depuis les URL search params
  const initialTab = ((searchParams.get('tab') || '').toLowerCase() === 'conversations'
    ? 'conversations'
    : 'configuration') as 'configuration' | 'conversations'

  // Basic states
  const [connection, setConnection] = useState<Connection | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedFetch, setCopiedFetch] = useState(false)
  const [activeTab, setActiveTab] = useState<'configuration' | 'conversations'>(initialTab)

  // Conversation states
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

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (!id) return

    const fetchConnection = async () => {
      try {
        const res = await fetch(`/api/connections/${id}`)
        const data = await res.json()
        
        if (res.ok && data.connection) {
          setConnection(data.connection)
        } else {
          toast.error('Connection not found')
          router.push('/launch-agent')
        }
      } catch (error) {
        console.error('Error fetching connection:', error)
        toast.error('Failed to load connection')
      } finally {
        setLoading(false)
      }
    }

    fetchConnection()
  }, [id, router])

  // Charger les conversations quand on change d'onglet
  useEffect(() => {
    if (activeTab === 'conversations' && connection) {
      fetchConversations()
    }
  }, [activeTab, connection])

  // Sync URL params with tab
  useEffect(() => {
    const q = (searchParams.get('tab') || '').toLowerCase()
    const next = (q === 'conversations' ? 'conversations' : 'configuration') as typeof activeTab
    setActiveTab(prev => (prev === next ? prev : next))
  }, [searchParams])

  // ==================== FUNCTIONS ====================

  const switchTab = (tab: 'configuration' | 'conversations') => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab.toLowerCase())
    router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false })
  }

  const handleCopy = async (text: string, type: 'url' | 'fetch') => {
    try {
      await navigator.clipboard.writeText(text)
      
      if (type === 'url') {
        setCopiedUrl(true)
        setTimeout(() => setCopiedUrl(false), 2000)
      } else {
        setCopiedFetch(true)
        setTimeout(() => setCopiedFetch(false), 2000)
      }
      
      toast.success('Copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  const handleDownloadTemplate = (platform: 'whatsapp' | 'sms' | 'slack' | 'discord') => {
    if (!connection?.webhookUrl) {
      toast.error('Webhook URL not available')
      return
    }

    let template: any
    let filename: string

    switch (platform) {
      case 'whatsapp':
        template = generateWhatsAppTemplate(connection.webhookUrl, connection.name)
        filename = `${connection.name.replace(/\s+/g, '-').toLowerCase()}-whatsapp-make-template.json`
        break
      case 'sms':
        template = generateSMSTemplate(connection.webhookUrl, connection.name)
        filename = `${connection.name.replace(/\s+/g, '-').toLowerCase()}-sms-make-template.json`
        break
      case 'slack':
        template = generateSlackTemplate(connection.webhookUrl, connection.name)
        filename = `${connection.name.replace(/\s+/g, '-').toLowerCase()}-slack-make-template.json`
        break
      case 'discord':
        template = generateDiscordTemplate(connection.webhookUrl, connection.name)
        filename = `${connection.name.replace(/\s+/g, '-').toLowerCase()}-discord-make-template.json`
        break
      default:
        toast.error('Invalid platform')
        return
    }

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success(`${platform.toUpperCase()} template downloaded!`)
  }

  // ==================== CONVERSATION FUNCTIONS ====================

  const fetchConversations = async () => {
    setConversationsLoading(true)
    try {
      const res = await fetch(`/api/connections/${id}/conversations`)
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

  const fetchConversationDetails = async (conversationId: string, loadMore = false, lastTimestamp?: number) => {
    if (!loadMore) {
      setConversationDetailsLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const res = await fetch(`/api/connections/${id}/conversations`, {
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
      const res = await fetch(`/api/connections/${id}/conversations`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: conversationToDelete })
      })

      const responseData = await res.json()

      if (res.ok && responseData.success) {
        console.log(`✅ [FRONTEND] Delete successful`)

        setConversations(prev => prev.filter(conv => conv.conversationId !== conversationToDelete))

        if (selectedConversation?.conversationId === conversationToDelete) {
          setSelectedConversation(null)
        }

        setShowDeleteModal(false)
        setConversationToDelete(null)

        setTimeout(() => fetchConversations(), 500)
        toast.success('Conversation deleted')
      } else {
        console.error(`❌ [FRONTEND] Delete failed:`, responseData)
        toast.error(`Error: ${responseData.error || 'Unknown error'}`)
        fetchConversations()
      }

    } catch (error) {
      console.error('❌ [FRONTEND] Error deleting conversation:', error)
      toast.error('Network error during deletion')
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

  // ==================== RENDER ====================

  const fetchResponseUrl = connection?.webhookUrl ? `${connection.webhookUrl}/fetchresponse` : ''

  if (loading) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30 animate-pulse">
            <Webhook className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-400">Loading connection...</p>
        </div>
      </div>
    )
  }

  if (!connection) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-white text-xl font-bold mb-2">Connection not found</p>
          <Link href="/launch-agent" className="text-blue-400 hover:text-blue-300">
            Back to Deployment Center
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="px-4 md:px-8 py-4">
          <div className="flex items-center justify-between w-full">
            
            {/* Left - Back + Title */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <Link href="/launch-agent" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Back</span>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Webhook className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{connection.name}</h1>
                  <p className="text-gray-400 text-sm hidden sm:block">Webhook Integration</p>
                </div>
              </div>
            </div>

            {/* Right - Tabs */}
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => switchTab('configuration')}
                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2 ${
                  activeTab === 'configuration'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Settings size={16} />
                <span className="hidden sm:inline">Configuration</span>
              </button>
              <button
                onClick={() => switchTab('conversations')}
                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2 ${
                  activeTab === 'conversations'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <MessageCircle size={16} />
                <span className="hidden sm:inline">Conversations</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Tab */}
      {activeTab === 'configuration' && (
        <div className="h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar p-4 md:p-8">
          
          {/* Background Effects */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>

          <div className="max-w-6xl mx-auto relative z-10">

            {/* Webhook URLs */}
            <FadeInSection>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                
                {/* POST Endpoint */}
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
                      <Link2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">POST Endpoint</h3>
                      <p className="text-sm text-gray-400">Send messages to AI</p>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 mb-3">
                    <code className="text-sm text-blue-300 break-all font-mono">
                      {connection.webhookUrl || 'Not available'}
                    </code>
                  </div>

                  <button
                    onClick={() => connection.webhookUrl && handleCopy(connection.webhookUrl, 'url')}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      copiedUrl
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {copiedUrl ? (
                      <>
                        <CheckCircle size={18} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        Copy URL
                      </>
                    )}
                  </button>
                </div>

                {/* GET Endpoint */}
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Fetch Response</h3>
                      <p className="text-sm text-gray-400">Get AI response</p>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 mb-3">
                    <code className="text-sm text-green-300 break-all font-mono">
                      {fetchResponseUrl || 'Not available'}
                    </code>
                  </div>

                  <button
                    onClick={() => fetchResponseUrl && handleCopy(fetchResponseUrl, 'fetch')}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      copiedFetch
                        ? 'bg-emerald-600 text-white'
                        : 'bg-green-600 hover:bg-green-500 text-white'
                    }`}
                  >
                    {copiedFetch ? (
                      <>
                        <CheckCircle size={18} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        Copy URL
                      </>
                    )}
                  </button>
                </div>
              </div>
            </FadeInSection>

            {/* Setup Instructions */}
            <FadeInSection>
              <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl flex items-center justify-center">
                    <Settings className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Setup Instructions</h2>
                    <p className="text-gray-400">Follow these steps to connect your platform</p>
                  </div>
                </div>

                <div className="space-y-6">
                  
                  {/* Step 1 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">Create Make.com Account</h3>
                      <p className="text-gray-400 mb-3">
                        Sign up for a free account at <a href="https://make.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">make.com</a>
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">Download Template for Your Platform</h3>
                      <p className="text-gray-400 mb-4">
                        Choose and download the pre-configured template for your platform
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* WhatsApp Template */}
                        <button
                          onClick={() => handleDownloadTemplate('whatsapp')}
                          className="group p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 border border-green-500/30 hover:border-green-500/50 rounded-xl transition-all"
                        >
                          <div className="text-3xl mb-2">💬</div>
                          <div className="text-sm font-semibold text-green-400 mb-1">WhatsApp</div>
                          <div className="text-xs text-green-300/70">via Twilio</div>
                          <div className="mt-2 flex items-center justify-center gap-1 text-xs text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Download size={12} />
                            Download
                          </div>
                        </button>

                        {/* SMS Template */}
                        <button
                          onClick={() => handleDownloadTemplate('sms')}
                          className="group p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 border border-blue-500/30 hover:border-blue-500/50 rounded-xl transition-all"
                        >
                          <div className="text-3xl mb-2">📱</div>
                          <div className="text-sm font-semibold text-blue-400 mb-1">SMS</div>
                          <div className="text-xs text-blue-300/70">via Twilio</div>
                          <div className="mt-2 flex items-center justify-center gap-1 text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Download size={12} />
                            Download
                          </div>
                        </button>

                        {/* Slack Template */}
                        <button
                          onClick={() => handleDownloadTemplate('slack')}
                          className="group p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-500/30 hover:border-purple-500/50 rounded-xl transition-all"
                        >
                          <div className="text-3xl mb-2">💼</div>
                          <div className="text-sm font-semibold text-purple-400 mb-1">Slack</div>
                          <div className="text-xs text-purple-300/70">Direct</div>
                          <div className="mt-2 flex items-center justify-center gap-1 text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Download size={12} />
                            Download
                          </div>
                        </button>

                        {/* Discord Template */}
                        <button
                          onClick={() => handleDownloadTemplate('discord')}
                          className="group p-4 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 hover:from-indigo-500/20 hover:to-blue-500/20 border border-indigo-500/30 hover:border-indigo-500/50 rounded-xl transition-all"
                        >
                          <div className="text-3xl mb-2">🎮</div>
                          <div className="text-sm font-semibold text-indigo-400 mb-1">Discord</div>
                          <div className="text-xs text-indigo-300/70">Bot API</div>
                          <div className="mt-2 flex items-center justify-center gap-1 text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Download size={12} />
                            Download
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">Import to Make.com</h3>
                      <p className="text-gray-400 mb-3">
                        In Make.com, click "Create a new scenario" → "Import blueprint" → Upload the JSON file
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                      4
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">Connect Your Platform</h3>
                      <p className="text-gray-400 mb-3">
                        Replace the webhook trigger with your platform (Twilio for WhatsApp/SMS, Slack, Discord, etc.)
                      </p>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                      5
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">Test & Activate</h3>
                      <p className="text-gray-400 mb-3">
                        Send a test message to verify everything works, then turn on the scenario!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInSection>

            {/* Example Platforms */}
            <FadeInSection>
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-blue-200">Supported Platforms</h2>
                    <p className="text-blue-300/70">This webhook works with any platform that supports HTTP requests</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'WhatsApp', desc: 'via Twilio', icon: '💬' },
                    { name: 'SMS', desc: 'via Twilio', icon: '📱' },
                    { name: 'Slack', desc: 'Direct integration', icon: '💼' },
                    { name: 'Discord', desc: 'Bot integration', icon: '🎮' },
                    { name: 'Telegram', desc: 'Bot API', icon: '✈️' },
                    { name: 'Custom API', desc: 'Any HTTP client', icon: '⚡' },
                    { name: 'n8n', desc: 'Alternative to Make', icon: '🔄' },
                    { name: 'Zapier', desc: 'Another option', icon: '⚙️' }
                  ].map((platform) => (
                    <div key={platform.name} className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                      <div className="text-3xl mb-2">{platform.icon}</div>
                      <div className="text-blue-200 font-semibold text-sm">{platform.name}</div>
                      <div className="text-blue-300/60 text-xs mt-1">{platform.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      )}

      {/* Conversations Tab */}
      {activeTab === 'conversations' && (
        <div className="h-[calc(100vh-160px)]">
          
          {/* Mobile: Navigation liste ↔ détail */}
          <div className="lg:hidden h-full">
            {selectedConversation ? (
              // Vue détail mobile avec bouton back
              <div className="flex flex-col h-full">
                <div className="p-3 border-b border-gray-800 flex items-center gap-3 bg-gray-900/30">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-sm">
                      Customer #{getNumericId(selectedConversation.userId)}
                    </h3>
                    <p className="text-gray-400 text-xs">
                      {selectedConversation.totalMessages} messages • {getPlatformIcon(selectedConversation.platformDetails)} {getPlatformName(selectedConversation.platformDetails)}
                    </p>
                  </div>
                  <button
                    onClick={() => initiateDelete(selectedConversation.conversationId)}
                    className="w-6 h-6 bg-red-600/20 hover:bg-red-600/30 rounded flex items-center justify-center text-red-400 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* Messages mobiles optimisés */}
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
                          className={`flex items-start gap-2 ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
                        >
                          {/* Avatar User (gauche) */}
                          {message.role === 'user' && (
                            <div className="w-7 h-7 rounded-full bg-gray-700/50 flex items-center justify-center flex-shrink-0 mt-1">
                              <User size={14} className="text-gray-300" />
                            </div>
                          )}

                          {/* Message Bubble */}
                          <div className={`max-w-[70%] px-3 py-2.5 rounded-2xl shadow-sm ${
                            message.role === 'user'
                              ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-white border border-gray-600/50'
                              : 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border border-blue-500/30'
                          }`}>
                            <div
                              className="text-sm leading-relaxed conversation-message"
                              dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                            />
                            <p className="text-xs mt-1.5 opacity-70">
                              {formatTime(message.timestamp)}
                            </p>
                          </div>

                          {/* Avatar Bot (droite) */}
                          {message.role === 'assistant' && (
                            <div className="w-7 h-7 rounded-full bg-blue-600/50 flex items-center justify-center flex-shrink-0 mt-1 border border-blue-500/30">
                              <Bot size={14} className="text-white" />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              </div>
            ) : (
              // Vue liste mobile
              <div className="h-full overflow-y-auto">
                {/* Header liste mobile */}
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

                {/* Liste conversations mobile */}
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
                        <div className="w-8 h-8 bg-gray-700/50 rounded-full flex items-center justify-center group-hover:bg-gray-600/50 transition-all">
                          <span className="text-lg">{getPlatformIcon(conv.platformDetails)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-white text-xs truncate">
                              Customer #{getNumericId(conv.userId)}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {formatTime(conv.lastMessageTime)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-gray-500">
                              {conv.messageCount} messages
                            </span>
                            <span className="text-xs text-gray-600">•</span>
                            <span className="text-xs text-gray-500">
                              {getPlatformName(conv.platformDetails)}
                            </span>
                          </div>
                        </div>
                        {/* Delete button pour mobile */}
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
            {/* Colonne gauche - Liste conversations */}
            <div className="w-96 border-r border-gray-800 bg-gray-950 flex flex-col">
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
                      Conversations will appear here once users start chatting with your webhook.
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
                          <span className="text-2xl">{getPlatformIcon(conv.platformDetails)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-white text-sm truncate">
                              Customer #{getNumericId(conv.userId)}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {formatTime(conv.lastMessageTime)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-gray-500">
                              {conv.messageCount} messages
                            </span>
                            <span className="text-xs text-gray-600">•</span>
                            <span className="text-xs text-gray-500">
                              {getPlatformName(conv.platformDetails)}
                            </span>
                          </div>
                        </div>
                        {/* Delete button */}
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

            {/* Colonne droite - Conversation détaillée */}
            <div className="flex-1 flex flex-col bg-gray-950">
              {selectedConversation ? (
                <>
                  {/* Header conversation */}
                  <div className="p-4 border-b border-gray-800 bg-gray-900/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center">
                        <span className="text-2xl">{getPlatformIcon(selectedConversation.platformDetails)}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-white">Customer #{getNumericId(selectedConversation.userId)}</h3>
                        <p className="text-gray-400 text-sm">
                          {selectedConversation.totalMessages} messages • {getPlatformName(selectedConversation.platformDetails)}
                        </p>
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
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {conversationDetailsLoading ? (
                        <div className="text-center text-gray-400 py-8">
                          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                          Loading messages...
                        </div>
                      ) : (
                        selectedConversation.messages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
                          >
                            {/* Avatar User (gauche) */}
                            {message.role === 'user' && (
                              <div className="w-8 h-8 rounded-full bg-gray-700/50 flex items-center justify-center flex-shrink-0 mt-1">
                                <User size={16} className="text-gray-300" />
                              </div>
                            )}

                            {/* Message Bubble */}
                            <div className={`max-w-md px-4 py-3 rounded-2xl shadow-md ${
                              message.role === 'user'
                                ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-white border border-gray-600/50'
                                : 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border border-blue-500/30'
                            }`}>
                              <div
                                className="text-sm leading-relaxed conversation-message"
                                dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                              />
                              <p className="text-xs mt-2 opacity-70">
                                {formatTime(message.timestamp)}
                              </p>
                            </div>

                            {/* Avatar Bot (droite) */}
                            {message.role === 'assistant' && (
                              <div className="w-8 h-8 rounded-full bg-blue-600/50 flex items-center justify-center flex-shrink-0 mt-1 border border-blue-500/30">
                                <Bot size={16} className="text-white" />
                              </div>
                            )}
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
        </div>
      )}

      {/* Delete Conversation Modal */}
      <DeleteConversationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="Delete Conversation"
        message="Are you sure you want to delete this conversation? This action cannot be undone and will permanently remove all messages from the database."
      />

      {/* Styles pour les liens dans les conversations */}
      <style jsx>{`
        .conversation-message :global(a) {
          color: rgba(255, 255, 255, 0.95) !important;
          text-decoration: underline !important;
          text-decoration-color: rgba(255, 255, 255, 0.6) !important;
          text-decoration-thickness: 1.5px !important;
          text-underline-offset: 2px !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
          cursor: pointer !important;
          word-break: break-word !important;
        }
        
        .conversation-message :global(a):hover {
          color: white !important;
          text-decoration-color: white !important;
          text-decoration-thickness: 2px !important;
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.3) !important;
        }
      `}</style>
    </div>
  )
}