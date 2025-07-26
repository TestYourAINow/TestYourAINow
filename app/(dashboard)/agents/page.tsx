"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { 
  Trash2, Bot, Plus, Settings, Calendar, Webhook, File, 
  Search, Filter, Activity, Eye, Edit3, MoreHorizontal,
  TrendingUp, Zap, Users, Circle, ChevronDown, Star, Clock,
  FolderPlus, Folder, FolderEdit, FolderMinus
} from "lucide-react"
import ModalDeleteAgent from "@/components/ModalDeleteAgent"
import FadeInSection from "@/components/FadeInSection"
import RequireApiKey from "@/components/RequireApiKey"
import CreateFolderModal from "@/components/CreateFolderModal"
import FolderCard from "@/components/FolderCard"

type Agent = {
  _id: string
  name: string
  createdAt: string
  updatedAt?: string
  integrations?: { name: string; type: string }[]
  folderId?: string | null
}

type FolderType = {
  _id: string
  name: string
  description: string
  color: string
  agentCount: number
  updatedAt: string
}

// Modal Edit Folder - NOUVEAU DESIGN PREMIUM
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
    '#3B82F6', // Blue
    '#10B981', // Green 
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#EC4899', // Pink
    '#6366F1', // Indigo
    '#EF4444', // Red
    '#06B6D4', // Cyan
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
                  className={`w-10 h-10 rounded-full transition-all duration-200 ${
                    selectedColor === color
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

// Modal Delete - NOUVEAU DESIGN PREMIUM
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
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: folder.color + '20', border: `2px solid ${folder.color}40` }}
            >
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Delete Folder</h2>
              <p className="text-sm text-gray-400">This action cannot be undone</p>
            </div>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 backdrop-blur-sm">
            <p className="text-red-300 text-sm font-medium">
              You're about to delete <strong>"{folder.name}"</strong> 
              {folder.agentCount > 0 && ` which contains ${folder.agentCount} agent${folder.agentCount > 1 ? 's' : ''}`}.
            </p>
          </div>

          {folder.agentCount > 0 && (
            <div className="space-y-3">
              <p className="text-white font-semibold">What should happen to the agents?</p>
              
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                <input
                  type="radio"
                  name="agentAction"
                  checked={!deleteAgents}
                  onChange={() => setDeleteAgents(false)}
                  className="mt-1 w-4 h-4 text-blue-600"
                />
                <div>
                  <div className="text-white font-semibold">Move agents to root</div>
                  <div className="text-sm text-gray-400">Agents will be moved out of the folder</div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-red-900/10 transition-colors">
                <input
                  type="radio"
                  name="agentAction"
                  checked={deleteAgents}
                  onChange={() => setDeleteAgents(true)}
                  className="mt-1 w-4 h-4 text-red-600"
                />
                <div>
                  <div className="text-red-300 font-semibold">Delete all agents</div>
                  <div className="text-sm text-gray-400">⚠️ All agents in this folder will be permanently deleted</div>
                </div>
              </label>
            </div>
          )}
        </div>

        <div className="p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-xl font-semibold transition-all backdrop-blur-sm"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg hover:shadow-xl hover:shadow-red-500/20 transform hover:scale-105"
          >
            {isDeleting ? 'Deleting...' : 'Delete Folder'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Dropdown premium component - NOUVEAU DESIGN
const PremiumDropdown = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select...",
  icon: Icon
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; icon?: any }[];
  placeholder?: string;
  icon?: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer hover:bg-gray-800/80 hover:border-gray-600/60 flex items-center justify-between min-w-[140px] backdrop-blur-sm"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-gray-400" />}
          <span className="text-sm font-medium">{selectedOption?.label || placeholder}</span>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl z-[100] min-w-[160px] py-2">
          {options.map((option) => {
            const OptionIcon = option.icon;
            const isSelected = value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors ${
                  isSelected 
                    ? 'text-blue-300 bg-blue-600/20 border-r-2 border-blue-400' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {OptionIcon && <OptionIcon size={14} className={isSelected ? 'text-blue-400' : 'text-gray-400'} />}
                <span className="font-medium">{option.label}</span>
                {isSelected && <div className="ml-auto w-2 h-2 rounded-full bg-blue-400"></div>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// AgentActions UPDATED avec NOUVEAU DESIGN
const AgentActions = ({ 
  agent, 
  onDelete,
  folders = [],
  onMoveToFolder
}: { 
  agent: Agent; 
  onDelete: () => void;
  folders?: FolderType[];
  onMoveToFolder?: (agentId: string, folderId: string | null) => void;
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setShowMoveMenu(false);
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
        className="w-8 h-8 rounded-lg bg-gray-800/80 backdrop-blur-sm border border-gray-600/50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700/80 hover:border-gray-500/60 transition-all opacity-0 group-hover:opacity-100 duration-200"
      >
        <MoreHorizontal size={14} />
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 top-full mt-1 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl z-[100] min-w-[140px] py-2">
          <Link href={`/agents/${agent._id}`} className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors font-medium">
            <Eye size={14} className="text-gray-400" />
            View Details
          </Link>
          <Link href={`/agent-lab?agentId=${agent._id}`} className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors font-medium">
            <Edit3 size={14} className="text-gray-400" />
            Edit in Lab
          </Link>
          
          {onMoveToFolder && (
            <>
              <hr className="my-1 border-gray-700/50" />
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMoveMenu(!showMoveMenu);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors text-left font-medium"
                >
                  <Folder size={14} className="text-gray-400" />
                  Move to Folder
                  <ChevronDown size={12} className={`ml-auto transition-transform ${showMoveMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showMoveMenu && (
                  <div className="absolute left-full top-0 ml-1 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl min-w-[160px] py-2 z-[110]">
                    {agent.folderId && (
                      <>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onMoveToFolder(agent._id, null);
                            setShowDropdown(false);
                            setShowMoveMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-orange-400 hover:text-orange-300 hover:bg-orange-900/20 transition-colors text-left font-medium"
                        >
                          <FolderMinus size={14} />
                          Remove from Folder
                        </button>
                        <hr className="my-1 border-gray-700/50" />
                      </>
                    )}
                    
                    {folders.filter(f => f._id !== agent.folderId).map(folder => (
                      <button
                        key={folder._id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onMoveToFolder(agent._id, folder._id);
                          setShowDropdown(false);
                          setShowMoveMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors text-left font-medium"
                      >
                        <div 
                          className="w-3 h-3 rounded-full shadow-sm"
                          style={{ backgroundColor: folder.color }}
                        />
                        <span className="truncate">{folder.name}</span>
                      </button>
                    ))}
                    
                    {folders.filter(f => f._id !== agent.folderId).length === 0 && !agent.folderId && (
                      <div className="px-3 py-2.5 text-xs text-gray-500 text-center font-medium">
                        No folders available
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
          
          <hr className="my-1 border-gray-700/50" />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
              setShowDropdown(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors font-medium"
          >
            <Trash2 size={14} className="text-red-400" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

// Statut d'agent - NOUVEAU DESIGN
const AgentStatus = ({ integrations }: { integrations?: { name: string; type: string }[] }) => {
  const isActive = integrations && integrations.length > 0;
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
      isActive 
        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
        : 'bg-gray-500/15 text-gray-400 border border-gray-500/30'
    }`}>
      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
      {isActive ? 'Active' : 'Inactive'}
    </div>
  );
};

// Skeleton card - NOUVEAU DESIGN
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

  // Filtrage et tri
  useEffect(() => {
    let filtered = agents.filter(agent => 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !agent.folderId
    )

    if (filterType === "active") {
      filtered = filtered.filter(agent => agent.integrations && agent.integrations.length > 0)
    } else if (filterType === "basic") {
      filtered = filtered.filter(agent => !agent.integrations || agent.integrations.length === 0)
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

    setFilteredAgents(filtered)
  }, [agents, searchQuery, filterType, sortBy])

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
            ? { ...agent, folderId } 
            : agent
        ))
        
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
    <RequireApiKey>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">
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

        {/* Page Title Section */}
        {!loading && (
          <FadeInSection>
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Bot className="w-8 h-8 text-blue-400" />
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                    AI Agent Hub
                  </h1>
                  <p className="text-gray-400 text-lg mt-1">
                    Manage your intelligent AI agents
                  </p>
                </div>
              </div>
            </div>
          </FadeInSection>
        )}

        {/* Enhanced Analytics Overview - PREMIUM STATS CARDS */}
        {!loading && (agents.length > 0 || folders.length > 0) && (
          <FadeInSection>
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Total Agents */}
                <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 hover:bg-gray-800/40 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all duration-300">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-gray-400 text-sm font-medium">Total Agents</span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{agents.length}</div>
                  <div className="text-xs text-gray-500">AI assistants created</div>
                </div>

                {/* 2. Active Agents */}
                <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 hover:bg-gray-800/40 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:shadow-green-500/30 transition-all duration-300">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-gray-400 text-sm font-medium">Active Agents</span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {agents.filter(agent => agent.integrations && agent.integrations.length > 0).length}
                  </div>
                  <div className="text-xs text-gray-500">With integrations</div>
                </div>

                {/* 3. Total Integrations */}
                <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 hover:bg-gray-800/40 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/30 transition-all duration-300">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-gray-400 text-sm font-medium">Integrations</span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {agents.reduce((acc, agent) => acc + (agent.integrations?.length || 0), 0)}
                  </div>
                  <div className="text-xs text-gray-500">Connected services</div>
                </div>

                {/* 4. Total Folders */}
                <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 hover:bg-gray-800/40 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/30 transition-all duration-300">
                      <FolderPlus className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-gray-400 text-sm font-medium">Folders</span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{folders.length}</div>
                  <div className="text-xs text-gray-500">Organization units</div>
                </div>
              </div>
            </div>
          </FadeInSection>
        )}

        {/* Enhanced Search and Filter Bar */}
        {!loading && (agents.length > 0 || folders.length > 0) && (
          <FadeInSection>
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 mb-8 shadow-2xl">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Enhanced Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search agents and folders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Enhanced Filters + New Folder Button */}
                <div className="flex gap-3 flex-wrap">
                  <PremiumDropdown
                    value={filterType}
                    onChange={(value) => setFilterType(value as typeof filterType)}
                    options={[
                      { value: "all", label: "All Status", icon: Circle },
                      { value: "active", label: "Active Only", icon: Zap },
                      { value: "basic", label: "Inactive Only", icon: Circle }
                    ]}
                    icon={Filter}
                  />

                  <PremiumDropdown
                    value={sortBy}
                    onChange={(value) => setSortBy(value as typeof sortBy)}
                    options={[
                      { value: "date", label: "Recent Updates", icon: Clock },
                      { value: "name", label: "Alphabetical", icon: Users },
                      { value: "integrations", label: "By Integrations", icon: Zap }
                    ]}
                    icon={TrendingUp}
                  />

                  <button
                    onClick={() => setShowCreateFolderModal(true)}
                    className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 whitespace-nowrap shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 transform hover:scale-105"
                  >
                    <FolderPlus size={16} />
                    New Folder
                  </button>
                </div>
              </div>

              {/* Active filters indicator */}
              {(searchQuery || filterType !== "all") && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-700/50">
                  <span className="text-sm text-gray-400 font-medium">Active filters:</span>
                  {searchQuery && (
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold border border-blue-500/30">
                      Search: "{searchQuery}"
                    </span>
                  )}
                  {filterType !== "all" && (
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-semibold border border-purple-500/30">
                      Status: {filterType}
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setFilterType("all");
                    }}
                    className="ml-auto text-xs text-gray-400 hover:text-white transition-colors font-medium"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </FadeInSection>
        )}

        {/* Enhanced Grid Layout */}
        {loading ? (
          <FadeInSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {/* Create Agent Card */}
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl shadow-2xl h-[280px] flex flex-col items-center justify-center group backdrop-blur-sm">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/40 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                  <Plus size={28} className="text-blue-400" />
                </div>
                <p className="text-xl font-bold text-white mb-2">Create Agent</p>
                <p className="text-sm text-gray-400">Start building your AI</p>
              </div>
              
              {/* Loading Skeletons */}
              {[...Array(9)].map((_, i) => (
                <AgentCardSkeleton key={i} />
              ))}
            </div>
          </FadeInSection>
        ) : (
          <FadeInSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              
              {/* Create Agent Card - Enhanced */}
              <Link
                href="/agents/new"
                className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl shadow-2xl h-[280px] flex flex-col items-center justify-center hover:border-blue-500/50 hover:shadow-3xl hover:shadow-blue-500/20 hover:scale-[1.02] transition-all duration-300 group cursor-pointer backdrop-blur-sm order-first"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 transition-all duration-300 pointer-events-none"></div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/20">
                  <Plus size={28} className="text-blue-400 group-hover:text-cyan-300 transition-colors" />
                </div>
                <p className="text-xl font-bold text-white mb-2 group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  Create Agent
                </p>
                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  Start building your AI
                </p>
              </Link>

              {/* Folders */}
              {folders.map((folder) => (
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
                  className="relative bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl p-6 h-[280px] hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/10 hover:scale-[1.02] transition-all duration-300 group cursor-pointer"
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
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/20">
                          <Bot className="w-7 h-7 text-blue-400" />
                        </div>
                        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
                          agent.integrations && agent.integrations.length > 0 
                            ? 'bg-emerald-400 shadow-emerald-400/50' 
                            : 'bg-gray-500'
                        } shadow-md`} />
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                      <div className="mb-4">
                        <h3 className="text-white font-bold text-lg mb-3 truncate group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                          {agent.name || "Untitled Agent"}
                        </h3>
                        <AgentStatus integrations={agent.integrations} />
                      </div>

                      <div className="flex-1 mb-4">
                        {agent.integrations && agent.integrations.length > 0 ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Zap size={14} className="text-gray-400" />
                              <span className="text-xs text-gray-400 font-medium">
                                {agent.integrations.length} integration{agent.integrations.length > 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {agent.integrations.slice(0, 3).map((integration, idx) => (
                                <div
                                  key={idx}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-800/60 border border-gray-600/50 rounded-lg text-[11px] text-gray-300 font-medium backdrop-blur-sm"
                                >
                                  {getIntegrationIcon(integration.type)}
                                  <span className="truncate max-w-[60px]">
                                    {integration.name}
                                  </span>
                                </div>
                              ))}
                              {agent.integrations.length > 3 && (
                                <div className="inline-flex items-center px-2.5 py-1.5 bg-gray-700/40 border border-gray-600/40 rounded-lg text-[11px] text-gray-400 font-medium">
                                  +{agent.integrations.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-500">
                            <Circle size={14} className="opacity-50" />
                            <span className="text-xs font-medium">No integrations</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto">
                        <Clock size={12} />
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

        {/* Enhanced Empty State */}
        {!loading && agents.length === 0 && folders.length === 0 && (
          <FadeInSection>
            <div className="text-center py-20">
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-full blur-3xl"></div>
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-r from-gray-800 to-gray-700 border-2 border-gray-600 flex items-center justify-center shadow-2xl">
                  <Bot className="w-12 h-12 text-gray-400" />
                </div>
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                Ready to organize your AI workspace?
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto text-lg leading-relaxed">
                Create folders to organize your agents and start building intelligent AI assistants.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => setShowCreateFolderModal(true)}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 transform hover:scale-105"
                >
                  <FolderPlus size={20} />
                  Create Folder
                </button>
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
        )}

        {/* Enhanced No Results State */}
        {!loading && (agents.length > 0 || folders.length > 0) && filteredAgents.length === 0 && folders.length === 0 && (
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

        {/* Quick Actions Bar */}
        {!loading && (agents.length > 0 || folders.length > 0) && (
          <FadeInSection>
            <div className="mt-16 bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Quick Actions</h3>
                  <p className="text-gray-400 text-sm">Streamline your workflow</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <Link
                    href="/agents/new"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Plus size={16} />
                    New Agent
                  </Link>
                  <button
                    onClick={() => setShowCreateFolderModal(true)}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <FolderPlus size={16} />
                    New Folder
                  </button>
                  <Link
                    href="/agent-lab"
                    className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 text-sm transform hover:scale-105"
                  >
                    <Settings size={16} />
                    Agent Lab
                  </Link>
                </div>
              </div>
            </div>
          </FadeInSection>
        )}
      </div>
    </RequireApiKey>
  )
}