import React from 'react'
import { AlertTriangle, X, Trash2, Shield, User, Database, Clock } from 'lucide-react'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  userName?: string
  userEmail?: string
  isDeleting?: boolean
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName = 'User',
  userEmail = '',
  isDeleting = false
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-lg mx-auto">
        
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center border-4 border-gray-600/50 shadow-x">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Delete Account
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">This action is permanent and irreversible</p>
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
              Are you absolutely sure you want to delete your account?
            </p>
            
            {/* Account Info Card */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-md text-white font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{userName}</p>
                  <p className="text-sm text-gray-400 truncate">{userEmail}</p>
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
                <User className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-300 text-sm font-medium">Personal Data</p>
                  <p className="text-red-300/80 text-xs">Your profile, settings, and preferences will be <strong className="text-red-200">permanently deleted</strong></p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Database className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-300 text-sm font-medium">All Data & Content</p>
                  <p className="text-red-300/80 text-xs">AI agents, integrations, conversations, and files will be <strong className="text-red-200">completely removed</strong></p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-300 text-sm font-medium">Immediate Effect</p>
                  <p className="text-red-300/80 text-xs">You will be <strong className="text-red-200">immediately signed out</strong> and lose access to all services</p>
                </div>
              </div>
            </div>
            
            {/* Final Warning */}
            <div className="mt-4 p-3 bg-red-950/50 border border-red-500/40 rounded-lg">
              <p className="text-red-200 text-center text-sm font-bold">
                This action cannot be undone. All data will be lost forever.
              </p>
            </div>
          </div>

          {/* Type Confirmation */}
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/40 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-gray-300 text-sm">
                  <strong className="text-yellow-400">Note:</strong> If you're having issues with your account, consider contacting support instead of deleting your account.
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
              Keep My Account
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-red-600/50 disabled:to-red-500/50 text-white px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:shadow-red-500/20 transform hover:scale-105 relative overflow-hidden group"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10"></div>
                  <span className="relative z-10">Deleting Account...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Delete Forever</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}