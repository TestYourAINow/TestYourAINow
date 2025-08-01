// SidebarUserDropdown Component - INCHANGÉ'use client'

import Link from "next/link"
import {
  Bot,
  Brain,
  FlaskConical,
  Rocket,
  ChevronLeft,
  Key,
  PlayCircle,
  HelpCircle,
  Settings,
  CreditCard,
  LogOut,
  BarChart3
} from "lucide-react"
import { useSidebar } from "@/context/SidebarContext"
import { useSession, signOut } from "next-auth/react"
import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { usePathname } from "next/navigation"

// 🆕 Composant Tooltip séparé qui utilise un portail
const Tooltip = ({ children, text, isVisible, buttonRef }: { 
  children: React.ReactNode
  text: string
  isVisible: boolean
  buttonRef: React.RefObject<HTMLAnchorElement | null>
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (isVisible && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        x: rect.right + 12, // 12px à droite du bouton
        y: rect.top + rect.height / 2 // centré verticalement
      })
    }
  }, [isVisible, buttonRef])

  if (!isVisible) return <>{children}</>

  return (
    <>
      {children}
      {createPortal(
        <div 
          className="fixed pointer-events-none z-[100] hidden md:block"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 text-white text-sm px-3 py-2 rounded-xl shadow-2xl whitespace-nowrap">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 border-l border-t border-gray-700/50 rotate-45"></div>
            {text}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
const SidebarUserDropdown = ({ collapsed }: { collapsed: boolean }) => {
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
        className="w-full flex items-center h-12 px-3 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800/60 transition-all duration-300 relative group backdrop-blur-sm border border-transparent hover:border-gray-700/50"
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 transition-all duration-300 pointer-events-none"></div>
        
        {!collapsed && (
          <div className="absolute right-3 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-blue-400/50 group-hover:shadow-md"></div>
        )}
        
        <div 
          className={`w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden border-2 border-gray-600/50 group-hover:border-blue-400/50 transition-all duration-300 shadow-lg ${localProfileImage ? '' : 'bg-gradient-to-r from-blue-600 to-cyan-600'}`}
          style={{ marginLeft: collapsed ? '-9px' : '-4px' }}
        >
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
        
        <div className={`ml-3 transition-all duration-300 ease-out overflow-hidden ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
          <div className="flex items-center gap-3 flex-1">
            <span className="flex-1 text-sm font-semibold truncate whitespace-nowrap group-hover:text-white transition-colors duration-300">
              {session?.user?.name || 'User'}
            </span>
            <ChevronLeft
              className={`w-4 h-4 transition-all duration-300 text-blue-400 group-hover:text-cyan-400 ${isOpen ? "rotate-90" : "-rotate-90"}`}
            />
          </div>
        </div>
      </button>

      {collapsed && (
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 hidden md:block">
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 text-white text-sm px-3 py-2 rounded-xl shadow-2xl whitespace-nowrap">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 border-l border-t border-gray-700/50 rotate-45"></div>
            {session?.user?.name || 'User'}
          </div>
        </div>
      )}

      {isOpen && (
        <div className={`absolute z-50 rounded-xl shadow-2xl text-sm border bg-gray-900/95 backdrop-blur-xl border-gray-700/50 py-2 overflow-hidden ${
          collapsed
            ? "left-full top-1/2 -translate-y-[calc(100%+12px)] ml-3 w-56"
            : "bottom-full mb-2 left-0 w-full"
        }`}>
          
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

export default function Sidebar() {
  const { collapsed, toggleSidebar } = useSidebar()
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const buttonRefs = useRef<{ [key: string]: HTMLAnchorElement | null }>({})

  const setButtonRef = (key: string) => (ref: HTMLAnchorElement | null) => {
    buttonRefs.current[key] = ref
  }

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

  return (
    <>
      {/* 🔧 SIDEBAR AVEC SCROLL - Structure modifiée */}
      <aside className={`fixed top-0 bottom-0 left-0 bg-gray-900/95 backdrop-blur-xl text-white z-50 transition-[width] duration-300 ease-out border-r border-gray-700/50 ${collapsed ? 'w-16' : 'w-72'} flex flex-col shadow-2xl`}>
        
        {/* 🔧 HEADER FIXE - reste en haut */}
        <div className="h-16 flex items-center px-4 border-b border-gray-700/50 flex-shrink-0 bg-gray-900/50 backdrop-blur-sm">
          <div className="flex items-center min-w-0 w-full">
            <Link href="/dashboard" className="shrink-0 relative group" style={{ marginLeft: '-4px' }}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-blue-500/25">
                <Bot className="w-6 h-6 text-white transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-gray-900 shadow-emerald-400/50 shadow-md animate-pulse"></div>
            </Link>
            
            <div className={`ml-3 transition-all duration-300 ease-out overflow-hidden ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
              <Link href="/dashboard" className="group">
                <span className="text-xl font-bold whitespace-nowrap bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent transition-all duration-300 group-hover:from-blue-400 group-hover:to-cyan-400">
                  TestYour<span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">AI</span> Now
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* 🔧 CONTENU SCROLLABLE - entre header et footer */}
        <div 
          className="flex-1 overflow-y-auto sidebar-scroll-container"
          style={{ 
            overflowX: 'visible'
          }}
        >
          <div className="py-6">
            
            {/* WORKSPACE Section */}
            <div className={`px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 transition-opacity duration-300 ${collapsed ? 'opacity-0' : 'opacity-100'}`}>
              <span className="bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent">WORKSPACE</span>
            </div>

            <div className="space-y-2 mb-8 px-1">
              {workspaceItems.map(({ href, label, icon, isActive }) => (
                <div key={href} className="relative group">
                  <Tooltip 
                    text={label}
                    isVisible={collapsed && hoveredItem === href}
                    buttonRef={{ current: buttonRefs.current[href] }}
                  >
                    <Link
                      ref={setButtonRef(href)}
                      href={href}
                      onMouseEnter={() => setHoveredItem(href)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`flex items-center h-12 px-3 rounded-xl transition-all duration-300 relative group backdrop-blur-sm min-h-[48px] ${
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
                      
                      {!collapsed && (
                        <div className={`absolute right-3 w-2 h-2 rounded-full transition-all duration-300 ${
                          isActive 
                            ? 'bg-blue-400 opacity-100 shadow-blue-400/50 shadow-md' 
                            : 'bg-blue-400 opacity-0 group-hover:opacity-100 shadow-blue-400/50 group-hover:shadow-md'
                        }`}></div>
                      )}
                      
                      <div 
                        className={`w-5 h-5 shrink-0 transition-all duration-300 ${
                          isActive 
                            ? 'text-blue-400 scale-110' 
                            : 'text-blue-400 group-hover:text-cyan-400 group-hover:scale-110'
                        }`} 
                        style={{ marginLeft: '4px' }}
                      >
                        {icon}
                      </div>
                      
                      <div className={`ml-3 transition-all duration-300 ease-out overflow-hidden ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                        <span className={`font-semibold whitespace-nowrap transition-colors duration-300 ${
                          isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                        }`}>
                          {label}
                        </span>
                      </div>
                    </Link>
                  </Tooltip>
                </div>
              ))}
            </div>

            {/* RESOURCES Section */}
            <div className={`px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 transition-opacity duration-300 ${collapsed ? 'opacity-0' : 'opacity-100'}`}>
              <span className="bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent">RESOURCES</span>
            </div>

            <div className="space-y-2 px-1">
              {resourceItems.map(({ href, label, icon, isActive }) => (
                <div key={href} className="relative group">
                  <Tooltip 
                    text={label}
                    isVisible={collapsed && hoveredItem === href}
                    buttonRef={{ current: buttonRefs.current[href] }}
                  >
                    <Link
                      ref={setButtonRef(href)}
                      href={href}
                      onMouseEnter={() => setHoveredItem(href)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`flex items-center h-12 px-3 rounded-xl transition-all duration-300 relative group backdrop-blur-sm min-h-[48px] ${
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
                      
                      {!collapsed && (
                        <div className={`absolute right-3 w-2 h-2 rounded-full transition-all duration-300 ${
                          isActive 
                            ? 'bg-blue-400 opacity-100 shadow-blue-400/50 shadow-md' 
                            : 'bg-blue-400 opacity-0 group-hover:opacity-100 shadow-blue-400/50 group-hover:shadow-md'
                        }`}></div>
                      )}
                      
                      <div 
                        className={`w-5 h-5 shrink-0 transition-all duration-300 ${
                          isActive 
                            ? 'text-blue-400 scale-110' 
                            : 'text-blue-400 group-hover:text-cyan-400 group-hover:scale-110'
                        }`} 
                        style={{ marginLeft: '4px' }}
                      >
                        {icon}
                      </div>
                      
                      <div className={`ml-3 transition-all duration-300 ease-out overflow-hidden ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                        <span className={`font-semibold whitespace-nowrap transition-colors duration-300 ${
                          isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                        }`}>
                          {label}
                        </span>
                      </div>
                    </Link>
                  </Tooltip>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 🔧 FOOTER FIXE - reste en bas */}
        <div className="border-t border-gray-700/50 p-3 flex-shrink-0 bg-gray-900/30 backdrop-blur-sm">
          <SidebarUserDropdown collapsed={collapsed} />
        </div>
      </aside>

      {/* Toggle Button - INCHANGÉ */}
      <div className="group">
        <button
          onClick={toggleSidebar}
          className="fixed top-1/2 -translate-y-1/2 z-[60] w-10 h-10 md:w-10 md:h-10 flex items-center justify-center bg-gray-900/95 backdrop-blur-xl hover:bg-gray-800/95 text-gray-300 hover:text-white rounded-full transition-all duration-300 border border-gray-700/50 hover:border-blue-500/50 shadow-2xl hover:shadow-blue-500/20 hover:scale-110 group touch-manipulation"
          style={{ left: collapsed ? '56px' : '280px' }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-300 pointer-events-none"></div>
          <ChevronLeft 
            size={18} 
            className={`transition-all duration-300 relative z-10 ${collapsed ? 'rotate-180' : ''} group-hover:scale-110`} 
          />
        </button>
      </div>

      {/* Mobile Overlay - INCHANGÉ */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  )
}