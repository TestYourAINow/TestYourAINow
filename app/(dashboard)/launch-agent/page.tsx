'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Trash2, Bot, Plus, Settings, Info, Globe, Link as LinkIcon,
  Search, Activity, Zap, Monitor, Circle, Filter, ChevronDown,
  TrendingUp, Clock, Users, MoreHorizontal, Eye, Edit3, Star,
  Rocket, Signal, Wifi, PlayCircle, PauseCircle, Power
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import FadeInSection from '@/components/FadeInSection'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'

// Composants d'icônes avec gradients
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
    <path fill="url(#instagram-gradient-launch)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const FacebookIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="facebook-gradient-launch" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1877F2" />
        <stop offset="100%" stopColor="#42A5F5" />
      </linearGradient>
    </defs>
    <path fill="url(#facebook-gradient-launch)" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const SMSIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="sms-gradient-launch" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#25D366" />
        <stop offset="100%" stopColor="#128C7E" />
      </linearGradient>
    </defs>
    <path fill="url(#sms-gradient-launch)" d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
  </svg>
)

const WebsiteIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="website-gradient-launch" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00D2FF" />
        <stop offset="100%" stopColor="#3A7BD5" />
      </linearGradient>
    </defs>
    <path fill="url(#website-gradient-launch)" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </svg>
)

type Connection = {
  _id: string
  name: string
  integrationType: string
  aiBuildId: string
  isActive: boolean
  aiName?: string
  agentName?: string
  createdAt?: string
}

// Deployment Card - VERSION CENTREE "PROFIL" avec changements demandés
const CompactDeploymentCard = ({
  connection,
  onToggle,
  onDelete,
  onView
}: {
  connection: Connection;
  onToggle: () => void;
  onDelete: () => void;
  onView: () => void;
}) => {
  const [showActions, setShowActions] = useState(false);

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'website-widget': return <WebsiteIcon size={20} />;
      case 'facebook-messenger': return <FacebookIcon size={20} />;
      case 'instagram-dms': return <InstagramIcon size={20} />;
      case 'sms': return <SMSIcon size={20} />;
      default: return <Globe size={20} className="text-gray-400" />;
    }
  };

  const getIntegrationDisplayName = (type: string) => {
    switch (type) {
      case 'website-widget': return 'Website Widget';
      case 'facebook-messenger': return 'Facebook Messenger';
      case 'instagram-dms': return 'Instagram DMs';
      case 'sms': return 'SMS';
      case 'api': return 'API Integration';
      default: return type;
    }
  };

  return (
    <div className="relative group">
      <div className={`
        relative bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl p-5 h-[240px] transition-all duration-300 cursor-pointer flex flex-col
        ${connection.isActive 
          ? 'hover:border-emerald-500/30 hover:shadow-emerald-500/5' 
          : 'hover:border-blue-500/40 hover:shadow-blue-500/10'
        }
        hover:scale-[1.02] group
      `}>
        
        {/* Subtle glow effect */}
        <div className={`absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none ${
          connection.isActive 
            ? 'group-hover:bg-emerald-500/[0.02]' 
            : 'group-hover:bg-blue-500/[0.02]'
        }`}></div>

        {/* Header avec pastille status et menu */}
        <div className="flex items-center justify-between mb-4">
          {/* Status indicator à gauche */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
            connection.isActive
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-gray-500/15 text-gray-400 border border-gray-500/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${connection.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
            {connection.isActive ? 'Live' : 'Offline'}
          </div>

          {/* Menu 3 points */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="w-8 h-8 rounded-lg bg-gray-800/60 border border-gray-600/50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700/80 transition-all opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal size={14} />
            </button>

            {showActions && (
              <div className="absolute right-0 top-full mt-1 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl z-50 min-w-[140px] py-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onView();
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
                >
                  <Eye size={14} />
                  View Details
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
                >
                  <Power size={14} />
                  {connection.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <hr className="my-1 border-gray-700/50" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content principal cliquable - Layout centré comme un profil */}
        <div onClick={onView} className="flex-1 flex flex-col items-center text-center justify-center">
          {/* Icône centrée plus grande */}
          <div className="relative mb-4">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${
              connection.isActive
                ? 'bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                : 'bg-gradient-to-br from-gray-700/50 to-gray-600/30 border-gray-600/50'
            }`}>
              {getIntegrationIcon(connection.integrationType)}
            </div>

            {/* Status indicator sur l'icône plus gros */}
            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
              connection.isActive ? 'bg-emerald-400' : 'bg-gray-500'
            } shadow-sm`} />
          </div>

          {/* Titre centré - HOVER BLEU SEULEMENT */}
          <h3 className="text-white font-bold text-base mb-3 line-clamp-2 leading-tight group-hover:text-blue-400 transition-all duration-300 max-w-full px-2">
            {connection.name}
          </h3>
          
          {/* Agent connecté - ICONE GRISE + "Connected:" GRIS + NOM BLANC GRAS */}
          <div className="flex items-center gap-2 justify-center text-sm">
            {(connection.aiName || connection.agentName) ? (
              <>
                <Bot size={12} className="text-gray-400" />
                <span className="text-gray-400">Connected:</span>
               <span className="text-blue-400 font-bold group-hover:text-white transition-colors">{connection.aiName || connection.agentName}</span>
              </>
            ) : (
              <span className="text-gray-400">
                {getIntegrationDisplayName(connection.integrationType)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick Deploy Button
const CompactQuickDeployButton = () => (
  <Link href="/create-connection">
    <div className="group relative p-6 rounded-2xl border-2 border-dashed border-gray-600/50 hover:border-emerald-500/40 transition-all duration-300 cursor-pointer bg-gradient-to-br from-gray-900/30 to-gray-800/20 hover:from-emerald-900/10 hover:to-blue-900/10 backdrop-blur-sm h-[240px] flex flex-col items-center justify-center text-center">

      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 to-blue-500/0 group-hover:from-emerald-500/[0.02] group-hover:to-blue-500/[0.02] transition-all duration-300"></div>

      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-600/20 to-blue-600/20 border-2 border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-500/10">
          <Rocket size={24} className="text-emerald-400 group-hover:text-emerald-300 transition-colors" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-2 group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-blue-400 group-hover:bg-clip-text group-hover:text-transparent transition-all">
        Quick Deploy
      </h3>
      <p className="text-gray-400 text-center leading-relaxed group-hover:text-gray-300 transition-colors text-sm px-4">
        Launch your AI to a new platform
      </p>

      <div className="mt-3 flex items-center gap-2 text-sm text-emerald-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
        <Plus size={14} />
        <span className="font-medium">Get Started</span>
      </div>
    </div>
  </Link>
);

export default function LaunchAgentPage() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [filteredConnections, setFilteredConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")

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
        const remaining = Math.max(0, 800 - elapsed)
        setTimeout(() => setLoading(false), remaining)
      })
  }, [])

  useEffect(() => {
    let filtered = connections.filter(conn =>
      conn.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (statusFilter === "active") {
      filtered = filtered.filter(conn => conn.isActive)
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter(conn => !conn.isActive)
    }

    setFilteredConnections(filtered)
  }, [connections, searchQuery, statusFilter])

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/connections/${id}/toggle`, { method: 'PATCH' })
      const data = await res.json()
      setConnections(prev => prev.map(c => c._id === id ? { ...c, isActive: data.isActive } : c))
    } catch (err) {
      console.error('Error toggling connection:', err)
    }
  }

  const openDeleteModal = (connection: Connection) => {
    setDeleteModal({
      isOpen: true,
      connectionId: connection._id,
      connectionName: connection.name,
      integrationType: connection.integrationType
    })
  }

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, connectionId: '', connectionName: '', integrationType: '' })
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/connections/${deleteModal.connectionId}`, { method: 'DELETE' })
      if (response.ok) {
        setConnections(prev => prev.filter(c => c._id !== deleteModal.connectionId))
        closeDeleteModal()
      }
    } catch (err) {
      console.error('Failed to delete connection:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const activeConnections = connections.filter(c => c.isActive).length
  const totalConnections = connections.length

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">

      <FadeInSection>
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-600/20 to-blue-600/20 border-2 border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Rocket className="text-emerald-400" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent pb-1">
                    Deployment Center
                  </h1>
                  <p className="text-gray-400 text-lg">Manage your live AI deployments</p>
                </div>
              </div>

              {!loading && (
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-emerald-400 font-semibold">{activeConnections} Live</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Monitor size={14} className="text-gray-400" />
                    <span className="text-gray-400">{totalConnections} Total Deployments</span>
                  </div>
                  {totalConnections > 0 && (
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-blue-400" />
                      <span className="text-blue-400">{Math.round((activeConnections / totalConnections) * 100)}% Active Rate</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Link
                href="/create-connection"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 transform hover:scale-105"
              >
                <Rocket size={18} />
                Quick Deploy
              </Link>
            </div>
          </div>
        </div>
      </FadeInSection>

      {!loading && connections.length > 0 && (
        <FadeInSection>
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 mb-8 shadow-xl">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search deployments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder-gray-400 backdrop-blur-sm"
                />
              </div>

              <div className="flex gap-2">
                {[
                  { key: "all", label: "All", icon: Circle },
                  { key: "active", label: "Live", icon: Zap },
                  { key: "inactive", label: "Offline", icon: PauseCircle }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setStatusFilter(key as typeof statusFilter)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                      statusFilter === key
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                        : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </FadeInSection>
      )}

      {loading && (
        <FadeInSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            <CompactQuickDeployButton />
            {[...Array(9)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/20 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-5 h-[240px] flex flex-col items-center">
                  <div className="flex justify-between items-center w-full mb-4">
                    <div className="w-16 h-6 bg-gray-700/40 rounded-full"></div>
                    <div className="w-6 h-6 bg-gray-700/40 rounded-lg"></div>
                  </div>
                  <div className="w-16 h-16 bg-gray-700/40 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-700/40 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-700/40 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </FadeInSection>
      )}

      {!loading && (
        <FadeInSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            <CompactQuickDeployButton />
            {filteredConnections.map((connection) => (
              <CompactDeploymentCard
                key={connection._id}
                connection={connection}
                onToggle={() => handleToggleStatus(connection._id)}
                onDelete={() => openDeleteModal(connection)}
                onView={() => router.push(`/launch-agent/${connection._id}/${connection.integrationType}`)}
              />
            ))}
          </div>
        </FadeInSection>
      )}

      {!loading && connections.length === 0 && (
        <FadeInSection>
          <div className="text-center py-20">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-blue-600/20 rounded-full blur-3xl"></div>
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-r from-gray-800 to-gray-700 border-2 border-gray-600 flex items-center justify-center shadow-2xl">
                <Rocket className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Ready to Deploy?
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto text-lg leading-relaxed">
              Launch your first AI deployment and start engaging with users across multiple platforms.
            </p>
            <Link
              href="/create-connection"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 transform hover:scale-105"
            >
              <Rocket size={20} />
              Deploy Your First AI
            </Link>
          </div>
        </FadeInSection>
      )}

      {!loading && connections.length > 0 && filteredConnections.length === 0 && (
        <FadeInSection>
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-gray-800/50 border border-gray-700/50 flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">
              No deployments found
            </h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search or filter settings
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="text-emerald-400 hover:text-emerald-300 transition-colors font-semibold"
            >
              Clear filters
            </button>
          </div>
        </FadeInSection>
      )}

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        connectionName={deleteModal.connectionName}
        integrationType={deleteModal.integrationType}
        isDeleting={isDeleting}
      />
    </div>
  )
}