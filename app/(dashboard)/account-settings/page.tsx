'use client'

import { useState, useEffect, useRef } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  User, Lock, Shield, Trash2, Save, CheckCircle, AlertCircle,
  Camera, Upload, X, Edit, Eye, EyeOff, Mail, KeyRound
} from "lucide-react"
import { DeleteAccountModal } from "@/components/DeleteAccountModal"

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

  // Hydration fix
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    if (session?.user) {
      setName(session.user.name || "")
      setProfileImage(session.user.profileImage || null)
    }
  }, [session])

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

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

        setTimeout(() => {
          window.location.reload()
        }, 500) // Délai pour que l'utilisateur voit le toast

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

        // Recharger pour voir le nouvel email
        setTimeout(() => {
          window.location.reload()
        }, 500)
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
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">

          {/* Profile Header Card */}
          <div className="mb-8 bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center gap-6">

              {/* Avatar Section */}
              <div className="relative group">
                <div className={`w-32 h-32 rounded-full overflow-hidden flex items-center justify-center border-4 border-gray-600/30 shadow-2xl transition-all duration-300 group-hover:scale-105 ${previewImage || profileImage
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
                    <span className="text-white font-bold text-5xl">
                      {getUserInitials()}
                    </span>
                  )}
                </div>

                {/* Edit overlay */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center text-white"
                >
                  <Camera size={24} />
                </button>

                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/80 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-2">
                  {session?.user?.name || name || "User"}
                </h1>
                <p className="text-gray-400 text-lg mb-4">{session?.user?.email}</p>

                {/* Photo Actions */}
                <div className="flex gap-3 justify-center md:justify-start">
                  {previewImage ? (
                    <>
                      <button
                        onClick={handleImageUpload}
                        disabled={uploadingImage}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/25"
                      >
                        <Upload size={16} className="inline mr-2" />
                        Save Photo
                      </button>
                      <button
                        onClick={cancelPreview}
                        className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl font-medium transition-all duration-300"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    profileImage && (
                      <button
                        onClick={handleImageDelete}
                        disabled={uploadingImage}
                        className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-500/25"
                      >
                        <Trash2 size={16} className="inline mr-2" />
                        Remove Photo
                      </button>
                    )
                  )}
                </div>
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

          {/* Settings Grid */}
          <div className="grid gap-8">

            {/* Personal Information */}
            <div className="group">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                  <User className="text-white" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-white">Personal Information</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">

                {/* Display Name */}
                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/50 transition-all duration-300">
                  {!isChangingName ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="text-blue-400" size={16} />
                          <span className="text-sm font-medium text-gray-400">Display Name</span>
                        </div>
                        <p className="text-xl font-semibold text-white">{session?.user?.name || name}</p>
                      </div>
                      <button
                        onClick={() => setIsChangingName(true)}
                        className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all duration-300 text-sm font-medium"
                      >
                        <Edit size={14} className="inline mr-1" />
                        Edit
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">New Display Name</label>
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 text-white rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          placeholder="Enter new display name"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={savingProfile}
                          className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          {savingProfile ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Save size={16} />
                          )}
                          Save
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsChangingName(false)
                            setNewName("")
                          }}
                          className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl font-medium transition-all duration-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Email */}
                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/50 transition-all duration-300">
                  {!isChangingEmail ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="text-blue-400" size={16} />
                          <span className="text-sm font-medium text-gray-400">Email Address</span>
                        </div>
                        <p className="text-xl font-semibold text-white">{session?.user?.email}</p>
                      </div>
                      <button
                        onClick={() => setIsChangingEmail(true)}
                        className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all duration-300 text-sm font-medium"
                      >
                        <Edit size={14} className="inline mr-1" />
                        Edit
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleEmailUpdate} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">New Email</label>
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 text-white rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Email</label>
                        <input
                          type="email"
                          value={confirmEmail}
                          onChange={(e) => setConfirmEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 text-white rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={savingEmail}
                          className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          {savingEmail ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Save size={16} />
                          )}
                          Save
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsChangingEmail(false)
                            setNewEmail("")
                            setConfirmEmail("")
                          }}
                          className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl font-medium transition-all duration-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="group">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Shield className="text-white" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-white">Security</h2>
              </div>

              {/* Password */}
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/50 transition-all duration-300">
                {!isChangingPassword ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <KeyRound className="text-purple-400" size={16} />
                        <span className="text-sm font-medium text-gray-400">Password</span>
                      </div>
                      <p className="text-xl font-semibold text-white">••••••••••••</p>
                      <p className="text-sm text-gray-500 mt-1">Last updated 30 days ago</p>
                    </div>
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-all duration-300 text-sm font-medium"
                    >
                      <Edit size={14} className="inline mr-1" />
                      Change
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-12 bg-gray-800/50 border border-gray-600/50 text-white rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
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
                      <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-12 bg-gray-800/50 border border-gray-600/50 text-white rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
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
                      <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-12 bg-gray-800/50 border border-gray-600/50 text-white rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
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
                      <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
                        <div className="grid grid-cols-1 gap-2">
                          {passwordRules.map((rule, idx) => (
                            <div key={idx} className={`flex items-center gap-2 text-sm transition-all ${rule.valid ? 'text-emerald-400' : 'text-gray-500'}`}>
                              {rule.valid ? (
                                <CheckCircle size={14} />
                              ) : (
                                <AlertCircle size={14} />
                              )}
                              <span>{rule.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={savingPassword}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        {savingPassword ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Save size={16} />
                        )}
                        Update Password
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsChangingPassword(false)
                          setCurrentPassword("")
                          setNewPassword("")
                          setConfirmPassword("")
                        }}
                        className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl font-medium transition-all duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="group">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl flex items-center justify-center">
                  <AlertCircle className="text-white" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-white">Danger Zone</h2>
              </div>

              <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 hover:border-red-500/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Trash2 className="text-red-400" size={20} />
                      <h3 className="text-xl font-bold text-red-200">Delete Account</h3>
                    </div>
                    <p className="text-red-300/80 mb-2">
                      Permanently delete your account and all associated data
                    </p>
                    <p className="text-red-400/70 text-sm">
                      ⚠️ This action cannot be undone
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    disabled={deleting}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-500/25 transform hover:scale-105 flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete Account
                  </button>
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