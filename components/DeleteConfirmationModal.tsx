import React from 'react'
import { AlertTriangle, X, Trash2, Shield } from 'lucide-react'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  connectionName: string
  integrationType: string
  isDeleting?: boolean
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  connectionName,
  integrationType,
  isDeleting = false
}) => {
  if (!isOpen) return null

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

  const getIntegrationIcon = (type: string) => {
    // You can customize icons based on integration type
    return <Trash2 className="w-4 h-4 text-red-400" />
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md mx-auto">
        
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Confirm Deletion
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

        {/* Enhanced Content */}
        <div className="p-6 space-y-6">
          
          {/* Question Section */}
          <div>
            <p className="text-gray-300 text-base font-medium mb-4">
              Are you sure you want to delete this connection?
            </p>
            
            {/* Connection Info Card */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center shadow-md">
                  {getIntegrationIcon(integrationType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{connectionName}</p>
                  <p className="text-sm text-gray-400">{getIntegrationDisplayName(integrationType)}</p>
                </div>
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Enhanced Warning Section */}
          <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-red-400" />
              <h4 className="text-red-200 font-bold">Critical Warning</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-red-300 text-sm">
                  This action is <strong className="text-red-200">completely irreversible</strong>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-red-300 text-sm">
                  The integration will be <strong className="text-red-200">immediately disabled</strong> on all connected platforms
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-red-300 text-sm">
                  All configuration data will be <strong className="text-red-200">permanently lost</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Actions */}
          <div className="flex gap-3 pt-2">
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
              className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-red-600/50 disabled:to-red-500/50 text-white px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:shadow-red-500/20 transform hover:scale-105 relative overflow-hidden"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Permanently</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}