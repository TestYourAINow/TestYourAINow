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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-600 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Delete Demo</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-300 mb-3">
              Are you sure you want to delete this demo?
            </p>
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{demoName}</p>
                  <p className="text-sm text-gray-400">Demo Agent</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4 mb-6">
            <h4 className="text-red-200 font-medium mb-2">⚠️ Warning</h4>
            <ul className="text-sm text-red-300 space-y-1">
              <li>• This action is <strong>irreversible</strong></li>
              <li>• The shared demo link will no longer work</li>
              <li>• All demo configuration will be permanently lost</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700 disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
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
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}