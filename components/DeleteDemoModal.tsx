import React from 'react'
import { AlertTriangle, X, Trash2, Bot } from 'lucide-react'

interface DeleteDemoModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  demoName: string
  isDeleting?: boolean
}

export const DeleteDemoModal: React.FC<DeleteDemoModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  demoName,
  isDeleting = false
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center shadow-lg">
              <AlertTriangle className="text-red-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Delete Demo
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200 group disabled:opacity-50"
          >
            <X size={20} className="relative z-10" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-300 mb-4 leading-relaxed">
              Are you sure you want to delete this demo? This action is permanent and cannot be reversed.
            </p>
            
            {/* Demo Info Card */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{demoName}</p>
                  <p className="text-sm text-gray-400">Demo Agent</p>
                </div>
              </div>
            </div>
          </div>

          {/* Warning Section */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <h4 className="text-red-200 font-semibold mb-3">⚠️ Warning</h4>
            <ul className="text-sm text-red-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                <span>This action is <strong className="text-red-200">irreversible</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                <span>The shared demo link will no longer work</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                <span>All demo configuration will be permanently lost</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-700/50">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-3.5 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-xl font-semibold transition-all backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-3.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-500/20 transform hover:scale-105 relative overflow-hidden disabled:opacity-50 disabled:transform-none group"
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              <div className="relative z-10 flex items-center justify-center gap-2">
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Demo
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}