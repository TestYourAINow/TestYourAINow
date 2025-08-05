'use client'

import Link from "next/link"
import {
  Bot,
  Brain,
  FlaskConical,
  Rocket,
  Key,
  PlayCircle,
  HelpCircle,
  Settings,
  CreditCard,
  LogOut,
  BarChart3,
  X,
  ChevronLeft
} from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const MobileMenuUserDropdown = () => {
  const { data: session, update } = useSession()
  const [localProfileImage, setLocalProfileImage] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    setLocalProfileImage(session?.user?.profileImage || null)
  }, [session?.user?.profileImage])

  const refreshSession = async () => {
    await update()
  }

  useEffect(() => {
    const handleAvatarUpdate = (event: CustomEvent) => {
      setLocalProfileImage(event.detail.profileImage)
      refreshSession()
    }

    window.addEventListener('profileImageUpdated', handleAvatarUpdate as EventListener)
    
    return () => {
      window.removeEventListener('profileImageUpdated', handleAvatarUpdate as EventListener)
    }
  }, [])

  const userInitial = session?.user?.name?.charAt(0).toUpperCase() || "U"

  return (
    <div className="relative group" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center h-12 px-3 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800/60 transition-all duration-300 relative group border border-transparent hover:border-gray-700/50"
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 transition-all duration-300 pointer-events-none"></div>
        
        <div className="absolute right-3 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-blue-400/50 group-hover:shadow-md"></div>
        
        <div className={`w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden border-2 border-gray-600/50 group-hover:border-blue-400/50 transition-all duration-300 shadow-lg ${localProfileImage ? '' : 'bg-gradient-to-r from-blue-600 to-cyan-600'}`}>
          {localProfileImage ? (
            <img 
              src={localProfileImage} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            userInitial
          )}
        </div>
        
        <div className="ml-3 flex items-center gap-3 flex-1">
          <span className="flex-1 text-sm font-semibold truncate whitespace-nowrap group-hover:text-white transition-colors duration-300">
            {session?.user?.name || 'User'}
          </span>
          <ChevronLeft
            className={`w-4 h-4 transition-all duration-300 text-blue-400 group-hover:text-cyan-400 ${isOpen ? "rotate-90" : "-rotate-90"}`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 bottom-full mb-2 left-0 w-full rounded-xl shadow-2xl text-sm border bg-gray-900/95 backdrop-blur-xl border-gray-700/50 py-2 overflow-hidden">
          
          <div className="px-4 py-3 border-b border-gray-700/50 mb-2">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden border-2 border-gray-600/50 ${localProfileImage ? '' : 'bg-gradient-to-r from-blue-600 to-cyan-600'} shadow-lg`}>
                {localProfileImage ? (
                  <img 
                    src={localProfileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  userInitial
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-gray-400 text-xs truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>
          </div>

          {session?.user?.isSubscribed && (
            <Link
              href="/account-settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800/50 transition-all duration-200 text-gray-300 hover:text-white mx-2 rounded-lg group min-h-[44px]"
            >
              <Settings className="w-4 h-4 text-blue-400 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
              <span className="font-medium">Account Settings</span>
            </Link>
          )}

          {session?.user?.stripeCustomerId && (
            <Link
              href="/billing"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800/50 transition-all duration-200 text-gray-300 hover:text-white mx-2 rounded-lg group min-h-[44px]"
            >
              <CreditCard className="w-4 h-4 text-blue-400 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
              <span className="font-medium">Billing</span>
            </Link>
          )}

          <div className="border-t border-gray-700/50 my-2 mx-2" />

          <button
            onClick={() => {
              setIsOpen(false)
              signOut()
            }}
            className="flex items-center gap-3 px-4 py-3 hover:bg-red-900/20 hover:text-red-300 transition-all duration-200 text-red-400 mx-2 rounded-lg w-full text-left group min-h-[44px]"
          >
            <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform flex-shrink-0" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname()

  // 🔧 Empêcher le scroll du body quand le menu est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const workspaceItems = [
    { href: "/dashboard", label: "Dashboard", icon: <BarChart3 size={20} />, isActive: pathname === "/dashboard" },
    { href: "/agents", label: "My Agents", icon: <Bot size={20} />, isActive: pathname === "/agents" },
    { href: "/agent-lab", label: "Improve Agent", icon: <Brain size={20} />, isActive: pathname === "/agent-lab" },
    { href: "/demo-agent", label: "Demo Agent", icon: <FlaskConical size={20} />, isActive: pathname === "/demo-agent" },
    { href: "/launch-agent", label: "Launch Agent", icon: <Rocket size={20} />, isActive: pathname === "/launch-agent" },
  ]

  const resourceItems = [
    { href: "/api-key", label: "API Key", icon: <Key size={20} />, isActive: pathname === "/api-key" },
    { href: "/video-guides", label: "Video Guides", icon: <PlayCircle size={20} />, isActive: pathname === "/video-guides" },
    { href: "/support", label: "Support", icon: <HelpCircle size={20} />, isActive: pathname === "/support" },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* 🔧 Overlay avec espace à gauche (style YouTube) */}
      <div 
        className={`absolute inset-0 bg-black/50 transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        style={{ paddingLeft: '20%' }} // Espace à gauche de 20%
      />
      
      {/* 🔧 Menu 80% largeur - OPAQUE + Animation lente */}
      <div 
        className={`absolute top-0 bottom-0 right-0 bg-gray-900 text-white shadow-2xl transition-transform duration-500 ease-out flex flex-col border-l border-gray-700/50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '80%' }} // Menu prend 80% de la largeur
      >
        
        {/* 🔧 Header avec logo et bouton fermer - OPAQUE */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-700/50 bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              TestYour<span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">AI</span> Now
            </span>
          </div>
          
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* 🔧 Contenu scrollable avec plus d'espace */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          
          {/* WORKSPACE Section */}
          <div className="mb-8">
            <div className="px-2 py-3 text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
              <span className="bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent">WORKSPACE</span>
            </div>

            <div className="space-y-3">
              {workspaceItems.map(({ href, label, icon, isActive }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose} // 🔧 Ferme le menu lors du clic
                  className={`flex items-center h-14 px-4 rounded-xl transition-all duration-300 relative group ${
                    isActive 
                      ? 'text-white bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 shadow-lg shadow-blue-500/10' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/60 border border-transparent hover:border-gray-700/50'
                  }`}
                >
                  <div className={`absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10' 
                      : 'bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5'
                  }`}></div>
                  
                  <div className={`absolute right-4 w-2 h-2 rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'bg-blue-400 opacity-100 shadow-blue-400/50 shadow-md' 
                      : 'bg-blue-400 opacity-0 group-hover:opacity-100 shadow-blue-400/50 group-hover:shadow-md'
                  }`}></div>
                  
                  <div className={`w-6 h-6 shrink-0 transition-all duration-300 ${
                    isActive 
                      ? 'text-blue-400 scale-110' 
                      : 'text-blue-400 group-hover:text-cyan-400 group-hover:scale-110'
                  }`}>
                    {icon}
                  </div>
                  
                  <span className={`ml-4 font-semibold text-base transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                  }`}>
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* RESOURCES Section */}
          <div className="mb-8">
            <div className="px-2 py-3 text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
              <span className="bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent">RESOURCES</span>
            </div>

            <div className="space-y-3">
              {resourceItems.map(({ href, label, icon, isActive }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose} // 🔧 Ferme le menu lors du clic
                  className={`flex items-center h-14 px-4 rounded-xl transition-all duration-300 relative group ${
                    isActive 
                      ? 'text-white bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 shadow-lg shadow-blue-500/10' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/60 border border-transparent hover:border-gray-700/50'
                  }`}
                >
                  <div className={`absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10' 
                      : 'bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5'
                  }`}></div>
                  
                  <div className={`absolute right-4 w-2 h-2 rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'bg-blue-400 opacity-100 shadow-blue-400/50 shadow-md' 
                      : 'bg-blue-400 opacity-0 group-hover:opacity-100 shadow-blue-400/50 group-hover:shadow-md'
                  }`}></div>
                  
                  <div className={`w-6 h-6 shrink-0 transition-all duration-300 ${
                    isActive 
                      ? 'text-blue-400 scale-110' 
                      : 'text-blue-400 group-hover:text-cyan-400 group-hover:scale-110'
                  }`}>
                    {icon}
                  </div>
                  
                  <span className={`ml-4 font-semibold text-base transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                  }`}>
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 🔧 Footer avec user dropdown - OPAQUE */}
        <div className="border-t border-gray-700/50 p-6 bg-gray-900">
          <MobileMenuUserDropdown />
        </div>
      </div>
    </div>
  )
}