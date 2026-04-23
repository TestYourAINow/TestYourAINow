// app/(dashboard)/usage-limits/page.tsx

'use client'

import { useState, useEffect } from 'react'
import {
  Bot, BarChart3, Settings, ChevronRight, Globe, Webhook,
  CheckCircle, AlertTriangle, RefreshCw, Save, History, Trash2, StopCircle, X
} from 'lucide-react'

// Platform icons
const FacebookIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-blue-400">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const InstagramIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

type UsageHistoryEntry = {
  periodStart: string
  periodEnd: string
  totalMessages: number
  periodDays: number
  note?: string
}

type Connection = {
  _id: string
  name: string
  integrationType: string
  isActive: boolean
  countsTowardGlobalLimit: boolean
  currentPeriodUsage: number
}

type AgentWithUsage = {
  _id: string
  name: string
  globalLimitEnabled: boolean
  globalMessageLimit: number | null
  globalPeriodDays: number
  globalPeriodStartDate: string | null
  globalPeriodEndDate: string | null
  globalAllowOverage: boolean
  globalLimitReachedMessage: string
  globalShowLimitMessage: boolean
  agentUsageHistory?: UsageHistoryEntry[]
  connections: Connection[]
  currentGlobalUsage: number
}

type LimitForm = {
  globalLimitEnabled: boolean
  globalMessageLimit: number
  globalPeriodDays: number
  globalAllowOverage: boolean
  globalLimitReachedMessage: string
  globalShowLimitMessage: boolean
}

const PERIOD_OPTIONS = [
  { value: 30, label: '30 days (monthly)' },
  { value: 90, label: '90 days (quarterly)' },
  { value: 365, label: '365 days (yearly)' },
]

function getPlatformIcon(type: string) {
  switch (type) {
    case 'instagram-dms': return <InstagramIcon size={14} />
    case 'facebook-messenger': return <FacebookIcon size={14} />
    case 'webhook': return <Webhook size={14} className="text-purple-400" />
    default: return <Globe size={14} className="text-gray-400" />
  }
}

function getPlatformLabel(type: string) {
  switch (type) {
    case 'instagram-dms': return 'Instagram DMs'
    case 'facebook-messenger': return 'Facebook Messenger'
    case 'website-widget': return 'Website Widget'
    case 'webhook': return 'Webhook'
    default: return type
  }
}

function UsageBar({ used, limit }: { used: number; limit: number }) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-emerald-500'
  return (
    <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function UsageLimitsPage() {
  const [agents, setAgents] = useState<AgentWithUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [form, setForm] = useState<LimitForm | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingHistoryIndex, setDeletingHistoryIndex] = useState<number | null>(null)
  const [showEndPeriodConfirm, setShowEndPeriodConfirm] = useState(false)
  const [endingPeriod, setEndingPeriod] = useState(false)
  const [endPeriodNote, setEndPeriodNote] = useState('')

  const selectedAgent = agents.find((a) => a._id === selectedAgentId) ?? null

  useEffect(() => {
    fetchAgents()
  }, [])

  useEffect(() => {
    if (selectedAgent) {
      setForm({
        globalLimitEnabled: selectedAgent.globalLimitEnabled ?? false,
        globalMessageLimit: selectedAgent.globalMessageLimit ?? 100,
        globalPeriodDays: selectedAgent.globalPeriodDays ?? 30,
        globalAllowOverage: selectedAgent.globalAllowOverage ?? false,
        globalLimitReachedMessage: selectedAgent.globalLimitReachedMessage ?? 'Monthly message limit reached. Please contact support to upgrade your plan.',
        globalShowLimitMessage: selectedAgent.globalShowLimitMessage ?? true,
      })
    }
  }, [selectedAgentId])

  async function fetchAgents() {
    setLoading(true)
    try {
      const res = await fetch('/api/usage-limits')
      const data = await res.json()
      setAgents(data.agents ?? [])
    } finally {
      setLoading(false)
    }
  }

  async function fetchAgentDetail(agentId: string) {
    const res = await fetch(`/api/usage-limits/${agentId}`)
    const data = await res.json()
    if (data.agent) {
      setAgents((prev) =>
        prev.map((a) =>
          a._id === agentId
            ? { ...a, agentUsageHistory: data.agent.agentUsageHistory ?? [] }
            : a
        )
      )
    }
  }

  async function handleSelectAgent(agentId: string) {
    setSelectedAgentId(agentId)
    await fetchAgentDetail(agentId)
  }

  async function handleEndPeriod() {
    if (!selectedAgentId) return
    setEndingPeriod(true)
    try {
      await fetch(`/api/usage-limits/${selectedAgentId}/end-period`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: endPeriodNote }),
      })
      const listRes = await fetch('/api/usage-limits')
      const listData = await listRes.json()
      const detailRes = await fetch(`/api/usage-limits/${selectedAgentId}`)
      const detailData = await detailRes.json()
      setAgents(
        (listData.agents ?? []).map((a: AgentWithUsage) =>
          a._id === selectedAgentId
            ? { ...a, agentUsageHistory: detailData.agent?.agentUsageHistory ?? [] }
            : a
        )
      )
    } finally {
      setEndingPeriod(false)
      setShowEndPeriodConfirm(false)
      setEndPeriodNote('')
    }
  }

  async function handleDeleteHistory(realIndex: number) {
    if (!selectedAgentId) return
    setDeletingHistoryIndex(realIndex)
    try {
      await fetch(`/api/usage-limits/${selectedAgentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ historyIndex: realIndex }),
      })
      await fetchAgentDetail(selectedAgentId)
    } finally {
      setDeletingHistoryIndex(null)
    }
  }

  async function handleSave() {
    if (!selectedAgentId || !form) return
    setSaving(true)
    try {
      await fetch(`/api/usage-limits/${selectedAgentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const listRes = await fetch('/api/usage-limits')
      const listData = await listRes.json()
      const detailRes = await fetch(`/api/usage-limits/${selectedAgentId}`)
      const detailData = await detailRes.json()
      setAgents(
        (listData.agents ?? []).map((a: AgentWithUsage) =>
          a._id === selectedAgentId
            ? { ...a, agentUsageHistory: detailData.agent?.agentUsageHistory ?? [] }
            : a
        )
      )
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleConnection(connectionId: string, current: boolean) {
    if (!selectedAgentId) return
    setTogglingId(connectionId)
    try {
      await fetch(`/api/usage-limits/${selectedAgentId}/toggle-connection`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId, countsTowardGlobalLimit: !current }),
      })
      const listRes = await fetch('/api/usage-limits')
      const listData = await listRes.json()
      const detailRes = await fetch(`/api/usage-limits/${selectedAgentId}`)
      const detailData = await detailRes.json()
      setAgents(
        (listData.agents ?? []).map((a: AgentWithUsage) =>
          a._id === selectedAgentId
            ? { ...a, agentUsageHistory: detailData.agent?.agentUsageHistory ?? [] }
            : a
        )
      )
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar bg-gray-950 p-4 md:p-8">

      {/* End period confirmation dialog */}
      {showEndPeriodConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700/60 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
                  <StopCircle size={18} className="text-orange-400" />
                </div>
                <h3 className="text-base font-bold text-white">End period early?</h3>
              </div>
              <button onClick={() => setShowEndPeriodConfirm(false)} className="text-gray-500 hover:text-gray-300 transition-colors">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-300 mb-2">
              The current period will be saved to history and the counter will reset to 0.
            </p>
            <p className="text-sm text-gray-400 mb-4">
              A new {selectedAgent?.globalPeriodDays ?? 30}-day period starts immediately.
            </p>
            <textarea
              value={endPeriodNote}
              onChange={(e) => setEndPeriodNote(e.target.value)}
              placeholder="Add a note (optional)..."
              rows={2}
              className="w-full mb-5 px-3 py-2 rounded-xl bg-gray-800/60 border border-gray-700/60 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-gray-500 transition-colors"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowEndPeriodConfirm(false); setEndPeriodNote('') }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-700/60 text-gray-300 hover:bg-gray-800/50 text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleEndPeriod}
                disabled={endingPeriod}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-sm font-semibold transition-all disabled:opacity-50"
              >
                {endingPeriod ? 'Ending...' : 'End period'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-600/20 to-blue-600/20 border-2 border-emerald-500/40 flex items-center justify-center">
            <BarChart3 className="text-emerald-400" size={22} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Usage Limits</h1>
            <p className="text-gray-400">Set global response limits per agent across all deployments</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-24">
          <Bot className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No agents yet</h3>
          <p className="text-gray-400">Create an agent first to manage usage limits.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: agent list */}
          <div className="lg:col-span-1 space-y-3">
            {agents.map((agent) => {
              const isSelected = agent._id === selectedAgentId
              return (
                <button
                  key={agent._id}
                  onClick={() => handleSelectAgent(agent._id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-500/60 bg-blue-600/10'
                      : 'border-gray-700/50 bg-gray-900/80 hover:bg-gray-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
                        <Bot size={16} className="text-blue-400" />
                      </div>
                      <span className="font-semibold text-white text-sm truncate max-w-[140px]">{agent.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent.globalLimitEnabled ? (
                        <span className="text-xs px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full font-medium">ON</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 bg-gray-700/50 text-gray-400 border border-gray-600/30 rounded-full font-medium">OFF</span>
                      )}
                      <ChevronRight size={14} className={`text-gray-400 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                    </div>
                  </div>

                  {agent.globalLimitEnabled && agent.globalMessageLimit && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{agent.currentGlobalUsage} used</span>
                        <span>{agent.globalMessageLimit} limit</span>
                      </div>
                      <UsageBar used={agent.currentGlobalUsage} limit={agent.globalMessageLimit} />
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    {agent.connections.length} connection{agent.connections.length !== 1 ? 's' : ''}
                    {agent.globalLimitEnabled && (
                      <> &bull; {agent.connections.filter((c) => c.countsTowardGlobalLimit).length} active</>
                    )}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Right: agent detail */}
          <div className="lg:col-span-2">
            {!selectedAgent ? (
              <div className="h-full flex items-center justify-center border border-gray-700/50 rounded-2xl bg-gray-900/50 py-24">
                <div className="text-center">
                  <Settings className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Select an agent to configure its usage limit</p>
                </div>
              </div>
            ) : form ? (
              <div className="space-y-6">

                {/* Settings card */}
                <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-600/20 border border-emerald-500/40 rounded-xl flex items-center justify-center">
                        <BarChart3 size={18} className="text-emerald-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">{selectedAgent.name}</h2>
                        <p className="text-gray-400 text-sm">Global limit settings</p>
                      </div>
                    </div>

                    {/* Enable toggle */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-400">Enable limit</span>
                      <button
                        onClick={() => setForm({ ...form, globalLimitEnabled: !form.globalLimitEnabled })}
                        className={`relative w-11 h-6 rounded-full transition-all duration-200 focus:outline-none shrink-0 ${
                          form.globalLimitEnabled ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-gray-700'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          form.globalLimitEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Usage bar (current) */}
                  {form.globalLimitEnabled && selectedAgent.globalMessageLimit && (
                    <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700/30">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-300 font-medium">Current period usage</span>
                        <span className="text-white font-bold">
                          {selectedAgent.currentGlobalUsage} / {selectedAgent.globalMessageLimit}
                        </span>
                      </div>
                      <UsageBar used={selectedAgent.currentGlobalUsage} limit={selectedAgent.globalMessageLimit} />
                      <div className="flex items-center justify-between mt-2">
                        {selectedAgent.globalPeriodEndDate ? (
                          <p className="text-xs text-gray-500">Period ends {formatDate(selectedAgent.globalPeriodEndDate)}</p>
                        ) : <span />}
                        {selectedAgent.globalPeriodStartDate && (
                          <button
                            onClick={() => setShowEndPeriodConfirm(true)}
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-400 transition-colors"
                          >
                            <StopCircle size={12} />
                            End period
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className={`space-y-5 transition-opacity ${form.globalLimitEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>

                    {/* Message limit */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Response limit</label>
                      <input
                        type="number"
                        min={1}
                        value={form.globalMessageLimit}
                        onChange={(e) => setForm({ ...form, globalMessageLimit: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="e.g. 500"
                      />
                    </div>

                    {/* Period */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Billing period</label>
                      <div className="flex gap-2 flex-wrap">
                        {PERIOD_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => form && setForm({ ...form, globalPeriodDays: opt.value })}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                              form.globalPeriodDays === opt.value
                                ? 'bg-blue-600 text-white border-blue-500'
                                : 'bg-gray-800/50 text-gray-300 border-gray-700/50 hover:border-gray-600'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      {form.globalPeriodDays !== (selectedAgent.globalPeriodDays ?? 30) && (
                        <p className="text-xs text-gray-500 mt-2">End date will adjust on save.</p>
                      )}
                    </div>

                    {/* Allow overage */}
                    <div className="flex items-center justify-between p-4 bg-gray-800/40 rounded-xl border border-gray-700/30">
                      <div>
                        <p className="text-sm font-semibold text-white">Allow overage</p>
                        <p className="text-xs text-gray-400 mt-0.5">Continue responding after limit is reached</p>
                      </div>
                      <button
                        onClick={() => setForm({ ...form, globalAllowOverage: !form.globalAllowOverage })}
                        className={`relative w-11 h-6 rounded-full transition-all duration-200 focus:outline-none shrink-0 ${
                          form.globalAllowOverage ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-gray-700'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          form.globalAllowOverage ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Show limit message */}
                    <div className="flex items-center justify-between p-4 bg-gray-800/40 rounded-xl border border-gray-700/30">
                      <div>
                        <p className="text-sm font-semibold text-white">Show limit message</p>
                        <p className="text-xs text-gray-400 mt-0.5">Display a message when limit is reached</p>
                      </div>
                      <button
                        onClick={() => setForm({ ...form, globalShowLimitMessage: !form.globalShowLimitMessage })}
                        className={`relative w-11 h-6 rounded-full transition-all duration-200 focus:outline-none shrink-0 ${
                          form.globalShowLimitMessage ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-gray-700'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          form.globalShowLimitMessage ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Limit reached message */}
                    {form.globalShowLimitMessage && (
                      <div>
                        <label className="block text-sm font-semibold text-white mb-2">Limit reached message</label>
                        <textarea
                          rows={3}
                          value={form.globalLimitReachedMessage}
                          onChange={(e) => setForm({ ...form, globalLimitReachedMessage: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none text-sm"
                        />
                      </div>
                    )}
                  </div>

                  {/* Save button */}
                  <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-700/50">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
                    >
                      {saving ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : saveSuccess ? (
                        <CheckCircle size={16} />
                      ) : (
                        <Save size={16} />
                      )}
                      {saving ? 'Saving...' : saveSuccess ? 'Saved' : 'Save settings'}
                    </button>
                  </div>
                </div>

                {/* Connections card */}
                <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6">
                  <h3 className="text-base font-bold text-white mb-1">Connections</h3>
                  <p className="text-sm text-gray-400 mb-5">
                    Toggle which deployments count toward the global limit. New connections are off by default.
                  </p>

                  {selectedAgent.connections.length === 0 ? (
                    <div className="text-center py-10">
                      <Globe className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">No connections for this agent yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedAgent.connections.map((conn) => (
                        <div
                          key={conn._id}
                          className="flex items-center justify-between p-4 bg-gray-800/40 rounded-xl border border-gray-700/30"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-700/50 rounded-lg flex items-center justify-center">
                              {getPlatformIcon(conn.integrationType)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{conn.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-gray-500">{getPlatformLabel(conn.integrationType)}</span>
                                {conn.countsTowardGlobalLimit && (
                                  <>
                                    <span className="text-gray-600 text-xs">&bull;</span>
                                    <span className="text-xs text-gray-400">{conn.currentPeriodUsage ?? 0} msgs this period</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {!conn.isActive && (
                              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">Offline</span>
                            )}
                            <button
                              onClick={() => handleToggleConnection(conn._id, conn.countsTowardGlobalLimit)}
                              disabled={togglingId === conn._id}
                              className={`relative w-11 h-6 rounded-full transition-all duration-200 focus:outline-none shrink-0 ${
                                togglingId === conn._id ? 'opacity-50' :
                                conn.countsTowardGlobalLimit ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-gray-700'
                              }`}
                            >
                              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                conn.countsTowardGlobalLimit ? 'translate-x-5' : 'translate-x-0'
                              }`} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedAgent.globalLimitEnabled && selectedAgent.connections.some((c) => c.countsTowardGlobalLimit) && (
                    <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <div className="flex items-start gap-3">
                        <CheckCircle size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-emerald-300">
                          Total: <strong>{selectedAgent.currentGlobalUsage}</strong> of <strong>{selectedAgent.globalMessageLimit}</strong> responses used this period across {selectedAgent.connections.filter((c) => c.countsTowardGlobalLimit).length} active connection{selectedAgent.connections.filter((c) => c.countsTowardGlobalLimit).length !== 1 ? 's' : ''}.
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedAgent.globalLimitEnabled && !selectedAgent.connections.some((c) => c.countsTowardGlobalLimit) && (
                    <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertTriangle size={16} className="text-yellow-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-yellow-300">
                          No connections are active. Toggle at least one connection to start tracking usage.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Usage history card */}
                {(() => {
                  type HistoryRow = { startDate: string; endDate: string; messages: number; label: string; note?: string; realIndex: number | null }
                  const rows: HistoryRow[] = []
                  ;(selectedAgent.agentUsageHistory ?? []).forEach((entry, i) => {
                    const plannedMs = entry.periodDays * 24 * 60 * 60 * 1000
                    const actualMs = new Date(entry.periodEnd).getTime() - new Date(entry.periodStart).getTime()
                    const endedEarly = actualMs < plannedMs * 0.8
                    rows.push({ startDate: entry.periodStart, endDate: entry.periodEnd, messages: entry.totalMessages, label: endedEarly ? `Ended early (${entry.periodDays}-day)` : `${entry.periodDays}-day period`, note: entry.note, realIndex: i })
                  })
                  rows.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                  return (
                    <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-8 h-8 bg-gray-700/50 rounded-lg flex items-center justify-center">
                          <History size={16} className="text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white">Usage history</h3>
                          <p className="text-xs text-gray-500">Past periods, most recent first</p>
                        </div>
                      </div>
                      {rows.length > 0 ? (
                        <div className="space-y-2">
                          {rows.map((row, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-800/40 rounded-xl border border-gray-700/30">
                              <div>
                                <p className="text-xs text-gray-300 font-medium">{formatDate(row.startDate)} to {formatDate(row.endDate)}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{row.label}</p>
                                {row.note && <p className="text-xs text-gray-500 italic mt-0.5">{row.note}</p>}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-white">
                                  {row.messages} <span className="text-xs font-normal text-gray-400">msg{row.messages !== 1 ? 's' : ''}</span>
                                </span>
                                {row.realIndex !== null && (
                                  <button
                                    onClick={() => handleDeleteHistory(row.realIndex!)}
                                    disabled={deletingHistoryIndex === row.realIndex}
                                    className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
                                  >
                                    {deletingHistoryIndex === row.realIndex
                                      ? <RefreshCw size={13} className="animate-spin" />
                                      : <Trash2 size={13} />
                                    }
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 border border-dashed border-gray-700/50 rounded-xl">
                          <History className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No history yet</p>
                          <p className="text-xs text-gray-600 mt-1">Past periods will appear here after the first reset</p>
                        </div>
                      )}
                    </div>
                  )
                })()}

              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
