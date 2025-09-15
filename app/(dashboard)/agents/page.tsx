"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Trash2, Bot, Plus, Settings, Calendar, Webhook, File,
  Search, Filter, Activity, Eye, Edit3,
  TrendingUp, Zap, Users, Circle, Star, Clock,
  FolderPlus, Folder, FolderEdit, FolderMinus, AlertTriangle, X, CheckCircle
} from "lucide-react"
import ModalDeleteAgent from "@/components/ModalDeleteAgent"
import FadeInSection from "@/components/FadeInSection"
import CreateFolderModal from "@/components/CreateFolderModal"
import FolderCard from "@/components/FolderCard"
import AgentActions from "@/components/Dropdowns/AgentActions"
import SearchAgentsFoldersDropdown from "@/components/Dropdowns/SearchAgents&FoldersDropdown"

type Agent = {
  _id: string
  name: string
  createdAt: string
  updatedAt?: string
  integrations?: { name: string; type: string }[]
  folderId?: string | null
  isDeployed?: boolean
}

type FolderType = {
  _id: string
  name: string
  description: string
  color: string
  agentCount: number
  updatedAt: string
}

// Quick Create Agent Button
const QuickCreateAgentButton = () => (
  <Link href="/agents/new">
    <div className="group relative p-6 rounded-2xl border-2 border-dashed border-gray-600/50 hover:border-blue-500/40 transition-all duration-300 cursor-pointer bg-gradient-to-br from-gray-900/30 to-gray-800/20 hover:from-blue-900/10 hover:to-purple-900/10 backdrop-blur-sm h-[260px] flex flex-col items-center justify-center text-center">

      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/[0.02] group-hover:to-purple-500/[0.02] transition-all duration-300"></div>

      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-2 border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/10">
          <Bot size={24} className="text-blue-400 group-hover:text-blue-300 transition-colors" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-2 group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all">
        Create Agent
      </h3>
      <p className="text-gray-400 text-center leading-relaxed group-hover:text-gray-300 transition-colors text-sm px-4">
        Build your first intelligent AI assistant
      </p>

      <div className="mt-3 flex items-center gap-2 text-sm text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
        <Plus size={14} />
        <span className="font-medium">Get Started</span>
      </div>
    </div>
  </Link>
);

// Modal Edit Folder
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
  const [selectedColor, setSelectedColor] = useState("#3B82F6")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const FOLDER_COLORS = [
    '#3B82F6', '#10B981', '#8B5CF6', '#F97316', '#EC4899', '#6366F1', '#EF4444', '#06B6D4',
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
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: selectedColor + '20', border: `2px solid ${selectedColor}40` }}
            >
              <Folder className="w-6 h-6" style={{ color: selectedColor }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Edit Folder</h2>
              <p className="text-sm text-gray-400">Update folder details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all"
          >
            ×
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
            <label className="block text-sm font-semibold text-white mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose of this folder..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm resize-none"
              maxLength={200}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">Optional</span>
              <span className="text-xs text-gray-500">{description.length}/200</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Folder Color
            </label>
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
                  style={{ backgroundColor: color, boxShadow: selectedColor === color ? `0 0 20px ${color}40` : undefined }}
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
                boxShadow: !name.trim() || isSubmitting
                  ? 'none'
                  : `0 4px 20px ${selectedColor}30`
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

// Modal Delete Folder
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

        <div className="p-6">
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

          {folder.agentCount > 0 && (
            <div className="space-y-4 mb-6">
              <p className="text-white font-medium">What should happen to the agents?</p>
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

// Agent Status
const AgentStatus = ({ isDeployed }: { isDeployed?: boolean }) => {
  const isActive = isDeployed || false;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${isActive
      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
      : 'bg-gray-500/15 text-gray-400 border border-gray-500/30'
      }`}>
      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
      {isActive ? 'Active' : 'Inactive'}
    </div>
  );
};

// Skeleton card
const AgentCardSkeleton = () => (
  <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/20 backdrop-blur-sm border border-gray-700/30 rounded-2xl shadow-xl p-6 h-[280px] animate-pulse">
    <div className="flex justify-between items-start mb-6">
      <div className="w-14 h-14 rounded-xl bg-gray-700/40"></div>
      <div className="w-6 h-6 rounded-lg bg-gray-700/40"></div>
    </div>
    <div className="space-y-3">
      <div className="h-5 bg-gray-700/40 rounded-lg w-3/4"></div>
      <div className="h-4 bg-gray-700/40 rounded-lg w-1/2"></div>
      <div className="h-3 bg-gray-700/40 rounded-lg w-2/3"></div>
    </div>
  </div>
);

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [folders, setFolders] = useState<FolderType[]>([])
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([])
  const [filteredFolders, setFilteredFolders] = useState<FolderType[]>([])
  const [loading, setLoading] = useState(true)
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null)

  const [folderToEdit, setFolderToEdit] = useState<FolderType | null>(null)
  const [showEditFolderModal, setShowEditFolderModal] = useState(false)
  const [showDeleteFolderModal, setShowDeleteFolderModal] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "active" | "basic">("all")
  const [sortBy, setSortBy] = useState<"name" | "date" | "integrations">("date")
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)

  // Fetch data
  useEffect(() => {
    const start = Date.now()

    Promise.all([
      fetch("/api/agents", { credentials: "include" }).then(res => res.json()),
      fetch("/api/folders", { credentials: "include" }).then(res => res.json()).catch(() => ({ folders: [] }))
    ])
      .then(([agentsData, foldersData]) => {
        setAgents(agentsData.agents || [])
        setFolders(foldersData.folders || [])
        setFilteredAgents(agentsData.agents || [])
      })
      .catch((err) => console.error(err))
      .finally(() => {
        const elapsed = Date.now() - start
        const remaining = Math.max(0, 1000 - elapsed)
        setTimeout(() => setLoading(false), remaining)
      })
  }, [])

  // Filtering
  useEffect(() => {
    let filtered = agents.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase());
      const isNotInFolder = !agent.folderId ||
        agent.folderId === null ||
        agent.folderId === undefined ||
        agent.folderId === '';
      return matchesSearch && isNotInFolder;
    });

    let filteredFoldersArray = folders.filter(folder => {
      const matchesSearch = folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        folder.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    if (filterType === "active") {
      filtered = filtered.filter(agent => Boolean(agent.isDeployed))
    } else if (filterType === "basic") {
      filtered = filtered.filter(agent => !agent.isDeployed)
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "integrations":
          return (b.integrations?.length || 0) - (a.integrations?.length || 0)
        case "date":
        default:
          const dateA = new Date(a.updatedAt || a.createdAt).getTime()
          const dateB = new Date(b.updatedAt || b.createdAt).getTime()
          return dateB - dateA
      }
    })

    filteredFoldersArray.sort((a, b) => a.name.localeCompare(b.name))

    setFilteredAgents(filtered)
    setFilteredFolders(filteredFoldersArray)
  }, [agents, folders, searchQuery, filterType, sortBy])

  const handleDeleteAgent = (id: string) => {
    setAgents((prev) => prev.filter((a) => a._id !== id))
    setAgentToDelete(null)
  }

  const handleCreateFolder = async (folderData: { name: string; description: string; color: string }) => {
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(folderData)
      })

      if (response.ok) {
        const newFolder = await response.json()
        setFolders(prev => [...prev, { ...newFolder, agentCount: 0 }])
      }
    } catch (error) {
      console.error('Error creating folder:', error)
    }
  }

  const handleEditFolder = (folder: FolderType) => {
    setFolderToEdit(folder)
    setShowEditFolderModal(true)
  }

  const handleUpdateFolder = async (folderData: { name: string; description: string; color: string }) => {
    if (!folderToEdit) return

    try {
      const response = await fetch(`/api/folders/${folderToEdit._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(folderData)
      })

      if (response.ok) {
        const data = await response.json()
        setFolders(prev => prev.map(f => f._id === folderToEdit._id ? data.folder : f))
        setShowEditFolderModal(false)
        setFolderToEdit(null)
      }
    } catch (error) {
      console.error('Error updating folder:', error)
    }
  }

  const handleDeleteFolderAction = async (deleteAgents: boolean) => {
    if (!folderToEdit) return

    try {
      const response = await fetch(`/api/folders?id=${folderToEdit._id}&deleteAgents=${deleteAgents}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setFolders(prev => prev.filter(f => f._id !== folderToEdit._id))
        if (deleteAgents) {
          setAgents(prev => prev.filter(a => a.folderId !== folderToEdit._id))
        }
        setShowDeleteFolderModal(false)
        setFolderToEdit(null)
      }
    } catch (error) {
      console.error('Error deleting folder:', error)
    }
  }

  const handleMoveAgent = async (agentId: string, folderId: string | null) => {
    try {
      const response = await fetch(`/api/agents/${agentId}/folder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ folderId })
      })

      if (response.ok) {
        setAgents(prev => prev.map(agent =>
          agent._id === agentId
            ? { ...agent, folderId: folderId }
            : agent
        ));

        const foldersResponse = await fetch("/api/folders", { credentials: "include" })
        if (foldersResponse.ok) {
          const data = await foldersResponse.json()
          setFolders(data.folders || [])
        }
      }
    } catch (error) {
      console.error('Error moving agent:', error)
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
      default:
        return <Settings size={12} className="text-gray-400" />
    }
  }

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">
      
      {/* Modals */}
      {agentToDelete && (
        <ModalDeleteAgent
          agent={agentToDelete}
          onClose={() => setAgentToDelete(null)}
          onDelete={handleDeleteAgent}
        />
      )}

      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onCreate={handleCreateFolder}
      />

      <EditFolderModal
        folder={folderToEdit}
        isOpen={showEditFolderModal}
        onClose={() => {
          setShowEditFolderModal(false)
          setFolderToEdit(null)
        }}
        onUpdate={handleUpdateFolder}
      />

      <DeleteFolderModal
        folder={folderToEdit}
        isOpen={showDeleteFolderModal}
        onClose={() => {
          setShowDeleteFolderModal(false)
          setFolderToEdit(null)
        }}
        onDelete={handleDeleteFolderAction}
      />

      {/* Hero Section */}
      <FadeInSection>
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            {/* Left: Title & Stats */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-2 border-blue-500/40 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Bot className="text-blue-400" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent pb-1">
                    AI Agent Hub
                  </h1>
                  <p className="text-gray-400 text-lg">Manage your intelligent AI agents</p>
                </div>
              </div>

              {/* Live Stats */}
              {!loading && (
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-emerald-400 font-semibold">
                      {filteredAgents.filter(a => a.isDeployed).length} Active
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bot size={14} className="text-gray-400" />
                    <span className="text-gray-400">{agents.length} Total Agents</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Folder size={14} className="text-blue-400" />
                    <span className="text-blue-400">{folders.length} Folders</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Action Buttons - NEW AGENT TOUJOURS VISIBLE */}
            <div className="hidden lg:flex gap-3">
              {/* New Folder - Seulement si agents > 0 */}
              {agents.length > 0 && (
                <button
                  onClick={() => setShowCreateFolderModal(true)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:scale-105"
                >
                  <FolderPlus size={18} />
                  New Folder
                </button>
              )}
              
              {/* New Agent - TOUJOURS VISIBLE */}
              <Link
                href="/agents/new"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/20 transform hover:scale-105"
              >
                <Plus size={18} />
                New Agent
              </Link>
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* Search & Filter Bar */}
      {!loading && (agents.length > 0 || folders.length > 0) && (
        <FadeInSection>
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 md:p-6 mb-8 shadow-xl">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={20} />
                <input
                  type="text"
                  placeholder="Search agents and folders..."
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

              <div className="flex gap-2">
                {[
                  { key: "all", label: "All", icon: Circle },
                  { key: "active", label: "Active", icon: Zap },
                  { key: "basic", label: "Inactive", icon: Circle }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setFilterType(key as typeof filterType)}
                    className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 min-h-[44px] ${filterType === key
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                      : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 '
                      }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </FadeInSection>
      )}

      {/* Mobile Floating Buttons - SEULEMENT SI IL Y A DES AGENTS */}
      {agents.length > 0 && (
        <div className="fixed bottom-6 right-6 lg:hidden z-50">
          <div className="flex flex-col gap-3">
            {/* New Agent - Visible seulement si agents > 0 */}
            <Link
              href="/agents/new"
              className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-full shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
            >
              <Plus size={20} />
            </Link>

            {/* New Folder - Visible seulement si agents > 0 */}
            <button
              onClick={() => setShowCreateFolderModal(true)}
              className="w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-full shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
            >
              <FolderPlus size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <FadeInSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            <QuickCreateAgentButton />
            {[...Array(9)].map((_, i) => (
              <AgentCardSkeleton key={i} />
            ))}
          </div>
        </FadeInSection>
      ) : agents.length === 0 && folders.length === 0 ? (
        // Empty State avec Quick Create visible
        <FadeInSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-12">
            <QuickCreateAgentButton />
          </div>
          
          <div className="text-center py-20">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-full blur-3xl"></div>
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-r from-gray-800 to-gray-700 border-2 border-gray-600 flex items-center justify-center shadow-2xl">
                <Bot className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Ready to build your first AI agent?
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto text-lg leading-relaxed">
              Start building intelligent AI assistants to automate your workflows.
            </p>
            <div className="flex justify-center">
              <Link
                href="/agents/new"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:scale-105"
              >
                <Plus size={20} />
                Create Agent
              </Link>
            </div>
          </div>
        </FadeInSection>
      ) : (
        // Grid with content - PAS DE QUICKCREATE si agents > 0
        <FadeInSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">

            {/* Folders */}
            {filteredFolders.map((folder) => (
              <FolderCard
                key={folder._id}
                folder={folder}
                onEdit={() => handleEditFolder(folder)}
                onDelete={() => {
                  setFolderToEdit(folder)
                  setShowDeleteFolderModal(true)
                }}
              />
            ))}

            {/* Agents */}
            {filteredAgents.map((agent) => (
              <div
                key={agent._id}
                className="relative bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl p-5 h-[260px] hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/10 hover:scale-[1.02] transition-all duration-300 group cursor-pointer flex flex-col"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none"></div>

                <div className="absolute top-4 right-4 z-10">
                  <AgentActions
                    agent={agent}
                    folders={folders}
                    onDelete={() => setAgentToDelete(agent)}
                    onMoveToFolder={handleMoveAgent}
                  />
                </div>

                <Link href={`/agents/${agent._id}`} className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-500/30 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-blue-500/20">
                        <Bot className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${Boolean(agent.isDeployed)
                        ? 'bg-emerald-400'
                        : 'bg-gray-500'
                        } shadow-sm`} />
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <div className="mb-4">
                      <h3 className="text-white font-bold text-base mb-2 line-clamp-2 leading-tight group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                        {agent.name || "Untitled Agent"}
                      </h3>
                      <AgentStatus isDeployed={agent.isDeployed} />
                    </div>

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
      )}

      {/* No Results State */}
      {!loading && (agents.length > 0 || folders.length > 0) && filteredAgents.length === 0 && filteredFolders.length === 0 && (
        <FadeInSection>
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-gray-800/50 border border-gray-700/50 flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">
              No items match your criteria
            </h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search terms or filter settings
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterType("all");
              }}
              className="text-blue-400 hover:text-blue-300 transition-colors font-semibold"
            >
              Clear all filters
            </button>
          </div>
        </FadeInSection>
      )}
    </div>
  )
}