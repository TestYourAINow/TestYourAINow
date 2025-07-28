"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { 
  Clipboard, Edit, ArrowLeft, Bot, Info, Settings, FileText, 
  Check, X, Save, Beaker, Play, User, Zap, Activity, Clock,
  Star, TrendingUp, Copy, ChevronLeft, Globe, Shield
} from "lucide-react";

export default function AgentPromptPage() {
  const { id } = useParams();
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [name, setName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [agentData, setAgentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const agentRes = await fetch(`/api/agents/${id}`);
        const agentData = await agentRes.json();
        if (agentData?.name) {
          setName(agentData.name);
          setTempName(agentData.name);
          setAgentData(agentData);
        }

        const promptRes = await fetch(`/api/agents/${id}/prompt`);
        const promptData = await promptRes.json();
        if (promptData?.prompt) setPrompt(promptData.prompt);
        else toast.error("Prompt not found.");
      } catch (err) {
        toast.error("Failed to load agent.");
      } finally {
        setLoading(false);
        // 🎯 FORCE scroll to top après le chargement
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 100);
      }
    };

    load();
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast.success("Prompt copied!");
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSaveName = async () => {
    if (!tempName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setSavingName(true);
    try {
      const res = await fetch(`/api/agents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tempName.trim() }),
      });

      if (res.ok) {
        setName(tempName.trim());
        setEditingName(false);
        toast.success("Agent name updated!");
      } else {
        toast.error("Failed to update name");
      }
    } catch (err) {
      toast.error("Failed to update name");
    } finally {
      setSavingName(false);
    }
  };

  const handleCancelEdit = () => {
    setTempName(name);
    setEditingName(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Loading Agent</h3>
          <p className="text-gray-400">Fetching agent details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent relative">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="flex justify-center py-8">
        <div className="w-full max-w-7xl mx-auto px-6 relative z-10 pb-8">
          
          {/* Enhanced Header */}
          <div className="mb-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => router.push("/agents")}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-200 hover:bg-gray-800/50 px-3 py-2 rounded-xl group"
              >
                <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                <span className="text-sm font-medium">Back to Agents</span>
              </button>
              <div className="text-gray-600">/</div>
              <span className="text-sm text-gray-300">Agent Details</span>
            </div>
            
            {/* Agent Header Card */}
            <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  {/* Agent Avatar */}
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 relative">
                    <Bot className="w-10 h-10 text-white" />
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Agent Info */}
                  <div className="flex-1">
                    {editingName ? (
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          className="bg-gray-800/80 border border-gray-600/50 text-white rounded-xl px-4 py-3 text-2xl font-bold outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveName();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          autoFocus
                        />
                        <button
                          onClick={handleSaveName}
                          disabled={savingName}
                          className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-green-500/20 transform hover:scale-105 disabled:opacity-50"
                        >
                          {savingName ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Check size={20} />
                          )}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-3 bg-gray-600/80 hover:bg-gray-500/80 text-white rounded-xl transition-all duration-200"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                            {name}
                          </h1>
                          <button
                            onClick={() => setEditingName(true)}
                            className="p-2 text-gray-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-800/50 group"
                            title="Edit name"
                          >
                            <Edit size={18} className="group-hover:scale-110 transition-transform" />
                          </button>
                          <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                            <span className="text-green-400 text-sm font-semibold">Active</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Shield size={14} />
                            ID: {typeof id === 'string' ? id.slice(0, 8) + '...' : id}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            Last updated: Just now
                          </span>
                          <span className="flex items-center gap-1">
                            <Activity size={14} />
                            {agentData?.openaiModel || 'GPT-4'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push(`/agent-lab?agentId=${id}`)}
                    className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/20 transform hover:scale-105"
                    title="Improve Agent"
                  >
                    <Beaker size={18} />
                    <span className="hidden lg:inline">Improve</span>
                  </button>
                  
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                      copied 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' 
                        : 'bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white border border-gray-600/50'
                    }`}
                    title="Copy Prompt"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    <span className="hidden lg:inline">{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Layout */}
          <div className="flex gap-6" style={{ minHeight: 'calc(100vh - 280px)' }}>
            
            {/* Left Panel - Prompt Display */}
            <div className="flex-1 bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden relative resize-y" style={{ height: '800px', minHeight: '300px', maxHeight: '1200px' }}>
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none"></div>
              
              <div className="relative z-10 p-6 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Agent Prompt</h3>
                      <p className="text-sm text-gray-400">AI instruction set</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-gray-800/50 border border-gray-600/50 rounded-lg">
                      <span className="text-xs text-gray-400">
                        {prompt.length.toLocaleString()} chars
                      </span>
                    </div>
                    <button
                      onClick={handleCopy}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                        copied 
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/20' 
                          : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:scale-105'
                      }`}
                    >
                      {copied ? '✓ Copied' : 'Copy Prompt'}
                    </button>
                  </div>
                </div>
                
                {/* Prompt Content */}
                <div className="flex-1 bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl overflow-hidden">
                  <div className="h-full overflow-y-auto p-6 custom-scrollbar">
                    <div className="text-gray-100 leading-relaxed whitespace-pre-wrap">
                      {prompt || (
                        <div className="text-center text-gray-400 py-12">
                          <FileText size={48} className="mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium mb-2">No prompt available</p>
                          <p className="text-sm">The agent prompt hasn't been generated yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Agent Information */}
            <div className="w-96 flex-shrink-0" style={{ minHeight: 'calc(100vh - 280px)' }}>
              <div className="h-full overflow-y-auto custom-scrollbar">
                <div className="p-6 space-y-6">
                  
                  {/* Agent Details Card */}
                  <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent pointer-events-none"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">Agent Details</h3>
                          <p className="text-sm text-gray-400">Configuration overview</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4">
                          <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Agent Name</div>
                          <div className="text-white font-semibold">{name}</div>
                        </div>
                        
                        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4">
                          <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Agent ID</div>
                          <div className="text-white font-mono text-sm break-all">{id}</div>
                        </div>
                        
                        {agentData?.openaiModel && (
                          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4">
                            <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide">AI Model</div>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded flex items-center justify-center">
                                <Bot className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-white font-semibold">{agentData.openaiModel.toUpperCase()}</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                          {agentData?.temperature !== undefined && (
                            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4">
                              <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Temperature</div>
                              <div className="text-white font-bold text-lg">{agentData.temperature}</div>
                            </div>
                          )}
                          {agentData?.top_p !== undefined && (
                            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4">
                              <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Top P</div>
                              <div className="text-white font-bold text-lg">{agentData.top_p}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions Card */}
                  <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent pointer-events-none"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">Quick Actions</h3>
                          <p className="text-sm text-gray-400">Manage and deploy</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <button
                          onClick={() => router.push(`/agent-lab?agentId=${id}`)}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/20 transform hover:scale-105 flex items-center justify-center gap-2 relative overflow-hidden group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                          <Beaker size={18} />
                          Improve Agent
                        </button>
                        
                        <button
                          onClick={() => router.push('/demo-agent')}
                          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:scale-105 flex items-center justify-center gap-2 relative overflow-hidden group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                          <Play size={18} />
                          Create Demo
                        </button>
                        
                        <button
                          onClick={handleCopy}
                          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 relative overflow-hidden group ${
                            copied 
                              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' 
                              : 'bg-gray-800/80 hover:bg-gray-700/80 text-white border border-gray-600/50'
                          }`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                          <Clipboard size={18} />
                          {copied ? 'Copied!' : 'Copy Prompt'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Prompt Analytics Card */}
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-blue-200">Prompt Analytics</h3>
                          <p className="text-sm text-blue-300/70">Content statistics</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4 text-center">
                          <div className="text-3xl font-bold text-white mb-2">
                            {prompt.length.toLocaleString()}
                          </div>
                          <div className="text-blue-200 text-sm font-medium uppercase tracking-wide">Characters</div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4 text-center">
                            <div className="text-xl font-bold text-white mb-2">
                              {prompt.split(/\s+/).filter(word => word.length > 0).length.toLocaleString()}
                            </div>
                            <div className="text-blue-200 text-xs font-medium uppercase tracking-wide">Words</div>
                          </div>
                          
                          <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4 text-center">
                            <div className="text-xl font-bold text-white mb-2">
                              {prompt.split('\n').filter(line => line.trim().length > 0).length.toLocaleString()}
                            </div>
                            <div className="text-blue-200 text-xs font-medium uppercase tracking-wide">Lines</div>
                          </div>
                        </div>
                        
                        {/* Token estimation */}
                        <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4 text-center">
                          <div className="text-lg font-bold text-white mb-2">
                            ~{Math.ceil(prompt.length / 4).toLocaleString()}
                          </div>
                          <div className="text-blue-200 text-xs font-medium uppercase tracking-wide">Est. Tokens</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(17, 24, 39, 0.3);
          border-radius: 16px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgba(59, 130, 246, 0.6), rgba(6, 182, 212, 0.6));
          border-radius: 16px;
          border: 1px solid rgba(75, 85, 99, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgba(59, 130, 246, 0.8), rgba(6, 182, 212, 0.8));
        }
      `}</style>
    </div>
  );
}