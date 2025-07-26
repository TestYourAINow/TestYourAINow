'use client'

import { useState, useEffect, useRef } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { 
  User, Lock, Shield, Trash2, Save, CheckCircle, AlertCircle, 
  Camera, Upload, X, Settings, Crown, Zap, Activity, Clock
} from "lucide-react"

export default function AccountSettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "")
      setEmail(session.user.email || "")
      setProfileImage(session.user.profileImage || null)
    }
  }, [session])

  const rules = [
    { label: "Contains at least 1 lowercase letter", valid: /[a-z]/.test(password) },
    { label: "Contains at least 1 uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "Contains at least 1 number", valid: /\d/.test(password) },
    { label: "Contains at least 1 special character", valid: /[^A-Za-z0-9]/.test(password) },
    { label: "Is at least 8 characters long", valid: password.length >= 8 },
  ]

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifications côté client
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5MB)")
      return
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error("Invalid file type (only JPEG, PNG, WebP)")
      return
    }

    // Preview
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
        
        // Déclencher un événement pour notifier les autres composants
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
        
        // Déclencher un événement pour notifier les autres composants
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email) {
      toast.error("Name and email are required.")
      return
    }

    if (password) {
      const validations = rules.map((r) => r.valid)
      if (!validations.every(Boolean)) {
        toast.error("Password doesn't meet requirements.")
        return
      }
    }

    setSaving(true)

    try {
      const res = await fetch("/api/account/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (data.field === "email") {
        toast.error("This email is already in use.")
        return
      }

      if (data.field === "username") {
        toast.error("This username is already taken.")
        return
      }

      if (res.ok) {
        toast.success("Profile updated successfully!")
        setPassword("")
      } else {
        toast.error(data.error || "Something went wrong.")
      }
    } catch (error) {
      toast.error("Something went wrong.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = confirm("Are you sure you want to delete your account? This action is irreversible.")
    if (!confirmed) return

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
    }
  }

  return (
    <div className="min-h-screen bg-premium-gradient relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-600/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/20">
                  <User className="text-white" size={28} />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                  <Settings className="text-white" size={12} />
                </div>
              </div>
              
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-2">
                  Account Settings
                </h1>
                <p className="text-gray-400 text-lg">
                  Manage your account information and security settings
                </p>
              </div>
            </div>
            
            {/* Account Status Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl backdrop-blur-sm">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400 font-medium">Active</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Settings Panel */}
          <div className="xl:col-span-2">
            <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6 space-y-6">
              
              {/* Profile Photo Section - Enhanced */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Camera className="text-purple-400" size={20} />
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">Profile Photo</h3>
                </div>
                
                <div className="flex items-center gap-6">
                  {/* Enhanced Current/Preview Image */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border-2 border-gray-600/50 shadow-xl">
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
                        <User className="text-gray-400" size={36} />
                      )}
                    </div>
                    
                    {/* Enhanced Upload indicator */}
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Enhanced Controls */}
                  <div className="flex-1 space-y-3">
                    {previewImage ? (
                      <div className="flex gap-3">
                        <button
                          onClick={handleImageUpload}
                          disabled={uploadingImage}
                          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-xl transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 disabled:opacity-50"
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
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              {/* Profile Information Section - Enhanced */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <User className="text-blue-400" size={20} />
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">Profile Information</h3>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm placeholder-gray-400 font-medium"
                      placeholder="Enter your display name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm placeholder-gray-400 font-medium"
                      placeholder="Enter your email address"
                    />
                  </div>
                </form>
              </div>

              {/* Security Section - Enhanced */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="text-orange-400" size={20} />
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-orange-200 to-yellow-200 bg-clip-text text-transparent">Security Settings</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    New Password (optional)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 transition-all backdrop-blur-sm placeholder-gray-400 font-medium"
                    placeholder="Enter new password to change it"
                  />
                </div>

                {/* Enhanced Password Requirements */}
                {password && (
                  <div className="mt-4 p-4 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="text-orange-400" size={16} />
                      <span className="text-sm font-medium bg-gradient-to-r from-orange-200 to-yellow-200 bg-clip-text text-transparent">Password Requirements</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {rules.map((rule, idx) => (
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
              </div>

              {/* Enhanced Action Buttons */}
              <div className="space-y-4 pt-4">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 transform hover:scale-105 disabled:transform-none disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10" />
                      <span className="relative z-10">Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">Save Changes</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-gray-700 disabled:to-gray-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-500/20 transform hover:scale-105 disabled:transform-none disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  {deleting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10" />
                      <span className="relative z-10">Deleting Account...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">Delete My Account</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Sidebar Information */}
          <div className="space-y-6">
            {/* Enhanced Account Overview */}
            <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Crown className="text-yellow-400" size={20} />
                <h3 className="text-lg font-semibold bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">Account Overview</h3>
              </div>
              
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden text-white font-bold text-xl border-2 border-gray-600/50 shadow-xl ${profileImage ? '' : 'bg-gradient-to-br from-blue-600 to-cyan-600'}`}>
                      {profileImage ? (
                        <img 
                          src={profileImage} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        session?.user?.name?.charAt(0).toUpperCase() || "U"
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-gray-900 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-lg">{session?.user?.name || 'User'}</p>
                    <p className="text-gray-400 text-sm">{session?.user?.email || 'No email'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-emerald-400 text-xs font-medium">Online Now</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700/30">
                  <div className="text-gray-400 text-xs mb-1">Status</div>
                  <div className="text-emerald-400 font-semibold flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                    Active
                  </div>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700/30">
                  <div className="text-gray-400 text-xs mb-1">Member Since</div>
                  <div className="text-white font-semibold">{new Date().getFullYear()}</div>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700/30">
                  <div className="text-gray-400 text-xs mb-1">Last Login</div>
                  <div className="text-white font-semibold">Today</div>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700/30">
                  <div className="text-gray-400 text-xs mb-1">Plan</div>
                  <div className="text-yellow-400 font-semibold flex items-center gap-1">
                    <Crown size={12} />
                    Creator
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Security Status */}
            <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="text-emerald-400" size={20} />
                <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-200 to-green-200 bg-clip-text text-transparent">Security Status</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-emerald-400" size={16} />
                    <span className="text-sm text-emerald-200 font-medium">Email verified</span>
                  </div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-emerald-400" size={16} />
                    <span className="text-sm text-emerald-200 font-medium">Strong password</span>
                  </div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-emerald-400" size={16} />
                    <span className="text-sm text-emerald-200 font-medium">Account secured</span>
                  </div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl p-4 mt-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="text-emerald-400" size={16} />
                  <span className="text-emerald-200 text-sm font-semibold">Account Protected</span>
                </div>
                <p className="text-emerald-100/80 text-xs leading-relaxed">
                  Your account is secured with industry-standard encryption and security measures.
                </p>
              </div>
            </div>

            {/* Enhanced Activity Stats */}
            <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="text-cyan-400" size={20} />
                <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">Activity Overview</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                      <Zap className="text-white" size={14} />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Sessions Today</p>
                      <p className="text-gray-400 text-xs">Active usage</p>
                    </div>
                  </div>
                  <div className="text-blue-400 font-bold">3</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-green-600 rounded-lg flex items-center justify-center">
                      <CheckCircle className="text-white" size={14} />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Tasks Completed</p>
                      <p className="text-gray-400 text-xs">This week</p>
                    </div>
                  </div>
                  <div className="text-emerald-400 font-bold">12</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                      <Clock className="text-white" size={14} />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Time Saved</p>
                      <p className="text-gray-400 text-xs">This month</p>
                    </div>
                  </div>
                  <div className="text-purple-400 font-bold">24h</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4 mt-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="text-blue-400" size={16} />
                  <span className="text-blue-200 text-sm font-semibold">Great Progress!</span>
                </div>
                <p className="text-blue-100/80 text-xs leading-relaxed">
                  You're actively using the platform and making great progress on your goals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Custom Styles */}
      <style jsx>{`
        .bg-grid {
          background-image: 
            linear-gradient(to right, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </div>
  )
}