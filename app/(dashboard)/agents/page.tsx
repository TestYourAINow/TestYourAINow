"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Trash2, Bot, Plus, Settings, Calendar, Webhook, File, 
  Search, Filter, Activity,
  TrendingUp, Zap, Users, Circle, ChevronDown
} from "lucide-react"
import ModalDeleteAgent from "@/components/ModalDeleteAgent"
import CreateAgentModal from "@/components/CreateAgentModal"
import Loader from "@/components/Loader"
import FadeInSection from "@/components/FadeInSection"
import RequireApiKey from "@/components/RequireApiKey"

type Agent = {
  _id: string
  name: string
  createdAt: string
  integrations?: { name: string; type: string }[]
}

// Composant simplifié pour les actions d'agent
const AgentActions = ({ 
  agent, 
  onDelete
}: { 
  agent: Agent; 
  onDelete: () => void; 
}) => {
  return (
    <button 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete();
      }}
      className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all opacity-0 group-hover:opacity-100"
    >
      <Trash2 size={14} />
    </button>
  );
};

// Composant pour le statut d'agent
const AgentStatus = ({ integrations }: { integrations?: { name: string; type: string }[] }) => {
  const isActive = integrations && integrations.length > 0;
  
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
      isActive 
        ? 'bg-green-500/20 text-green-400' 
        : 'bg-gray-500/20 text-gray-400'
    }`}>
      <Circle size={6} className={isActive ? 'fill-green-400' : 'fill-gray-400'} />
      {isActive ? 'Active' : 'Basic'}
    </div>
  );
};

// Composant pour les skeleton cards
const AgentCardSkeleton = () => (
  <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl p-6 h-[240px] animate-pulse">
    <div className="flex justify-center mb-4">
      <div className="w-12 h-12 rounded-full bg-gray-700/50"></div>
    </div>
    <div className="text-center space-y-3">
      <div className="h-4 bg-gray-700/50 rounded mx-auto w-3/4"></div>
      <div className="h-3 bg-gray-700/50 rounded mx-auto w-1/2"></div>
      <div className="h-3 bg-gray-700/50 rounded mx-auto w-2/3"></div>
    </div>
  </div>
);

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "active" | "basic">("all")
  const [sortBy, setSortBy] = useState<"name" | "date" | "integrations">("date")

  useEffect(() => {
    const start = Date.now()

    fetch("/api/agents", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setAgents(data.agents || [])
        setFilteredAgents(data.agents || [])
      })
      .catch((err) => console.error(err))
      .finally(() => {
        const elapsed = Date.now() - start
        const remaining = Math.max(0, 1000 - elapsed)
        setTimeout(() => setLoading(false), remaining)
      })
  }, [])

  // Filtrage et tri
  useEffect(() => {
    let filtered = agents.filter(agent => 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Filtrage par type
    if (filterType === "active") {
      filtered = filtered.filter(agent => agent.integrations && agent.integrations.length > 0)
    } else if (filterType === "basic") {
      filtered = filtered.filter(agent => !agent.integrations || agent.integrations.length === 0)
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "integrations":
          return (b.integrations?.length || 0) - (a.integrations?.length || 0)
        case "date":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    setFilteredAgents(filtered)
  }, [agents, searchQuery, filterType, sortBy])

  const handleDelete = (id: string) => {
    setAgents((prev) => prev.filter((a) => a._id !== id))
    setAgentToDelete(null)
  }

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'webhook':
        return <Webhook size={12} />
      case 'calendly':
        return <Calendar size={12} />
      case 'files':
        return <File size={12} />
      default:
        return <Settings size={12} />
    }
  }

  return (
    <RequireApiKey>
      <div className="min-h-screen bg-transparent">
        {showModal && <CreateAgentModal onClose={() => setShowModal(false)} />}
        {agentToDelete && (
          <ModalDeleteAgent
            agent={agentToDelete}
            onClose={() => setAgentToDelete(null)}
            onDelete={handleDelete}
          />
        )}

        {/* Main Content - Centered Container */}
        <div className="flex justify-center min-h-screen py-6">
          <div className="w-full max-w-7xl mx-auto px-6">
            {/* Header amélioré */}
            <div className="mb-8">
              <FadeInSection>
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-600 rounded-xl">
                    <Bot className="text-white" size={24} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      Build your AIs
                    </h1>
                    <p className="text-sm text-gray-400">
                      Create and manage your AI agents with advanced configurations
                    </p>
                  </div>
                  
                  {/* Quick stats dans le header */}
                  {!loading && agents.length > 0 && (
                    <div className="ml-auto flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{agents.length}</div>
                        <div className="text-xs text-gray-400">Agents</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-cyan-300">
                          {agents.filter(a => a.integrations && a.integrations.length > 0).length}
                        </div>
                        <div className="text-xs text-gray-400">Active</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Barre de recherche et filtres */}
                {!loading && agents.length > 0 && (
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-xl p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Search */}
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          placeholder="Search agents..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>

                      {/* Filters */}
                      <div className="flex gap-2">
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                          className="px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-blue-500 transition-all"
                        >
                          <option value="all">All Types</option>
                          <option value="active">Active Only</option>
                          <option value="basic">Basic Only</option>
                        </select>

                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                          className="px-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-blue-500 transition-all"
                        >
                          <option value="date">Sort by Date</option>
                          <option value="name">Sort by Name</option>
                          <option value="integrations">Sort by Integrations</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </FadeInSection>
            </div>

            {loading ? (
              <FadeInSection>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {/* Create Agent Card */}
                  <button
                    className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl h-[240px] flex flex-col items-center justify-center text-gray-400"
                    disabled
                  >
                    <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                      <Plus size={24} className="text-blue-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-300">
                      Create a Build
                    </p>
                  </button>
                  
                  {/* Skeleton cards */}
                  {[...Array(7)].map((_, i) => (
                    <AgentCardSkeleton key={i} />
                  ))}
                </div>
              </FadeInSection>
            ) : (
              <FadeInSection>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {/* Create Agent Card */}
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl h-[240px] flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-[1.02] transition-all duration-300 group"
                  >
                    <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-all duration-300">
                      <Plus size={24} className="text-blue-400 group-hover:text-blue-300" />
                    </div>
                    <p className="text-lg font-medium text-gray-300 group-hover:text-white transition-colors">
                      Create a Build
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Start building your AI agent
                    </p>
                  </button>

                  {/* Agent Cards améliorées */}
                  {filteredAgents.map((agent) => (
                    <div
                      key={agent._id}
                      className="relative bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl p-6 h-[240px] hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-[1.02] transition-all duration-300 group"
                    >
                      {/* Actions Button simplifié */}
                      <div className="absolute top-3 right-3">
                        <AgentActions
                          agent={agent}
                          onDelete={() => setAgentToDelete(agent)}
                        />
                      </div>

                      <Link
                        href={`/agents/${agent._id}`}
                        className="flex flex-col h-full"
                      >
                        {/* Agent Icon et Status */}
                        <div className="flex justify-center mb-4">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                              <Bot className="w-6 h-6 text-blue-400" />
                            </div>
                            {/* Status indicator */}
                            <div className="absolute -top-1 -right-1">
                              <Circle 
                                size={12} 
                                className={`${
                                  agent.integrations && agent.integrations.length > 0 
                                    ? 'text-green-400 fill-green-400' 
                                    : 'text-gray-400 fill-gray-400'
                                }`} 
                              />
                            </div>
                          </div>
                        </div>

                        {/* Agent Info */}
                        <div className="text-center flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-white font-semibold text-lg mb-2 truncate">
                              {agent.name || "Untitled"}
                            </h3>
                            <AgentStatus integrations={agent.integrations} />
                          </div>

                          {/* Integrations */}
                          <div className="flex-1 flex flex-col justify-center my-3">
                            {agent.integrations && agent.integrations.length > 0 ? (
                              <div className="space-y-2">
                                <div className="text-xs text-gray-400 mb-1">
                                  {agent.integrations.length} integration{agent.integrations.length > 1 ? 's' : ''}
                                </div>
                                <div className="flex flex-wrap justify-center gap-1">
                                  {agent.integrations.slice(0, 3).map((integration, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-gray-500/10 text-white border border-gray-500/20 rounded-full"
                                    >
                                      {getIntegrationIcon(integration.type)}
                                      {integration.name.length > 6 ? integration.name.slice(0, 6) + '...' : integration.name}
                                    </span>
                                  ))}
                                  {agent.integrations.length > 3 && (
                                    <span className="text-[10px] px-2 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded-full">
                                      +{agent.integrations.length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500">
                                No integrations yet
                              </div>
                            )}
                          </div>

                          {/* Created Date */}
                          <div className="text-xs text-gray-500">
                            Created {new Date(agent.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </FadeInSection>
            )}

            {/* Statistics Section améliorée */}
            {!loading && agents.length > 0 && (
              <FadeInSection>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6 text-center">
                    <div className="flex items-center justify-center mb-3">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <Bot className="text-white" size={20} />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">{agents.length}</div>
                    <div className="text-blue-200 font-medium">Total Agents</div>
                    <div className="text-xs text-blue-300 mt-1">All AI agents created</div>
                  </div>

                  <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6 text-center">
                    <div className="flex items-center justify-center mb-3">
                      <div className="p-2 bg-green-600 rounded-lg">
                        <Activity className="text-white" size={20} />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">
                      {agents.reduce((acc, agent) => acc + (agent.integrations?.length || 0), 0)}
                    </div>
                    <div className="text-green-200 font-medium">Total Integrations</div>
                    <div className="text-xs text-green-300 mt-1">Across all agents</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6 text-center">
                    <div className="flex items-center justify-center mb-3">
                      <div className="p-2 bg-purple-600 rounded-lg">
                        <Zap className="text-white" size={20} />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">
                      {agents.filter(agent => agent.integrations && agent.integrations.length > 0).length}
                    </div>
                    <div className="text-purple-200 font-medium">Active Agents</div>
                    <div className="text-xs text-purple-300 mt-1">With integrations</div>
                  </div>
                </div>
              </FadeInSection>
            )}

            {/* Empty State */}
            {!loading && agents.length === 0 && (
              <FadeInSection>
                <div className="text-center py-20">
                  <div className="w-20 h-20 rounded-full bg-gray-700/50 border border-gray-600 flex items-center justify-center mx-auto mb-6">
                    <Bot className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No AI agents yet
                  </h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Get started by creating your first AI agent. You can configure prompts, integrations, and more.
                  </p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 mx-auto"
                  >
                    <Plus size={18} />
                    Create Your First Agent
                  </button>
                </div>
              </FadeInSection>
            )}

            {/* No results state */}
            {!loading && agents.length > 0 && filteredAgents.length === 0 && (
              <FadeInSection>
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-full bg-gray-700/50 border border-gray-600 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    No agents found
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Try adjusting your search or filter criteria
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setFilterType("all");
                    }}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Clear filters
                  </button>
                </div>
              </FadeInSection>
            )}
          </div>
        </div>
      </div>
    </RequireApiKey>
  )
}