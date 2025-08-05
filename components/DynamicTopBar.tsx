'use client'

import { usePathname } from 'next/navigation'
import { Bot, ChevronRight, Plus, Menu } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import MobileMenu from '@/components/MobileMenu'

export default function DynamicTopBar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Génération intelligente du breadcrumb
  const getBreadcrumb = () => {
    if (pathname === '/agents') {
      return [
        { label: 'Agents', href: '/agents', isActive: true }
      ]
    }
    if (pathname === '/agents/new') {
      return [
        { label: 'Agents', href: '/agents', isActive: false },
        { label: 'Create New', href: '/agents/new', isActive: true }
      ]
    }
    if (pathname.startsWith('/agents/')) {
      return [
        { label: 'Agents', href: '/agents', isActive: false },
        { label: 'Agent Details', href: '#', isActive: true }
      ]
    }
    if (pathname === '/agent-lab') {
      return [
        { label: 'Agent Lab', href: '/agent-lab', isActive: true }
      ]
    }
    // Fallback pour autres pages
    return [
      { label: 'Dashboard', href: '/', isActive: true }
    ]
  }

  // Titre et icône de la page
  const getPageInfo = () => {
    if (pathname === '/agents') {
      return {
        icon: <Bot className="text-blue-400" size={20} />,
        title: 'AI Agent Hub',
        subtitle: 'Manage your intelligent AI agents'
      }
    }
    if (pathname === '/agents/new') {
      return {
        icon: <Plus className="text-green-400" size={20} />,
        title: 'Create Agent',
        subtitle: 'Build a new AI assistant'
      }
    }
    if (pathname === '/agent-lab') {
      return {
        icon: <Bot className="text-purple-400" size={20} />,
        title: 'Agent Lab',
        subtitle: 'Experiment and improve your agents'
      }
    }
    return {
      icon: <Bot className="text-blue-400" size={20} />,
      title: 'Dashboard',
      subtitle: 'Welcome back'
    }
  }

  const breadcrumb = getBreadcrumb()
  const pageInfo = getPageInfo()

  return (
    <>
      <header className="h-16 bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 flex items-center justify-between px-6 sticky top-0 z-40">
        {/* Left side - Breadcrumb + Page info */}
        <div className="flex items-center gap-4">
          {/* Page icon */}
          <div className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-600 flex items-center justify-center">
            {pageInfo.icon}
          </div>
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2">
            {breadcrumb.map((item, index) => (
              <div key={item.href} className="flex items-center gap-2">
                {index > 0 && <ChevronRight size={14} className="text-gray-500" />}
                {item.isActive ? (
                  <span className="text-white font-medium text-sm">{item.label}</span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Page subtitle */}
          <div className="hidden md:block text-gray-400 text-sm ml-2">
            {pageInfo.subtitle}
          </div>
        </div>
        
        {/* 🔧 Right side - SEULEMENT Menu Hamburger */}
        <div className="flex items-center gap-4">
          {/* 🔧 MENU HAMBURGER - TEST: Visible partout pour debug */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-center bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-xl transition-all duration-300 border border-gray-700/50 hover:border-blue-500/50 shadow-lg"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* 🔧 MOBILE MENU COMPONENT */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  )
}