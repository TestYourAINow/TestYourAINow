'use client'

import { usePathname } from 'next/navigation'
import { Bot, ChevronRight, Plus } from 'lucide-react'
import Link from 'next/link'

interface TopBarProps {
  stats?: {
    totalAgents?: number
    activeAgents?: number
    totalIntegrations?: number
  }
}

export default function DynamicTopBar({ stats }: TopBarProps) {
  const pathname = usePathname()

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
      
      {/* Right side - Stats en temps réel (pour la page agents) */}
      {pathname === '/agents' && stats && (
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{stats.totalAgents || 0}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Total</div>
          </div>
          <div className="w-px h-6 bg-gray-600"></div>
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-400">{stats.activeAgents || 0}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Active</div>
          </div>
          <div className="w-px h-6 bg-gray-600"></div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400">{stats.totalIntegrations || 0}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Integrations</div>
          </div>
          
          {/* Action button */}
          <Link
            href="/agents/new"
            className="ml-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
          >
            <Plus size={16} />
            New Agent
          </Link>
        </div>
      )}

      {/* Right side - Actions pour autres pages */}
      {pathname !== '/agents' && (
        <div className="flex items-center gap-4">
          {pathname === '/agents/new' && (
            <Link
              href="/agents"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              ← Back to Agents
            </Link>
          )}
        </div>
      )}
    </header>
  )
}