// app\(dashboard)\launch-agent\folders\[id]\page.tsx 

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft, Bot, Plus, Settings, Globe, Search, Eye, Edit3, MoreHorizontal,
  Zap, Monitor, Circle, Clock, Folder, FolderEdit, Trash2, FolderMinus, 
  CheckCircle, X, AlertTriangle, Star, Shield, Power, Users, Webhook
} from "lucide-react"
import FadeInSection from '@/components/FadeInSection'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'
import ConnectionActions from '@/components/Dropdowns/ConnectionActions'

// Composants d'icônes (réutilisés)
const InstagramIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const FacebookIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const WebsiteIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </svg>
)

type Connection = {
  _id: string
  name: string
  integrationType: string
  aiBuildId: string
  isActive: boolean
  folderId?: string | null  // CORRIGÉ - accepte null
  aiName?: string
  agentName?: string
  createdAt?: string
}

type DeploymentFolder = {
  _id: string
  name: string
  description: string
  color: string
  connectionCount: number
  updatedAt: string
}

// Modal Edit Deployment Folder
const EditDeploymentFolderModal = ({
  folder,
  isOpen,
  onClose,
  onUpdate
}: {
  folder: DeploymentFolder | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (folderData: { name: string; description: string; color: string }) => void
}) => {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedColor, setSelectedColor] = useState("#3B82F6")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const FOLDER_COLORS = [
    '#3B82F6', '#10B981', '#8B5CF6', '#F97316',
    '#EC4899', '#6366F1', '#EF4444', '#06B6D4',
  ]

  useEffect(() => {
    if (folder && isOpen) {
      setName(folder.name)
      setDescription(folder.description || "")
      setSelectedColor(folder.color)
    }
  }, [folder, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      await onUpdate({
        name: name.trim(),
        description: description.trim(),
        color: selectedColor
      })
      onClose()
    } catch (error) {
      console.error('Error updating deployment folder:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !folder) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md mx-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: selectedColor + '20', border: `2px solid ${selectedColor}40` }}
            >
              <FolderEdit className="w-6 h-6" style={{ color: selectedColor }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Edit Deployment Folder</h2>
              <p className="text-sm text-gray-400">Update folder details</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Folder Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name..."
              className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm"
              maxLength={50}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose of this folder..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm resize-none"
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-3">Folder Color</label>
            <div className="flex gap-3 flex-wrap">
              {FOLDER_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full transition-all duration-200 ${selectedColor === color
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110 shadow-lg'
                    : 'hover:scale-105 shadow-md'
                    }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-xl font-semibold transition-all backdrop-blur-sm"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="flex-1 px-4 py-3 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 transform hover:scale-105"
              style={{
                background: !name.trim() || isSubmitting
                  ? '#374151'
                  : `linear-gradient(135deg, ${selectedColor}, ${selectedColor}CC)`,
              }}
            >
              {isSubmitting ? 'Updating...' : 'Update Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal Delete Deployment Folder
const DeleteDeploymentFolderModal = ({
  folder,
  isOpen,
  onClose,
  onDelete
}: {
  folder: DeploymentFolder | null
  isOpen: boolean
  onClose: () => void
  onDelete: (deleteConnections: boolean) => void
}) => {
  const [deleteConnections, setDeleteConnections] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(deleteConnections)
      onClose()
    } catch (error) {
      console.error('Error deleting deployment folder:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen || !folder) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md mx-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Delete Deployment Folder</h2>
              <p className="text-sm text-gray-400">This action cannot be undone</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-300 text-sm font-medium mb-1">
                  You're about to delete "{folder.name}"
                </p>
                <p className="text-red-400/80 text-xs">
                  {folder.connectionCount > 0
                    ? `This folder contains ${folder.connectionCount} deployment${folder.connectionCount > 1 ? 's' : ''}`
                    : 'This folder is empty'
                  }
                </p>
              </div>
            </div>
          </div>

          {folder.connectionCount > 0 && (
            <div className="space-y-4 mb-6">
              <p className="text-white font-medium">What should happen to the deployments?</p>

              <button
                type="button"
                onClick={() => setDeleteConnections(false)}
                className={`w-full p-4 rounded-xl border transition-all text-left cursor-pointer ${!deleteConnections
                  ? 'border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                  : 'border-gray-700/50 bg-gray-800/30 hover:border-gray-600/50'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 mt-0.5 transition-all ${!deleteConnections ? 'border-blue-400 bg-blue-400' : 'border-gray-500'
                    }`}>
                    {!deleteConnections && <CheckCircle className="w-5 h-5 text-white -m-0.5" />}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium transition-colors ${!deleteConnections ? 'text-blue-300' : 'text-white'
                      }`}>
                      Keep deployments safe
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Move deployments to the root level (recommended)
                    </div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeleteConnections(true)}
                className={`w-full p-4 rounded-xl border transition-all text-left cursor-pointer ${deleteConnections
                  ? 'border-red-500/50 bg-red-500/10 shadow-lg shadow-red-500/10'
                  : 'border-gray-700/50 bg-gray-800/30 hover:border-gray-600/50'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 mt-0.5 transition-all ${deleteConnections ? 'border-red-400 bg-red-400' : 'border-gray-500'
                    }`}>
                    {deleteConnections && <CheckCircle className="w-5 h-5 text-white -m-0.5" />}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium transition-colors ${deleteConnections ? 'text-red-300' : 'text-white'
                      }`}>
                      Delete all deployments
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Permanently delete all deployments in this folder
                    </div>
                  </div>
                </div>
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t border-gray-700/50">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3.5 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-xl font-semibold transition-all backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 px-4 py-3.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-500/20 transform hover:scale-105 relative overflow-hidden group disabled:opacity-50 disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="relative z-10">
                {isDeleting ? 'Deleting...' : 'Delete Folder'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Composant Connection Status
const ConnectionStatus = ({ isActive }: { isActive: boolean }) => {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
      isActive
        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
        : 'bg-gray-500/15 text-gray-400 border border-gray-500/30'
    }`}>
      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
      {isActive ? 'Live' : 'Offline'}
    </div>
  );
};

export default function DeploymentFolderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const folderId = params.id as string

  const [folder, setFolder] = useState<DeploymentFolder | null>(null)
  const [connections, setConnections] = useState<Connection[]>([])
  const [deploymentFolders, setDeploymentFolders] = useState<DeploymentFolder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // États pour les modals
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    connectionId: '',
    connectionName: '',
    integrationType: ''
  })
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch folder et connections
  useEffect(() => {
    if (!folderId) return

    const fetchData = async () => {
      try {
        const [folderResponse, foldersResponse] = await Promise.all([
          fetch(`/api/deployment-folders/${folderId}`, { credentials: 'include' }),
          fetch('/api/deployment-folders', { credentials: 'include' })
        ])

        if (folderResponse.ok) {
          const folderData = await folderResponse.json()
          setFolder(folderData.folder)
          setConnections(folderData.connections || [])
        } else {
          console.error('Failed to fetch deployment folder')
          router.push('/launch-agent')
        }

        if (foldersResponse.ok) {
          const foldersData = await foldersResponse.json()
          setDeploymentFolders(foldersData.folders || [])
        }

      } catch (error) {
        console.error('Error fetching deployment folder:', error)
        router.push('/launch-agent')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [folderId, router])

  // Filter connections
  const filteredConnections = connections.filter(connection =>
    connection.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleUpdateFolder = async (folderData: { name: string; description: string; color: string }) => {
    try {
      const response = await fetch(`/api/deployment-folders/${folderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(folderData)
      })

      if (response.ok) {
        const data = await response.json()
        setFolder(data.folder)
      }
    } catch (error) {
      console.error('Error updating deployment folder:', error)
    }
  }

  const handleDeleteFolder = async (deleteConnections: boolean) => {
    try {
      const response = await fetch(`/api/deployment-folders?id=${folderId}&deleteConnections=${deleteConnections}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        router.push('/launch-agent')
      }
    } catch (error) {
      console.error('Error deleting deployment folder:', error)
    }
  }

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

  const handleDeleteConnection = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/connections/${deleteModal.connectionId}`, { method: 'DELETE' })
      if (response.ok) {
        setConnections(prev => prev.filter(c => c._id !== deleteModal.connectionId))
        if (folder) {
          setFolder(prev => prev ? { ...prev, connectionCount: prev.connectionCount - 1 } : null)
        }
        closeDeleteModal()
      }
    } catch (err) {
      console.error('Failed to delete connection:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRemoveFromFolder = async (connectionId: string) => {
    try {
      const response = await fetch(`/api/connections/${connectionId}/folder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ folderId: null })
      })

      if (response.ok) {
        setConnections(prev => prev.filter(connection => connection._id !== connectionId))
        if (folder) {
          setFolder(prev => prev ? { ...prev, connectionCount: prev.connectionCount - 1 } : null)
        }
      } else {
        console.error('Failed to remove connection from folder')
      }
    } catch (error) {
      console.error('Error removing connection from folder:', error)
    }
  }

  const handleMoveConnection = async (connectionId: string, targetFolderId: string | null) => {
    try {
      const response = await fetch(`/api/connections/${connectionId}/folder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ folderId: targetFolderId })
      })

      if (response.ok) {
        // Retirer la connection de cette page
        setConnections(prev => prev.filter(connection => connection._id !== connectionId))
        if (folder) {
          setFolder(prev => prev ? { ...prev, connectionCount: prev.connectionCount - 1 } : null)
        }
      }
    } catch (error) {
      console.error('Error moving connection:', error)
    }
  }

  const getIntegrationIcon = (type: string) => {
  switch (type) {
    case 'website-widget': return <WebsiteIcon size={32} className="text-white" />;
    case 'facebook-messenger': return <FacebookIcon size={32} className="text-white" />;
    case 'instagram-dms': return <InstagramIcon size={32} className="text-white" />;
    case 'webhook': return <Webhook size={32} className="text-white" />;
    default: return <Globe size={32} className="text-gray-400" />;
  }
};

  const getIntegrationDisplayName = (type: string) => {
    switch (type) {
      case 'website-widget': return 'Website Widget';
      case 'facebook-messenger': return 'Facebook Messenger';
      case 'instagram-dms': return 'Instagram DMs';
      case 'sms': return 'SMS';
      default: return type;
    }
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">
        <div className="relative z-10">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-gray-700/40 animate-pulse"></div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gray-700/40 animate-pulse"></div>
                  <div>
                    <div className="h-10 bg-gray-700/40 rounded-lg w-64 mb-2 animate-pulse"></div>
                    <div className="h-5 bg-gray-700/40 rounded-lg w-96 animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-12 bg-gray-700/40 rounded-xl w-32 animate-pulse"></div>
                <div className="h-12 bg-gray-700/40 rounded-xl w-36 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Search skeleton */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 md:p-6 mb-8 shadow-xl">
            <div className="h-14 bg-gray-700/40 rounded-xl animate-pulse"></div>
          </div>

          {/* Grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-900/40 to-gray-800/20 backdrop-blur-sm border border-gray-700/30 rounded-2xl shadow-xl p-6 h-[300px] animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-700/40"></div>
                  <div className="w-6 h-6 rounded-lg bg-gray-700/40"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-6 bg-gray-700/40 rounded-lg w-3/4"></div>
                  <div className="h-4 bg-gray-700/40 rounded-lg w-1/2"></div>
                  <div className="h-3 bg-gray-700/40 rounded-lg w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!folder) {
    return (
      <div className="min-h-screen bg-transparent p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Deployment folder not found</h1>
          <Link href="/launch-agent" className="text-blue-400 hover:text-blue-300">
            ← Back to Deployment Center
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar bg-transparent relative">

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="p-8 relative z-10">

        {/* Modals */}
        <EditDeploymentFolderModal
          folder={folder}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdateFolder}
        />

        <DeleteDeploymentFolderModal
          folder={folder}
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleDeleteFolder}
        />

        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteConnection}
          connectionName={deleteModal.connectionName}
          integrationType={deleteModal.integrationType}
          isDeleting={isDeleting}
        />

        {/* Header Section */}
        <FadeInSection>
          <div className="mb-8">
            <div className="flex items-center justify-between">

              {/* Left Side - Breadcrumb & Title */}
              <div className="flex items-center gap-6">
                <Link
                  href="/launch-agent"
                  className="w-12 h-12 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all shadow-lg hover:shadow-xl"
                >
                  <ArrowLeft size={20} />
                </Link>

                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{
                      backgroundColor: folder.color + '20',
                      border: `2px solid ${folder.color}40`,
                      boxShadow: `0 10px 25px -5px ${folder.color}20`
                    }}
                  >
                    <Folder className="w-8 h-8" style={{ color: folder.color }} />
                  </div>

                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-emerald-200 to-blue-200 bg-clip-text text-transparent mb-2">
                      {folder.name}
                    </h1>
                    <div className="flex items-center gap-4 text-gray-400">
                      <span>{folder.description || "No description"}</span>
                      <span>•</span>
                      <div className="flex items-center gap-2">
                        <Monitor size={16} />
                        <span>{connections.length} deployment{connections.length !== 1 ? 's' : ''}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>Updated {new Date(folder.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-6 py-3 bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 text-white rounded-xl font-medium transition-all border border-gray-700/50 hover:border-gray-600/50 flex items-center gap-2 shadow-lg"
                >
                  <FolderEdit size={18} />
                  Edit Folder
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:shadow-red-500/20 transform hover:scale-105"
                >
                  <Trash2 size={18} />
                  Delete Folder
                </button>
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* Search Bar */}
        {connections.length > 0 && (
          <FadeInSection>
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 md:p-6 mb-8 shadow-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={20} />
                <input
                  type="text"
                  placeholder="Search deployments in this folder..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder-gray-400 font-medium text-base backdrop-blur-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors z-10"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </FadeInSection>
        )}

        {/* Connections Grid */}
        <FadeInSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-8">

            {/* Connection Cards */}
            {filteredConnections.map((connection) => (
  <div key={connection._id} className="relative group">
    <div className={`
      relative bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-sm rounded-2xl shadow-xl p-5 h-[240px] transition-all duration-300 cursor-pointer flex flex-col border-2
      ${connection.isActive 
        ? 'border-emerald-500/40 hover:border-emerald-500/60 hover:shadow-emerald-500/10' 
        : 'border-gray-700/50 hover:border-gray-600/60 hover:shadow-gray-500/5'
      }
      hover:scale-[1.02]
    `}>
      
      <div className={`absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none ${
        connection.isActive 
          ? 'group-hover:bg-emerald-500/[0.02]' 
          : 'group-hover:bg-blue-500/[0.02]'
      }`}></div>

      <div className="flex items-center justify-between mb-4">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
          connection.isActive
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
            : 'bg-gray-500/15 text-gray-400 border border-gray-500/30'
        }`}>
          <div className={`w-2 h-2 rounded-full ${connection.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
          {connection.isActive ? 'Live' : 'Offline'}
        </div>

        <div className="absolute top-4 right-4 z-10">
          <ConnectionActions
            connection={connection}
            deploymentFolders={deploymentFolders.filter(f => f._id !== folderId)}
            onToggle={() => handleToggleStatus(connection._id)}
            onDelete={() => openDeleteModal(connection)}
            onView={() => router.push(`/launch-agent/${connection._id}/${connection.integrationType}`)}
            onMoveToFolder={(targetFolderId) => {
              if (targetFolderId === null) {
                handleRemoveFromFolder(connection._id)
              } else {
                handleMoveConnection(connection._id, targetFolderId)
              }
            }}
          />
        </div>
      </div>

      <div onClick={() => router.push(`/launch-agent/${connection._id}/${connection.integrationType}`)} className="flex-1 flex flex-col items-center text-center justify-center">
        <div className="relative mb-4">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg ${
            connection.integrationType === 'webhook'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500'
              : connection.integrationType === 'instagram-dms'
                ? 'bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888]'
                : connection.integrationType === 'facebook-messenger'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                  : connection.integrationType === 'website-widget'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                    : 'bg-gray-700/50'
          }`}>
            {getIntegrationIcon(connection.integrationType)}
          </div>

          <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
            connection.isActive ? 'bg-emerald-400' : 'bg-gray-500'
          } shadow-sm`} />
        </div>

        <h3 className="text-white font-bold text-base mb-3 line-clamp-2 leading-tight group-hover:text-blue-400 transition-all duration-300 max-w-full px-2">
          {connection.name}
        </h3>
        
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
))}
          </div>
        </FadeInSection>

        {/* Empty State */}
        {connections.length === 0 && (
          <FadeInSection>
            <div className="text-center py-20">
              <div className="relative inline-block mb-8">
                <div
                  className="absolute inset-0 rounded-full blur-3xl"
                  style={{ backgroundColor: folder.color + '20' }}
                ></div>
                <div
                  className="relative w-32 h-32 rounded-full border-2 flex items-center justify-center shadow-2xl"
                  style={{
                    backgroundColor: folder.color + '10',
                    borderColor: folder.color + '40',
                    boxShadow: `0 25px 50px -12px ${folder.color}30`
                  }}
                >
                  <Folder className="w-16 h-16" style={{ color: folder.color }} />
                </div>
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-4">
                This folder is empty
              </h3>
              <p className="text-gray-400 mb-10 max-w-md mx-auto text-lg leading-relaxed">
                Create your first deployment in this folder to get started with organized AI automation.
              </p>
              <Link
                href={`/create-connection?folderId=${folderId}`}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 transform hover:scale-105"
              >
                <Plus size={20} />
                Create First Deployment
              </Link>
            </div>
          </FadeInSection>
        )}

        {/* No Search Results */}
        {connections.length > 0 && filteredConnections.length === 0 && (
          <FadeInSection>
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-2xl bg-gray-700/50 border border-gray-600/50 flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-4">
                No deployments found
              </h3>
              <p className="text-gray-400 mb-8 text-lg">
                Try adjusting your search terms or create a new deployment
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-6 py-3 text-emerald-400 hover:text-emerald-300 transition-colors font-medium border border-emerald-500/20 rounded-xl hover:bg-emerald-500/10"
                >
                  Clear search
                </button>
                <Link
                  href={`/create-connection?folderId=${folderId}`}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl hover:shadow-emerald-500/20"
                >
                  Create Deployment
                </Link>
              </div>
            </div>
          </FadeInSection>
        )}
      </div>
    </div>
  );
}