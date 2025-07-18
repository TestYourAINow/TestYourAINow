"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { 
  Clipboard, Edit, ArrowLeft, Bot, Info, Settings, FileText, 
  Check, X, Save, Beaker, Play, User
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

  // Fonction supprimée car la date ne s'affiche pas correctement

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl p-8 shadow-2xl">
          <div className="animate-spin h-10 w-10 rounded-full border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-white font-medium">Loading agent...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="flex justify-center min-h-screen py-6">
        <div className="w-full max-w-7xl mx-auto px-6">
          {/* Header amélioré */}
          <div className="mb-6">
            <button
              onClick={() => router.push("/agents")}
              className="mb-4 text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-colors hover:bg-gray-700/30 px-3 py-2 rounded-lg"
            >
              <ArrowLeft size={16} /> Back to Agents
            </button>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-600 rounded-xl">
                <Bot className="text-white" size={24} />
              </div>
              <div className="flex-1">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 text-xl font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={savingName}
                      className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {savingName ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-white">
                      {name}
                    </h1>
                    <button
                      onClick={() => setEditingName(true)}
                      className="p-2 text-gray-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-700/50"
                      title="Edit name"
                    >
                      <Edit size={18} />
                    </button>
                  </div>
                )}
                <p className="text-sm text-gray-400 mt-1">
                  Agent Details • ID: {typeof id === 'string' ? id.slice(0, 8) + '...' : id}
                </p>
              </div>
              
              {/* Quick actions dans le header */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push(`/agent-lab?agentId=${id}`)}
                  className="p-3 text-gray-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-700/50 border border-gray-600"
                  title="Improve Agent"
                >
                  <Beaker size={20} />
                </button>
                <button
                  onClick={handleCopy}
                  className={`p-3 transition-colors rounded-lg border border-gray-600 ${
                    copied 
                      ? 'text-green-400 bg-green-500/10' 
                      : 'text-gray-400 hover:text-blue-400 hover:bg-gray-700/50'
                  }`}
                  title="Copy Prompt"
                >
                  <Clipboard size={20} />
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', height: 'calc(100vh - 200px)', gap: '24px' }}>
            {/* Main Content - Left */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl overflow-hidden" style={{ flex: '1.6' }}>
              <div className="p-6 h-full flex flex-col">
                {/* Prompt Section */}
                <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold text-blue-200">Agent Prompt</h3>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {prompt.length.toLocaleString()} characters
                      </span>
                      <button
                        onClick={handleCopy}
                        className={`px-3 py-1 text-xs rounded-lg transition-all ${
                          copied 
                            ? 'bg-green-600 text-white' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {copied ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 bg-gray-800 border border-gray-600 rounded-lg p-4 overflow-y-auto custom-scrollbar">
                    <pre className="text-sm text-gray-100 whitespace-pre-wrap leading-relaxed font-mono">
                      {prompt || "No prompt available..."}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Information Panel - Right */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl text-white overflow-hidden" style={{ width: '400px', display: 'flex', flexDirection: 'column' }}>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {/* Agent Details */}
                <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <User className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold text-blue-200">Agent Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <div className="text-gray-400 text-xs mb-1">Name</div>
                      <div className="text-white font-medium">{name}</div>
                    </div>
                    
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <div className="text-gray-400 text-xs mb-1">Agent ID</div>
                      <div className="text-white font-mono text-xs break-all">
                        {id}
                      </div>
                    </div>
                    
                    {agentData?.openaiModel && (
                      <div className="bg-gray-800/30 rounded-lg p-3">
                        <div className="text-gray-400 text-xs mb-1">Model</div>
                        <div className="text-white">{agentData.openaiModel}</div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3">
                      {agentData?.temperature !== undefined && (
                        <div className="bg-gray-800/30 rounded-lg p-3">
                          <div className="text-gray-400 text-xs mb-1">Temperature</div>
                          <div className="text-white">{agentData.temperature}</div>
                        </div>
                      )}
                      {agentData?.top_p !== undefined && (
                        <div className="bg-gray-800/30 rounded-lg p-3">
                          <div className="text-gray-400 text-xs mb-1">Top P</div>
                          <div className="text-white">{agentData.top_p}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Settings className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold text-blue-200">Quick Actions</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push(`/agent-lab?agentId=${id}`)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      <Beaker size={16} />
                      Improve Agent
                    </button>
                    
                    <button
                      onClick={() => router.push('/demo-agent')}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      <Play size={16} />
                      Create a Demo
                    </button>
                    
                    <button
                      onClick={handleCopy}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl ${
                        copied 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-600 hover:bg-gray-500 text-white'
                      }`}
                    >
                      <Clipboard size={16} />
                      {copied ? 'Copied!' : 'Copy Prompt'}
                    </button>
                  </div>
                </div>

                {/* Prompt Statistics */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Info className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold text-blue-200">Prompt Analytics</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-blue-500/10 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {prompt.length.toLocaleString()}
                      </div>
                      <div className="text-blue-200 text-xs">Characters</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-500/10 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-white mb-1">
                          {prompt.split(/\s+/).filter(word => word.length > 0).length.toLocaleString()}
                        </div>
                        <div className="text-blue-200 text-xs">Words</div>
                      </div>
                      
                      <div className="bg-blue-500/10 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-white mb-1">
                          {prompt.split('\n').length.toLocaleString()}
                        </div>
                        <div className="text-blue-200 text-xs">Lines</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6b7280;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}