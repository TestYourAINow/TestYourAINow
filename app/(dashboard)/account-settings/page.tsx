'use client'

import { useState, useEffect, useRef } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import clsx from "clsx"
import { toast } from "sonner"
import { User, Mail, Lock, Shield, Trash2, Save, CheckCircle, AlertCircle, Camera, Upload, X } from "lucide-react"

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
    <div className="min-h-screen bg-transparent">
      <div className="flex justify-center min-h-screen py-6">
        <div className="w-full max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-white mb-2">
              Account Settings
            </h1>
            <p className="text-sm text-gray-400">
              Manage your account information and security settings
            </p>
          </div>

          <div style={{ display: 'flex', height: 'calc(100vh - 180px)', gap: '24px' }}>
            {/* Main Settings Panel */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl text-white overflow-hidden flex-1">
              <div className="p-6 space-y-6">
                
                {/* Profile Photo Section */}
                <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Camera className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold text-blue-200">Profile Photo</h3>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    {/* Current/Preview Image */}
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center border-2 border-gray-500">
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
                          <User className="text-gray-400" size={32} />
                        )}
                      </div>
                      
                      {/* Upload indicator */}
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="flex-1 space-y-3">
                      {previewImage ? (
                        <div className="flex gap-3">
                          <button
                            onClick={handleImageUpload}
                            disabled={uploadingImage}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-700 disabled:opacity-75 text-white rounded-lg transition-all duration-200 text-sm font-medium"
                          >
                            <Upload size={16} />
                            {uploadingImage ? "Uploading..." : "Upload"}
                          </button>
                          <button
                            onClick={cancelPreview}
                            disabled={uploadingImage}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 disabled:opacity-75 text-white rounded-lg transition-all duration-200 text-sm font-medium"
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
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-700 disabled:opacity-75 text-white rounded-lg transition-all duration-200 text-sm font-medium"
                          >
                            <Upload size={16} />
                            Choose Photo
                          </button>
                          
                          {profileImage && (
                            <button
                              onClick={handleImageDelete}
                              disabled={uploadingImage}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-700 disabled:opacity-75 text-white rounded-lg transition-all duration-200 text-sm font-medium"
                            >
                              <Trash2 size={16} />
                              Remove
                            </button>
                          )}
                        </div>
                      )}
                      
                      <p className="text-gray-400 text-xs">
                        Max 5MB • JPEG, PNG, WebP
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

                {/* Profile Information Section */}
                <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <User className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold text-blue-200">Profile Information</h3>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150 placeholder-gray-400"
                        placeholder="Enter your name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150 placeholder-gray-400"
                        placeholder="Enter your email"
                      />
                    </div>
                  </form>
                </div>

                {/* Security Section */}
                <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Lock className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold text-blue-200">Security</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      New Password (optional)
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150 placeholder-gray-400"
                      placeholder="Enter new password"
                    />
                  </div>

                  {/* Password Requirements */}
                  {password && (
                    <div className="mt-4 p-4 bg-gray-800/50 border border-gray-600 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="text-blue-400" size={16} />
                        <span className="text-sm font-medium text-blue-200">Password Requirements</span>
                      </div>
                      <ul className="space-y-2">
                        {rules.map((rule, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            {rule.valid ? (
                              <CheckCircle className="text-green-400" size={16} />
                            ) : (
                              <AlertCircle className="text-gray-500" size={16} />
                            )}
                            <span className={rule.valid ? "text-green-400" : "text-gray-500"}>
                              {rule.label}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 pt-4">
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={saving}
                    className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-green-700 disabled:bg-green-700 disabled:opacity-75 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="w-full bg-red-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-red-700 disabled:bg-red-700 disabled:opacity-75 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    {deleting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Deleting Account...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5" />
                        Delete My Account
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Account Info Panel */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl shadow-2xl text-white w-80">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <User className="text-blue-400" size={20} />
                  <h3 className="text-lg font-semibold text-blue-200">Account Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden text-white font-bold text-lg border-2 border-gray-500/50 ${profileImage ? '' : 'bg-blue-600'}`}>
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
                      <div>
                        <p className="text-white font-medium">{session?.user?.name || 'User'}</p>
                        <p className="text-gray-400 text-sm">{session?.user?.email || 'No email'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>Account Status:</span>
                      <span className="text-green-400 font-medium">Active</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Member Since:</span>
                      <span className="text-white">
                        {session?.user ? new Date().getFullYear() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Last Login:</span>
                      <span className="text-white">Today</span>
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="text-yellow-400" size={16} />
                      <span className="text-yellow-200 text-sm font-medium">Security Tip</span>
                    </div>
                    <p className="text-yellow-100 text-xs">
                      Use a strong password with a mix of letters, numbers, and special characters to keep your account secure.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}