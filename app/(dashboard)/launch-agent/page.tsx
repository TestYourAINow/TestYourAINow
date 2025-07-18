'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Trash2, Bot, Plus, Settings, Info, Globe, Link as LinkIcon, 
  Search, Activity, Zap, Monitor, Circle, Filter
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Loader from '@/components/Loader'
import FadeInSection from '@/components/FadeInSection'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'
import RequireApiKey from "@/components/RequireApiKey"

// Composants d'icônes personnalisées (les mêmes que dans create-connection)
const InstagramIcon = ({ size = 18, className = "" }) => (
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
    <path
      fill="url(#instagram-gradient-launch)"
      d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
    />
  </svg>
)

const FacebookIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="facebook-gradient-launch" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00c6ff" />
        <stop offset="100%" stopColor="#0072ff" />
      </linearGradient>
    </defs>
    <path
      fill="url(#facebook-gradient-launch)"
      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
    />
  </svg>
)

const SMSIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="sms-gradient-launch" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00c851" />
        <stop offset="100%" stopColor="#007e33" />
      </linearGradient>
    </defs>
    <path
      fill="url(#sms-gradient-launch)"
      d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"
    />
  </svg>
)

const WebsiteIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="website-gradient-launch" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00d2ff" />
        <stop offset="100%" stopColor="#3a7bd5" />
      </linearGradient>
    </defs>
    <path
      fill="url(#website-gradient-launch)"
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
    />
  </svg>
)

type Connection = {
  _id: string
  name: string
  integrationType: string
  aiBuildId: string
  isActive: boolean
  aiName?: string
  createdAt?: string
}

// Composant pour le statut de connexion
const ConnectionStatus = ({ isActive }: { isActive: boolean }) => {
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
      isActive 
        ? 'bg-green-500/20 text-green-400' 
        : 'bg-gray-500/20 text-gray-400'
    }`}>
      <Circle size={6} className={isActive ? 'fill-green-400' : 'fill-gray-400'} />
      {isActive ? 'Active' : 'Inactive'}
    </div>
  )
}

// Composant pour les skeleton cards
const ConnectionCardSkeleton = () => (
  <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl p-6 h-[240px] animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="w-8 h-4 bg-gray-700/50 rounded-full"></div>
      <div className="w-8 h-8 bg-gray-700/50 rounded-lg"></div>
    </div>
    <div className="flex justify-center mb-4">
      <div className="w-12 h-12 rounded-full bg-gray-700/50"></div>
    </div>
    <div className="text-center space-y-3">
      <div className="h-4 bg-gray-700/50 rounded mx-auto w-3/4"></div>
      <div className="h-3 bg-gray-700/50 rounded mx-auto w-1/2"></div>
    </div>
  </div>
)

export default function LaunchAgentPage() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [filteredConnections, setFilteredConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")
  const [filterType, setFilterType] = useState<string>("all")
  
  // États pour le modal de suppression
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    connectionId: '',
    connectionName: '',
    integrationType: ''
  })
  const [isDeleting, setIsDeleting] = useState(false)
  
  const router = useRouter()

  useEffect(() => {
    const start = Date.now()

    fetch('/api/connections/list')
      .then((res) => res.json())
      .then((data) => {
        setConnections(data.connections || [])
        setFilteredConnections(data.connections || [])
      })
      .catch((err) => console.error('Error fetching connections:', err))
      .finally(() => {
        const elapsed = Date.now() - start
        const remaining = Math.max(0, 1000 - elapsed)
        setTimeout(() => setLoading(false), remaining)
      })
  }, [])

  // Filtrage et recherche
  useEffect(() => {
    let filtered = connections.filter(conn => 
      conn.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Filtrage par statut
    if (filterStatus === "active") {
      filtered = filtered.filter(conn => conn.isActive)
    } else if (filterStatus === "inactive") {
      filtered = filtered.filter(conn => !conn.isActive)
    }

    // Filtrage par type
    if (filterType !== "all") {
      filtered = filtered.filter(conn => conn.integrationType === filterType)
    }

    setFilteredConnections(filtered)
  }, [connections, searchQuery, filterStatus, filterType])

  // Fonction pour ouvrir le modal de suppression
  const openDeleteModal = (connection: Connection) => {
    setDeleteModal({
      isOpen: true,
      connectionId: connection._id,
      connectionName: connection.name,
      integrationType: connection.integrationType
    })
  }

  // Fonction pour fermer le modal
  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      connectionId: '',
      connectionName: '',
      integrationType: ''
    })
  }

  // Fonction de suppression avec modal
  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/connections/${deleteModal.connectionId}`, { 
        method: 'DELETE' 
      })
      
      if (response.ok) {
        setConnections((prev) => prev.filter((c) => c._id !== deleteModal.connectionId))
        closeDeleteModal()
      } else {
        console.error('Failed to delete connection')
      }
    } catch (err) {
      console.error('Failed to delete connection:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/connections/${id}/toggle`, { method: 'PATCH' })
      const data = await res.json()

      setConnections((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isActive: data.isActive } : c))
      )
    } catch (err) {
      console.error('Error toggling connection:', err)
    }
  }

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'website-widget':
        return <WebsiteIcon size={14} />
      case 'facebook-messenger':
        return <FacebookIcon size={14} />
      case 'instagram-dms':
        return <InstagramIcon size={14} />
      case 'sms':
        return <SMSIcon size={14} />
      case 'api':
        return <LinkIcon size={14} />
      default:
        return <Settings size={14} />
    }
  }

  const getIntegrationDisplayName = (type: string) => {
    switch (type) {
      case 'website-widget':
        return 'Website Widget'
      case 'facebook-messenger':
        return 'Facebook Messenger'
      case 'instagram-dms':
        return 'Instagram DMs'
      case 'sms':
        return 'SMS'
      case 'api':
        return 'API'
      default:
        return type
    }
  }

  // Obtenir les types uniques de connexions
  const uniqueTypes = [...new Set(connections.map(c => c.integrationType))]

  return (
    <RequireApiKey>
      <div className="min-h-screen bg-transparent">
        {/* Main Content - Centered Container */}
        <div className="flex justify-center min-h-screen py-6">
          <div className="w-full max-w-7xl mx-auto px-6">
            {/* Header amélioré */}
            <div className="mb-8">
              <FadeInSection>
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-green-600 rounded-xl">
                    <Monitor className="text-white" size={24} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      Connect your AIs
                    </h1>
                    <p className="text-sm text-gray-400">
                      Deploy and manage your AI agent connections across different platforms
                    </p>
                  </div>
                  
                  {/* Quick stats dans le header */}
                  {!loading && connections.length > 0 && (
                    <div className="ml-auto flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{connections.length}</div>
                        <div className="text-xs text-gray-400">Connections</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-400">
                          {connections.filter(c => c.isActive).length}
                        </div>
                        <div className="text-xs text-gray-400">Active</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Barre de recherche et filtres */}
                {!loading && connections.length > 0 && (
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-xl p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Search */}
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          placeholder="Search connections..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                        />
                      </div>

                      {/* Filters */}
                      <div className="flex gap-2">
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                          className="px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-green-500 transition-all"
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active Only</option>
                          <option value="inactive">Inactive Only</option>
                        </select>

                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-green-500 transition-all"
                        >
                          <option value="all">All Types</option>
                          {uniqueTypes.map(type => (
                            <option key={type} value={type}>
                              {getIntegrationDisplayName(type)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </FadeInSection>
            </div>

            {loading ? (
              <FadeInSection>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {/* Create Connection Card */}
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl h-[240px] flex flex-col items-center justify-center text-gray-400">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
                      <Plus size={24} className="text-green-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-300">
                      Create a Connection
                    </p>
                  </div>
                  
                  {/* Skeleton cards */}
                  {[...Array(7)].map((_, i) => (
                    <ConnectionCardSkeleton key={i} />
                  ))}
                </div>
              </FadeInSection>
            ) : (
              <FadeInSection>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {/* Create Connection Card */}
                  <Link href="/create-connection">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl h-[240px] flex flex-col items-center justify-center text-gray-400 hover:border-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:scale-[1.02] transition-all duration-300 group cursor-pointer">
                      <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-all duration-300">
                        <Plus size={24} className="text-green-400 group-hover:text-green-300" />
                      </div>
                      <p className="text-lg font-medium text-gray-300 group-hover:text-white transition-colors">
                        Create a Connection
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Deploy your AI to platforms
                      </p>
                    </div>
                  </Link>

                  {/* Connection Cards améliorées */}
                  {filteredConnections.map((conn) => (
                    <div
                      key={conn._id}
                      className="relative bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl p-6 h-[240px] hover:border-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:scale-[1.02] transition-all duration-300 group"
                    >
                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          openDeleteModal(conn)
                        }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>

                      {/* Status Toggle et Badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={conn.isActive}
                            onChange={(e) => {
                              e.stopPropagation()
                              toggleStatus(conn._id)
                            }}
                          />
                          <div className={`w-8 h-4 rounded-full relative transition-all duration-300 ${
                            conn.isActive ? 'bg-green-500' : 'bg-gray-600'
                          }`}>
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 ${
                              conn.isActive ? 'left-4' : 'left-0.5'
                            }`} />
                          </div>
                        </label>
                      </div>

                      <button
                        onClick={() => router.push(`/launch-agent/${conn._id}/${conn.integrationType}`)}
                        className="w-full h-full flex flex-col pt-8"
                      >
                        {/* Connection Icon avec status indicator */}
                        <div className="flex justify-center mb-4">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                              <Monitor className="w-6 h-6 text-green-400" />
                            </div>
                            {/* Status indicator */}
                            <div className="absolute -top-1 -right-1">
                              <Circle 
                                size={12} 
                                className={`${
                                  conn.isActive 
                                    ? 'text-green-400 fill-green-400' 
                                    : 'text-gray-400 fill-gray-400'
                                }`} 
                              />
                            </div>
                          </div>
                        </div>

                        {/* Connection Info */}
                        <div className="text-center flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-white font-semibold text-lg mb-2 truncate">
                              {conn.name}
                            </h3>
                            <ConnectionStatus isActive={conn.isActive} />
                          </div>

                          {/* Connection Type */}
                          <div className="flex-1 flex flex-col justify-center my-3">
                            <div className="flex justify-center">
                              <span className="inline-flex items-center gap-1 text-xs px-3 py-1 bg-gray-500/10 text-white border border-gray-500/20 rounded-full">
                                {getIntegrationIcon(conn.integrationType)}
                                {getIntegrationDisplayName(conn.integrationType)}
                              </span>
                            </div>
                          </div>

                          {/* AI Name si disponible */}
                          {conn.aiName && (
                            <div className="text-xs text-gray-500">
                              AI: {conn.aiName}
                            </div>
                          )}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </FadeInSection>
            )}

            {/* Statistics Section améliorée */}
            {!loading && connections.length > 0 && (
              <FadeInSection>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6 text-center">
                    <div className="flex items-center justify-center mb-3">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <Monitor className="text-white" size={20} />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">{connections.length}</div>
                    <div className="text-blue-200 font-medium">Total Connections</div>
                    <div className="text-xs text-blue-300 mt-1">All platform connections</div>
                  </div>

                  <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6 text-center">
                    <div className="flex items-center justify-center mb-3">
                      <div className="p-2 bg-green-600 rounded-lg">
                        <Activity className="text-white" size={20} />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">
                      {connections.filter(conn => conn.isActive).length}
                    </div>
                    <div className="text-green-200 font-medium">Active Connections</div>
                    <div className="text-xs text-green-300 mt-1">Currently deployed</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6 text-center">
                    <div className="flex items-center justify-center mb-3">
                      <div className="p-2 bg-purple-600 rounded-lg">
                        <Zap className="text-white" size={20} />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">
                      {uniqueTypes.length}
                    </div>
                    <div className="text-purple-200 font-medium">Platform Types</div>
                    <div className="text-xs text-purple-300 mt-1">Different integrations</div>
                  </div>
                </div>

                {/* Connection Types Breakdown amélioré */}
                <div className="mt-6 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Settings className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold text-blue-200">Platform Distribution</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {uniqueTypes.map(type => {
                      const count = connections.filter(c => c.integrationType === type).length
                      const activeCount = connections.filter(c => c.integrationType === type && c.isActive).length
                      
                      return (
                        <div key={type} className="bg-gray-700/30 border border-gray-600 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {getIntegrationIcon(type)}
                            <span className="text-white font-medium text-sm">
                              {getIntegrationDisplayName(type)}
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-white mb-1">{count}</div>
                          <div className="text-xs text-gray-400">
                            {activeCount} active, {count - activeCount} inactive
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </FadeInSection>
            )}

            {/* Empty State */}
            {!loading && connections.length === 0 && (
              <FadeInSection>
                <div className="text-center py-20">
                  <div className="w-20 h-20 rounded-full bg-gray-700/50 border border-gray-600 flex items-center justify-center mx-auto mb-6">
                    <Monitor className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No connections yet
                  </h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Create your first connection to deploy your AI agents to different platforms and start engaging with users.
                  </p>
                  <Link href="/create-connection">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 mx-auto">
                      <Plus size={18} />
                      Create Your First Connection
                    </button>
                  </Link>
                </div>
              </FadeInSection>
            )}

            {/* No results state */}
            {!loading && connections.length > 0 && filteredConnections.length === 0 && (
              <FadeInSection>
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-full bg-gray-700/50 border border-gray-600 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    No connections found
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Try adjusting your search or filter criteria
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("")
                      setFilterStatus("all")
                      setFilterType("all")
                    }}
                    className="text-green-400 hover:text-green-300 transition-colors"
                  >
                    Clear filters
                  </button>
                </div>
              </FadeInSection>
            )}
          </div>
        </div>

        {/* Modal de confirmation de suppression */}
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDelete}
          connectionName={deleteModal.connectionName}
          integrationType={deleteModal.integrationType}
          isDeleting={isDeleting}
        />
      </div>
    </RequireApiKey>
  )
}