// components\CreateFolderModal.tsx

"use client"

import { useState } from "react"
import { X, Folder } from "lucide-react"

interface CreateFolderModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (folderData: { name: string; description: string; color: string }) => void
}

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

export default function CreateFolderModal({ isOpen, onClose, onCreate }: CreateFolderModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0]) // Blue par défaut pour cohérence
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) return

    setIsSubmitting(true)
    
    try {
      await onCreate({
        name: name.trim(),
        description: description.trim(),
        color: selectedColor
      })
      
      // Reset form
      setName("")
      setDescription("")
      setSelectedColor(FOLDER_COLORS[0])
      onClose()
    } catch (error) {
      console.error('Error creating folder:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md mx-auto">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300"
              style={{ 
                backgroundColor: selectedColor + '20', 
                border: `2px solid ${selectedColor}40`,
                boxShadow: `0 4px 20px ${selectedColor}20`
              }}
            >
              <Folder className="w-6 h-6 transition-colors duration-300" style={{ color: selectedColor }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Create New Folder
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">Organize your AI agents with a dedicated folder</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200 group disabled:opacity-50"
          >
            <X size={20} className="relative z-10" />
          </button>
        </div>

        {/* Enhanced Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Enhanced Folder Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white">
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
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Choose a descriptive name</span>
              <span className="text-xs text-gray-500">{name.length}/50</span>
            </div>
          </div>

          {/* Enhanced Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white">
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
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Optional but recommended</span>
              <span className="text-xs text-gray-500">{description.length}/200</span>
            </div>
          </div>

          {/* Enhanced Folder Color */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-white">
              Folder Color
            </label>
            <div className="flex gap-3 flex-wrap">
              {FOLDER_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-12 h-12 rounded-xl transition-all duration-300 group relative ${
                    selectedColor === color
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110 shadow-lg'
                      : 'hover:scale-105 shadow-md'
                  }`}
                  style={{ 
                    backgroundColor: color,
                    boxShadow: selectedColor === color ? `0 0 20px ${color}40` : `0 4px 8px ${color}20`
                  }}
                >
                  {selectedColor === color && (
                    <div className="absolute inset-0 rounded-xl bg-white/20 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">Choose a color to help identify your folder</p>
          </div>

          {/* Enhanced Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-700/50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3.5 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-xl font-semibold transition-all backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="flex-1 px-4 py-3.5 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 transform hover:scale-105 relative overflow-hidden"
              style={{
                background: !name.trim() || isSubmitting 
                  ? 'linear-gradient(135deg, #374151, #4b5563)' 
                  : `linear-gradient(135deg, ${selectedColor}, ${selectedColor}CC)`,
                boxShadow: !name.trim() || isSubmitting 
                  ? 'none' 
                  : `0 4px 20px ${selectedColor}30`
              }}
            >
              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Folder size={16} />
                  Create Folder
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}