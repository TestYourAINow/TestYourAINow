'use client'

import { useState, useEffect, useRef } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { 
  User, Lock, Shield, Trash2, Save, CheckCircle, AlertCircle, 
  Camera, Upload, X, Settings, Edit, Eye, EyeOff, AlertTriangle, Database, Clock
} from "lucide-react"

// Modal Component
interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  userName?: string
  userEmail?: string
  isDeleting?: boolean
  profileImage?: string | null
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName = 'User',
  userEmail = '',
  isDeleting = false,
  profileImage = null
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-lg mx-auto">
        
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center shadow-lg">
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
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md text-white font-bold border-2 border-gray-600/50 ${
                  profileImage 
                    ? 'bg-gray-800' 
                    : 'bg-gradient-to-br from-blue-600 to-cyan-600'
                }`}>
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    userName.charAt(0).toUpperCase()
                  )}
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
                ⚠️ This action cannot be undone. All data will be lost forever.
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

// Main Component
export default function AccountSettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Profile change states
  const [isChangingName, setIsChangingName] = useState(false)
  const [newName, setNewName] = useState("")
  const [name, setName] = useState("")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Email change states
  const [isChangingEmail, setIsChangingEmail] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [confirmEmail, setConfirmEmail] = useState("")

  // Password change states
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Loading states
  const [deleting, setDeleting] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingEmail, setSavingEmail] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "")
      setProfileImage(session.user.profileImage || null)
    }
  }, [session])

  // Password validation rules
  const passwordRules = [
    { label: "Contains at least 1 lowercase letter", valid: /[a-z]/.test(newPassword) },
    { label: "Contains at least 1 uppercase letter", valid: /[A-Z]/.test(newPassword) },
    { label: "Contains at least 1 number", valid: /\d/.test(newPassword) },
    { label: "Contains at least 1 special character", valid: /[^A-Za-z0-9]/.test(newPassword) },
    { label: "Is at least 8 characters long", valid: newPassword.length >= 8 },
  ]

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5MB)")
      return
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error("Invalid file type (only JPEG, PNG, WebP)")
      return
    }

    const reader = new FileReader()
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        setPreviewImage(e.target.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleImageUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) return

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', fileInputRef.current.files[0])

      const res = await fetch('/api/account/upload-profile-image', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        setProfileImage(data.profileImage)
        setPreviewImage(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        
        window.dispatchEvent(new CustomEvent('profileImageUpdated', {
          detail: { profileImage: data.profileImage }
        }))
        
        toast.success("Profile image updated successfully!")
      } else {
        toast.error(data.error || "Failed to upload image")
      }
    } catch (error) {
      toast.error("Failed to upload image")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleImageDelete = async () => {
    setUploadingImage(true)
    try {
      const res = await fetch('/api/account/upload-profile-image', {
        method: 'DELETE'
      })

      if (res.ok) {
        setProfileImage(null)
        setPreviewImage(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        
        window.dispatchEvent(new CustomEvent('profileImageUpdated', {
          detail: { profileImage: null }
        }))
        
        toast.success("Profile image removed successfully!")
      } else {
        toast.error("Failed to remove image")
      }
    } catch (error) {
      toast.error("Failed to remove image")
    } finally {
      setUploadingImage(false)
    }
  }

  const cancelPreview = () => {
    setPreviewImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newName.trim()) {
      toast.error("Name is required.")
      return
    }

    if (newName === session?.user?.name) {
      toast.error("New name must be different from current name.")
      return
    }

    setSavingProfile(true)

    try {
      const res = await fetch("/api/account/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Profile updated successfully!")
        setIsChangingName(false)
        setNewName("")
        setName(newName) // Update local state
      } else {
        toast.error(data.error || "Something went wrong.")
      }
    } catch (error) {
      toast.error("Something went wrong.")
    } finally {
      setSavingProfile(false)
    }
  }

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newEmail || !confirmEmail) {
      toast.error("Please fill in all email fields.")
      return
    }

    if (newEmail !== confirmEmail) {
      toast.error("Email addresses don't match.")
      return
    }

    if (newEmail === session?.user?.email) {
      toast.error("New email must be different from current email.")
      return
    }

    setSavingEmail(true)

    try {
      const res = await fetch("/api/account/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      })

      const data = await res.json()

      if (data.field === "email") {
        toast.error("This email is already in use.")
        return
      }

      if (res.ok) {
        toast.success("Email updated successfully!")
        setIsChangingEmail(false)
        setNewEmail("")
        setConfirmEmail("")
      } else {
        toast.error(data.error || "Something went wrong.")
      }
    } catch (error) {
      toast.error("Something went wrong.")
    } finally {
      setSavingEmail(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match.")
      return
    }

    const validations = passwordRules.map((r) => r.valid)
    if (!validations.every(Boolean)) {
      toast.error("New password doesn't meet requirements.")
      return
    }

    setSavingPassword(true)

    try {
      const res = await fetch("/api/account/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          currentPassword, 
          password: newPassword 
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Password updated successfully!")
        setIsChangingPassword(false)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast.error(data.error || "Something went wrong.")
      }
    } catch (error) {
      toast.error("Something went wrong.")
    } finally {
      setSavingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)

    try {
      const res = await fetch("/api/account/delete", {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("Your account was deleted. Redirecting…")
        await new Promise((r) => setTimeout(r, 2000))
        await signOut({ redirect: false })
        router.push("/")
      } else {
        toast.error("Failed to delete account.")
      }
    } catch (error) {
      toast.error("Failed to delete account.")
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (session?.user?.name) {
      return session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return 'U'
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/20">
                  <User className="text-white" size={28} />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                  <Settings className="text-white" size={12} />
                </div>
              </div>
              
              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-2">
                  Account Settings
                </h1>
                <p className="text-gray-400 text-lg">
                  Manage your account information and security settings
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Main Settings Panel */}
            <div>
              <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6 space-y-6">
                
                {/* Profile Photo Section */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Camera className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">Profile Photo</h3>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className={`w-24 h-24 rounded-full overflow-hidden flex items-center justify-center border-4 border-gray-600/50 shadow-xl ${
                        previewImage || profileImage 
                          ? 'bg-gray-800' 
                          : 'bg-gradient-to-br from-blue-600 to-cyan-600'
                      }`}>
                        {previewImage ? (
                          <img 
                            src={previewImage} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : profileImage ? (
                          <img 
                            src={profileImage} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-semibold text-4xl">
                            {getUserInitials()}
                          </span>
                        )}
                      </div>
                      
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      {previewImage ? (
                        <div className="flex gap-3">
                          <button
                            onClick={handleImageUpload}
                            disabled={uploadingImage}
                            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-xl transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl hover:shadow-blue-500/20 disabled:opacity-50"
                          >
                            <Upload size={16} />
                            {uploadingImage ? "Uploading..." : "Upload"}
                          </button>
                          <button
                            onClick={cancelPreview}
                            disabled={uploadingImage}
                            className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 disabled:bg-gray-800/30 text-white rounded-xl transition-all duration-300 text-sm font-semibold border border-gray-700/50 hover:border-gray-600/50 disabled:opacity-50"
                          >
                            <X size={16} />
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingImage}
                            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-xl transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl hover:shadow-blue-500/20 disabled:opacity-50"
                          >
                            <Upload size={16} />
                            Choose Photo
                          </button>
                          
                          {profileImage && (
                            <button
                              onClick={handleImageDelete}
                              disabled={uploadingImage}
                              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-xl transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl hover:shadow-red-500/20 disabled:opacity-50"
                            >
                              <Trash2 size={16} />
                              Remove
                            </button>
                          )}
                        </div>
                      )}
                      
                      <p className="text-gray-400 text-xs">
                        Max 5MB • JPEG, PNG, WebP formats supported
                      </p>
                    </div>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>

                {/* Profile Information Section */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <User className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">Profile Information</h3>
                  </div>

                  {!isChangingName ? (
                    <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-700/30">
                      <div>
                        <p className="text-white font-medium">{session?.user?.name || name}</p>
                        <p className="text-gray-400 text-sm">Your display name</p>
                      </div>
                      <button
                        onClick={() => setIsChangingName(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg transition-all duration-300 text-sm font-semibold"
                      >
                        <Edit size={14} />
                        Change
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          New Display Name
                        </label>
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm placeholder-gray-400"
                          placeholder="Enter new display name"
                        />
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={savingProfile}
                          className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:from-gray-700 disabled:to-gray-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {savingProfile ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Save size={16} />
                              Update Name
                            </>
                          )}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setIsChangingName(false)
                            setNewName("")
                          }}
                          disabled={savingProfile}
                          className="px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 disabled:bg-gray-800/30 text-white rounded-xl transition-all duration-300 font-semibold border border-gray-700/50 hover:border-gray-600/50 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Email Section */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <User className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">Email Address</h3>
                  </div>

                  {!isChangingEmail ? (
                    <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-700/30">
                      <div>
                        <p className="text-white font-medium">{session?.user?.email}</p>
                        <p className="text-gray-400 text-sm">Your current email address</p>
                      </div>
                      <button
                        onClick={() => setIsChangingEmail(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg transition-all duration-300 text-sm font-semibold"
                      >
                        <Edit size={14} />
                        Change
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleEmailUpdate} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          New Email Address
                        </label>
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm placeholder-gray-400"
                          placeholder="Enter new email address"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Confirm New Email
                        </label>
                        <input
                          type="email"
                          value={confirmEmail}
                          onChange={(e) => setConfirmEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm placeholder-gray-400"
                          placeholder="Confirm new email address"
                        />
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={savingEmail}
                          className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:from-gray-700 disabled:to-gray-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {savingEmail ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Save size={16} />
                              Update Email
                            </>
                          )}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setIsChangingEmail(false)
                            setNewEmail("")
                            setConfirmEmail("")
                          }}
                          disabled={savingEmail}
                          className="px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 disabled:bg-gray-800/30 text-white rounded-xl transition-all duration-300 font-semibold border border-gray-700/50 hover:border-gray-600/50 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Password Section */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Lock className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">Password</h3>
                  </div>

                  {!isChangingPassword ? (
                    <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-700/30">
                      <div>
                        <p className="text-white font-medium">••••••••••••</p>
                        <p className="text-gray-400 text-sm">Your password is secure</p>
                      </div>
                      <button
                        onClick={() => setIsChangingPassword(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg transition-all duration-300 text-sm font-semibold"
                      >
                        <Edit size={14} />
                        Change
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-3 pr-12 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm placeholder-gray-400"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                          >
                            {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 pr-12 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm placeholder-gray-400"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                          >
                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 pr-12 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm placeholder-gray-400"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Password Requirements */}
                      {newPassword && (
                        <div className="p-4 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl">
                          <div className="flex items-center gap-2 mb-3">
                            <Shield className="text-blue-400" size={16} />
                            <span className="text-sm font-medium bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">Password Requirements</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {passwordRules.map((rule, idx) => (
                              <div key={idx} className={`flex items-center gap-2 text-sm p-2 rounded-lg transition-all ${rule.valid ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-gray-800/30 border border-gray-700/30'}`}>
                                {rule.valid ? (
                                  <CheckCircle className="text-emerald-400 flex-shrink-0" size={16} />
                                ) : (
                                  <AlertCircle className="text-gray-500 flex-shrink-0" size={16} />
                                )}
                                <span className={rule.valid ? "text-emerald-300" : "text-gray-500"}>
                                  {rule.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={savingPassword}
                          className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:from-gray-700 disabled:to-gray-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {savingPassword ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Save size={16} />
                              Update Password
                            </>
                          )}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setIsChangingPassword(false)
                            setCurrentPassword("")
                            setNewPassword("")
                            setConfirmPassword("")
                          }}
                          disabled={savingPassword}
                          className="px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 disabled:bg-gray-800/30 text-white rounded-xl transition-all duration-300 font-semibold border border-gray-700/50 hover:border-gray-600/50 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Delete Account Section */}
                <div className="bg-red-900/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Trash2 className="text-red-400" size={20} />
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-red-200 to-pink-200 bg-clip-text text-transparent">Danger Zone</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-red-950/30 rounded-xl border border-red-500/20">
                      <h4 className="text-red-200 font-semibold mb-2">Delete Account</h4>
                      <p className="text-red-300/80 text-sm mb-4">
                        Once you delete your account, there is no going back. This will permanently delete your account and remove your data from our servers.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        disabled={deleting}
                        className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-gray-700 disabled:to-gray-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-500/20 transform hover:scale-105 disabled:transform-none disabled:opacity-50 flex items-center gap-3"
                      >
                        <Trash2 size={16} />
                        Delete My Account
                      </button>
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-gradient-to-r from-blue-500/10 via-cyan-500/5 to-blue-500/10 border border-blue-500/20 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Shield className="text-blue-400" size={16} />
                    </div>
                    <div>
                      <p className="text-blue-200/90 text-sm font-medium">Enterprise Security</p>
                      <p className="text-blue-100/70 text-xs">Your account is secured with enterprise-grade encryption and advanced security protocols.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        userName={session?.user?.name || name}
        userEmail={session?.user?.email || ''}
        isDeleting={deleting}
        profileImage={profileImage}
      />
    </>
  )
}