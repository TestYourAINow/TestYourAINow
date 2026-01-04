// app/(dashboard)/launch-agent/[id]/webhook/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Copy, CheckCircle, ExternalLink, Download, 
  Webhook, Zap, Settings, Play, AlertCircle, Code,
  ChevronRight, FileCode, Sparkles, Globe, MessageSquare,
  Bot, Link2
} from 'lucide-react'
import FadeInSection from '@/components/FadeInSection'
import { toast } from 'react-hot-toast'

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

// Templates Make.com pour différentes plateformes
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

export default function WebhookConnectionPage() {
  const { id } = useParams()
  const router = useRouter()
  const [connection, setConnection] = useState<Connection | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedFetch, setCopiedFetch] = useState(false)

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

  const fetchResponseUrl = connection.webhookUrl ? `${connection.webhookUrl}/fetchresponse` : ''

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <FadeInSection>
          <div className="mb-8">
            <Link href="/launch-agent" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Deployment Center</span>
            </Link>

            <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Webhook className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent pb-1">
                      {connection.name}
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm text-gray-400">Webhook Integration</span>
                      {connection.aiName && (
                        <>
                          <span className="text-gray-600">•</span>
                          <div className="flex items-center gap-1.5">
                            <Bot size={14} className="text-blue-400" />
                            <span className="text-sm text-blue-400">{connection.aiName}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`px-4 py-2 rounded-xl border ${
                  connection.isActive 
                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                    : 'bg-gray-500/20 border-gray-500/30 text-gray-400'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${connection.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
                    <span className="font-semibold text-sm">{connection.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>

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
  )
}