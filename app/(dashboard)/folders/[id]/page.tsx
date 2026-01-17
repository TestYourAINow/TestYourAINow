// app\(dashboard)\folders\[id]\page.tsx

"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft, Bot, Plus, Settings, Calendar, Webhook, File,
  Search, Filter, Activity, Eye, Edit3, MoreHorizontal,
  TrendingUp, Zap, Users, Circle, ChevronDown, Clock, Folder,
  FolderEdit, Trash2, FolderMinus, CheckCircle, X, AlertTriangle,
  Star, Shield
} from "lucide-react"

// 🔧 Import du modal de suppression d'agent (si tu l'as)
// import ModalDeleteAgent from "@/components/ModalDeleteAgent"

// Composant Mock pour ModalDeleteAgent (remplace par ton vrai composant)
const ModalDeleteAgent = ({ agent, onClose, onDelete }: {
  agent: any;
  onClose: () => void;
  onDelete: (id: string) => void;
}) => {
  if (!agent) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md mx-auto p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Delete Agent</h3>
        <p className="text-gray-400 mb-6">Are you sure you want to delete "{agent.name}"?</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onDelete(agent._id)}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-500 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

type Agent = {
  _id: string
  name: string
  createdAt: string
  updatedAt?: string
  integrations?: { name: string; type: string }[]
  folderId?: string
}

type FolderType = {
  _id: string
  name: string
  description: string
  color: string
  agentCount: number
  updatedAt: string
}

// 🎨 Modal Edit Folder Premium selon design system
const EditFolderModal = ({
  folder,
  isOpen,
  onClose,
  onUpdate
}: {
  folder: FolderType | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (folderData: { name: string; description: string; color: string }) => void
}) => {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedColor, setSelectedColor] = useState("#10B981")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const FOLDER_COLORS = [
    { color: '#3B82F6', name: 'Blue' },
    { color: '#10B981', name: 'Green' },
    { color: '#8B5CF6', name: 'Purple' },
    { color: '#F97316', name: 'Orange' },
    { color: '#EC4899', name: 'Pink' },
    { color: '#6366F1', name: 'Indigo' },
    { color: '#EF4444', name: 'Red' },
    { color: '#06B6D4', name: 'Cyan' },
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
      console.error('Error updating folder:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !folder) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: selectedColor + '20',
                border: `2px solid ${selectedColor}40`
              }}
            >
              <FolderEdit className="w-6 h-6" style={{ color: selectedColor }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Edit Folder
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">Update folder details</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200 group"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-500/0 to-gray-500/0 group-hover:from-gray-500/10 group-hover:to-gray-500/10 transition-all duration-200"></div>
            <X size={20} className="relative z-10" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Folder Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Folder Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name..."
              className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm"
              maxLength={50}
              required
            />
            <div className="text-xs text-gray-500 mt-1">{name.length}/50 characters</div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose of this folder..."
              rows={3}
              className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm resize-none"
              maxLength={200}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">Optional</span>
              <span className="text-xs text-gray-500">{description.length}/200</span>
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Folder Color
            </label>
            <div className="grid grid-cols-4 gap-3">
              {FOLDER_COLORS.map((colorOption) => (
                <button
                  key={colorOption.color}
                  type="button"
                  onClick={() => setSelectedColor(colorOption.color)}
                  className={`group relative w-full h-12 rounded-xl transition-all duration-200 overflow-hidden ${selectedColor === colorOption.color
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-105'
                    : 'hover:scale-105'
                    }`}
                  style={{ backgroundColor: colorOption.color }}
                  title={colorOption.name}
                >
                  {selectedColor === colorOption.color && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white drop-shadow-lg" />
                    </div>
                  )}

                  {/* Gradient overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent group-hover:from-white/20 transition-all duration-200"></div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">Choose a color to organize your folders</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-700/50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3.5 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-xl font-semibold transition-all backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="flex-1 px-4 py-3.5 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden group disabled:opacity-50 disabled:hover:scale-100"
              style={{
                backgroundColor: selectedColor,
                boxShadow: `0 10px 25px -5px ${selectedColor}20`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="relative z-10">
                {isSubmitting ? 'Updating...' : 'Update Folder'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// 🎨 Modal Delete Folder Premium
const DeleteFolderModal = ({
  folder,
  isOpen,
  onClose,
  onDelete
}: {
  folder: FolderType | null
  isOpen: boolean
  onClose: () => void
  onDelete: (deleteAgents: boolean) => void
}) => {
  const [deleteAgents, setDeleteAgents] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(deleteAgents)
      onClose()
    } catch (error) {
      console.error('Error deleting folder:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen || !folder) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Delete Folder
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">This action cannot be undone</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200 group"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">

          {/* Warning Message */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-300 text-sm font-medium mb-1">
                  You're about to delete "{folder.name}"
                </p>
                <p className="text-red-400/80 text-xs">
                  {folder.agentCount > 0
                    ? `This folder contains ${folder.agentCount} agent${folder.agentCount > 1 ? 's' : ''}`
                    : 'This folder is empty'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Options for agents */}
          {folder.agentCount > 0 && (
            <div className="space-y-4 mb-6">
              <p className="text-white font-medium">What should happen to the agents?</p>

              {/* Option 1 - Move to root */}
              <button
                type="button"
                onClick={() => setDeleteAgents(false)}
                className={`w-full p-4 rounded-xl border transition-all text-left cursor-pointer ${!deleteAgents
                  ? 'border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                  : 'border-gray-700/50 bg-gray-800/30 hover:border-gray-600/50'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 mt-0.5 transition-all ${!deleteAgents ? 'border-blue-400 bg-blue-400' : 'border-gray-500'
                    }`}>
                    {!deleteAgents && <CheckCircle className="w-5 h-5 text-white -m-0.5" />}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium transition-colors ${!deleteAgents ? 'text-blue-300' : 'text-white'
                      }`}>
                      Keep agents safe
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Move agents to the root level (recommended)
                    </div>
                  </div>
                </div>
              </button>

              {/* Option 2 - Delete all agents */}
              <button
                type="button"
                onClick={() => setDeleteAgents(true)}
                className={`w-full p-4 rounded-xl border transition-all text-left cursor-pointer ${deleteAgents
                  ? 'border-red-500/50 bg-red-500/10 shadow-lg shadow-red-500/10'
                  : 'border-gray-700/50 bg-gray-800/30 hover:border-gray-600/50'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 mt-0.5 transition-all ${deleteAgents ? 'border-red-400 bg-red-400' : 'border-gray-500'
                    }`}>
                    {deleteAgents && <CheckCircle className="w-5 h-5 text-white -m-0.5" />}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium transition-colors ${deleteAgents ? 'text-red-300' : 'text-white'
                      }`}>
                      Delete all agents
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Permanently delete all agents in this folder
                    </div>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Actions */}
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

// 🎨 Agent Actions Premium
const AgentActions = ({
  agent,
  onDelete,
  onRemoveFromFolder
}: {
  agent: Agent;
  onDelete: () => void;
  onRemoveFromFolder?: () => void;
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  return (
    <div ref={dropdownRef} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowDropdown(!showDropdown);
        }}
        className="w-8 h-8 rounded-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
      >
        <MoreHorizontal size={14} />
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-[100] min-w-[160px] py-2 overflow-hidden">

          {/* Primary Actions */}
          <Link
            href={`/agents/${agent._id}`}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all"
          >
            <Eye size={14} className="text-blue-400" />
            View Details
          </Link>

          <Link
            href={`/agent-lab?agentId=${agent._id}`}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all"
          >
            <Edit3 size={14} className="text-green-400" />
            Edit in Lab
          </Link>

          {/* Separator */}
          {onRemoveFromFolder && (
            <>
              <hr className="my-1 border-gray-700/50" />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemoveFromFolder();
                  setShowDropdown(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-orange-400 hover:text-orange-300 hover:bg-orange-900/20 transition-all text-left"
              >
                <FolderMinus size={14} />
                Remove from Folder
              </button>
            </>
          )}

          {/* Dangerous Actions */}
          <hr className="my-1 border-gray-700/50" />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
              setShowDropdown(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all text-left"
          >
            <Trash2 size={14} />
            Delete Agent
          </button>
        </div>
      )}
    </div>
  );
};

// 🎨 Agent Status Premium
const AgentStatus = ({ integrations }: { integrations?: { name: string; type: string }[] }) => {
  const isActive = integrations && integrations.length > 0;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm ${isActive
      ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-lg shadow-green-500/10'
      : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
      }`}>
      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-gray-500'
        }`} />
      {isActive ? 'Active' : 'Inactive'}
    </div>
  );
};

// 🔧 FadeInSection Component (pour animation)
const FadeInSection = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="animate-fade-in">
      {children}
    </div>
  );
};

export default function FolderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const folderId = params.id as string

  const [folder, setFolder] = useState<FolderType | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // 🔧 Fetch folder et agents - LOGIQUE VRAIE
  useEffect(() => {
    if (!folderId) return

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/folders/${folderId}`, {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          setFolder(data.folder)
          setAgents(data.agents || [])
        } else {
          console.error('Failed to fetch folder')
          router.push('/agents')
        }
      } catch (error) {
        console.error('Error fetching folder:', error)
        router.push('/agents')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [folderId, router])

  // Filter agents
  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleUpdateFolder = async (folderData: { name: string; description: string; color: string }) => {
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
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
      console.error('Error updating folder:', error)
    }
  }

  const handleDeleteFolder = async (deleteAgents: boolean) => {
    try {
      const response = await fetch(`/api/folders?id=${folderId}&deleteAgents=${deleteAgents}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        router.push('/agents')
      }
    } catch (error) {
      console.error('Error deleting folder:', error)
    }
  }

  const handleDeleteAgent = (id: string) => {
    setAgents((prev) => prev.filter((a) => a._id !== id))
    setAgentToDelete(null)
  }

  // 🔧 Handler pour retirer agent du folder - LOGIQUE VRAIE
  const handleRemoveFromFolder = async (agentId: string) => {
    try {
      const response = await fetch(`/api/agents/${agentId}/folder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ folderId: null })  // null = retirer du folder
      })

      if (response.ok) {
        // Retirer l'agent de la liste
        setAgents(prev => prev.filter(agent => agent._id !== agentId))
        // Mettre à jour le count du folder
        if (folder) {
          setFolder(prev => prev ? { ...prev, agentCount: prev.agentCount - 1 } : null)
        }
        console.log('Agent removed from folder successfully!')
      } else {
        console.error('Failed to remove agent from folder')
      }
    } catch (error) {
      console.error('Error removing agent from folder:', error)
    }
  }

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'webhook':
        return <Webhook size={12} className="text-blue-400" />
      case 'calendly':
        return <Calendar size={12} className="text-green-400" />
      case 'files':
        return <File size={12} className="text-purple-400" />
      default:
        return <Settings size={12} className="text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">

        {/* Background Effects pendant loading */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {/* Back button skeleton */}
                <div className="w-12 h-12 rounded-xl bg-gray-700/40 animate-pulse"></div>

                <div className="flex items-center gap-4">
                  {/* Folder icon skeleton */}
                  <div className="w-16 h-16 rounded-2xl bg-gray-700/40 animate-pulse"></div>

                  <div>
                    {/* Title skeleton */}
                    <div className="h-10 bg-gray-700/40 rounded-lg w-64 mb-2 animate-pulse"></div>
                    {/* Description skeleton */}
                    <div className="h-5 bg-gray-700/40 rounded-lg w-96 animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Actions skeleton */}
              <div className="flex gap-3">
                <div className="h-12 bg-gray-700/40 rounded-xl w-32 animate-pulse"></div>
                <div className="h-12 bg-gray-700/40 rounded-xl w-36 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Search bar skeleton */}
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
          <h1 className="text-2xl font-bold text-white mb-4">Folder not found</h1>
          <Link href="/agents" className="text-blue-400 hover:text-blue-300">
            ← Back to Agents
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar bg-transparent relative">

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="p-8 relative z-10">

        {/* Modals */}
        {agentToDelete && (
          <ModalDeleteAgent
            agent={agentToDelete}
            onClose={() => setAgentToDelete(null)}
            onDelete={handleDeleteAgent}
          />
        )}

        <EditFolderModal
          folder={folder}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdateFolder}
        />

        <DeleteFolderModal
          folder={folder}
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleDeleteFolder}
        />

        {/* Header Section */}

        <FadeInSection>
          <div className="mb-8">
            <div className="flex items-center justify-between">

              {/* Left Side - Breadcrumb & Title */}
              <div className="flex items-center gap-6">
                <Link
                  href="/agents"
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
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-2">
                      {folder.name}
                    </h1>
                    <div className="flex items-center gap-4 text-gray-400">
                      <span>{folder.description || "No description"}</span>
                      <span>•</span>
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        <span>{agents.length} agent{agents.length !== 1 ? 's' : ''}</span>
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

        {/* Search Bar - MÊME STYLE QUE LA PAGE AGENTS */}
        {agents.length > 0 && (
          <FadeInSection>
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 md:p-6 mb-8 shadow-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={20} />
                <input
                  type="text"
                  placeholder="Search agents in this folder..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium text-base backdrop-blur-sm"
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

        {/* Agents Grid - DESIGN UNIFIÉ */}
        <FadeInSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-8">

            {/* Agent Cards UNIFORMISÉS */}
            {filteredAgents.map((agent) => (
              <div
                key={agent._id}
                className={`relative bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-sm rounded-2xl shadow-xl p-5 h-[260px] transition-all duration-300 group cursor-pointer flex flex-col border-2
  ${agent.integrations && agent.integrations.length > 0
                    ? 'border-emerald-500/40 hover:border-emerald-500/60 hover:shadow-emerald-500/10'
                    : 'border-gray-700/50 hover:border-gray-600/60 hover:shadow-gray-500/5'
                  }
  hover:scale-[1.02]
`}
              >
                {/* Background Gradient Overlay */}
                <div className={`absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none ${agent.integrations && agent.integrations.length > 0
                    ? 'group-hover:bg-emerald-500/[0.02]'
                    : 'group-hover:bg-blue-500/[0.02]'
                  }`}></div>

                {/* Actions Menu */}
                <div className="absolute top-4 right-4 z-20">
                  <AgentActions
                    agent={agent}
                    onDelete={() => setAgentToDelete(agent)}
                    onRemoveFromFolder={() => handleRemoveFromFolder(agent._id)}
                  />
                </div>

                <Link href={`/agents/${agent._id}`} className="flex flex-col h-full relative z-10">

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-blue-500/30">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                      {/* Status Indicator */}
                      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${agent.integrations && agent.integrations.length > 0
                        ? 'bg-emerald-400'
                        : 'bg-gray-500'
                        } shadow-sm`} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col">

                    {/* Name & Status */}
                    <div className="mb-4">
                      <h3 className="text-white font-bold text-base mb-2 line-clamp-2 leading-tight">
                        {agent.name || "Untitled Agent"}
                      </h3>
                      <AgentStatus integrations={agent.integrations} />
                    </div>

                    {/* Integrations */}
                    <div className="flex-1 min-h-0 mb-3">
                      {agent.integrations && agent.integrations.length > 0 ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Zap size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-400 font-medium">
                              {agent.integrations.length} integration{agent.integrations.length > 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {agent.integrations.slice(0, 2).map((integration, idx) => (
                              <div
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800/60 border border-gray-600/50 rounded-md text-[10px] text-gray-300 font-medium backdrop-blur-sm"
                              >
                                {getIntegrationIcon(integration.type)}
                                <span className="truncate max-w-[50px]">
                                  {integration.name}
                                </span>
                              </div>
                            ))}
                            {agent.integrations.length > 2 && (
                              <div className="inline-flex items-center px-2 py-1 bg-gray-700/40 border border-gray-600/40 rounded-md text-[10px] text-gray-400 font-medium">
                                +{agent.integrations.length - 2}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Circle size={12} className="opacity-50" />
                          <span className="text-xs font-medium">No integrations</span>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto pt-2 border-t border-gray-700/30">
                      <Clock size={10} />
                      <span>
                        Updated {new Date(agent.updatedAt || agent.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </FadeInSection>

        {/* Empty State - AMÉLIORÉ AVEC BOUTON CREATE */}
        {agents.length === 0 && (
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
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                This folder is empty
              </h3>
              <p className="text-gray-400 mb-10 max-w-md mx-auto text-lg leading-relaxed">
                Create your first AI agent in this folder to get started with organization and automation.
              </p>
              <Link
                href={`/agents/new?folderId=${folderId}`}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:scale-105"
              >
                <Plus size={20} />
                Create First Agent
              </Link>
            </div>
          </FadeInSection>
        )}

        {/* No Search Results */}
        {agents.length > 0 && filteredAgents.length === 0 && (
          <FadeInSection>
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-2xl bg-gray-700/50 border border-gray-600/50 flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                No agents found
              </h3>
              <p className="text-gray-400 mb-8 text-lg">
                Try adjusting your search terms or create a new agent
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-6 py-3 text-blue-400 hover:text-blue-300 transition-colors font-medium border border-blue-500/20 rounded-xl hover:bg-blue-500/10"
                >
                  Clear search
                </button>
                <Link
                  href={`/agents/new?folderId=${folderId}`}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/20"
                >
                  Create Agent
                </Link>
              </div>
            </div>
          </FadeInSection>
        )}
      </div>
    </div>
  );
}