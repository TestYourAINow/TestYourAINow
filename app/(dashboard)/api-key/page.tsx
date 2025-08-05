"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Key, Shield, ExternalLink, CheckCircle, AlertTriangle,
  Plus, Trash2, Star, Copy, RefreshCw, Settings, Zap, Lock,
  Activity, Globe, Crown, Sparkles, Info, Bot
} from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  maskedKey: string;
  isDefault: boolean;
  createdAt: string;
}

export default function ApiKeyPage() {
  const { data: session } = useSession();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [newKeyName, setNewKeyName] = useState("");
  const [newApiKey, setNewApiKey] = useState("");
  const [testingKey, setTestingKey] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/user/api-key");
      const data = await response.json();

      if (response.ok) {
        setApiKeys(data.apiKeys || []);
      }
    } catch (err) {
      console.error("Error fetching API keys:", err);
    }
  };

  const handleAddApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/user/api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newKeyName,
          apiKey: newApiKey
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("API key added successfully!");
        setNewKeyName("");
        setNewApiKey("");
        setShowAddForm(false);
        fetchApiKeys();
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to delete this API key?")) {
      return;
    }

    try {
      const response = await fetch(`/api/user/api-key?id=${keyId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("API key deleted successfully!");
        fetchApiKeys();
      } else {
        setError(data.error || "Failed to delete API key");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  const handleSetDefault = async (keyId: string) => {
    try {
      const response = await fetch("/api/user/api-key/set-default", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyId }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Default API key updated!");
        fetchApiKeys();
      } else {
        setError(data.error || "Failed to update default key");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage("Copied to clipboard!");
    setTimeout(() => setMessage(""), 2000);
  };

  if (!session) {
    return (
      <div className="h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">


        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-8 text-center relative z-10 max-w-md mx-4">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Shield className="text-white" size={28} />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-400">Please login to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">


      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-600/20">
                  <Key className="text-white" size={28} />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                  <Lock className="text-white" size={12} />
                </div>
              </div>

              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-2">
                  API Key Management
                </h1>
                <p className="text-gray-400 text-lg">
                  Manage your OpenAI API keys for different projects
                </p>
              </div>
            </div>

            {/* Enhanced Stats Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-xl backdrop-blur-sm">
              <Activity className="text-blue-400" size={16} />
              <span className="text-blue-400 font-medium">{apiKeys.length} Keys</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* Main Panel */}
          <div className="xl:col-span-2 space-y-6">

            {/* Current API Keys - Enhanced */}
            <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Settings className="text-blue-400" size={20} />
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">Your API Keys</h2>
                </div>

                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:scale-105"
                >
                  <Plus size={16} />
                  Add New Key
                </button>
              </div>

              {/* API Keys List - Enhanced */}
              <div className="space-y-4">
                {apiKeys.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                      <Key className="w-10 h-10 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">No API Keys</h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                      Add your first OpenAI API key to start building amazing AI experiences
                    </p>
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Add Your First API Key
                    </button>
                  </div>
                ) : (
                  apiKeys.map((apiKey) => (
                    <div
                      key={apiKey.id}
                      className={`p-5 rounded-xl border-2 transition-all duration-300 backdrop-blur-sm hover:transform hover:scale-105 ${apiKey.isDefault
                          ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30 shadow-lg shadow-blue-500/10'
                          : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${apiKey.isDefault
                                ? 'bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/20'
                                : 'bg-gray-700/50'
                              }`}>
                              <Key className={apiKey.isDefault ? "text-white" : "text-gray-400"} size={18} />
                            </div>
                            {apiKey.isDefault && (
                              <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                                <Star className="text-white fill-white" size={12} />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-bold text-white text-lg">{apiKey.name}</h3>
                              {apiKey.isDefault && (
                                <span className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-400 text-xs rounded-full font-semibold">
                                  Default Project
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-300 font-mono bg-gray-800/50 px-3 py-1 rounded-lg inline-block">{apiKey.maskedKey}</p>
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                              <div className="w-1 h-1 bg-gray-500 rounded-full" />
                              Added {new Date(apiKey.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Enhanced Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(apiKey.maskedKey)}
                            className="p-3 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-110"
                            title="Copy masked key"
                          >
                            <Copy size={16} />
                          </button>

                          {!apiKey.isDefault && (
                            <button
                              onClick={() => handleSetDefault(apiKey.id)}
                              className="p-3 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-xl transition-all duration-200 hover:scale-110"
                              title="Set as default"
                            >
                              <Star size={16} />
                            </button>
                          )}

                          {apiKeys.length > 1 && (
                            <button
                              onClick={() => handleDeleteApiKey(apiKey.id)}
                              className="p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 hover:scale-110"
                              title="Delete API key"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add New API Key Form - Enhanced */}
            {showAddForm && (
              <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Plus className="text-emerald-400" size={20} />
                  <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-200 to-green-200 bg-clip-text text-transparent">Add New API Key</h2>
                </div>

                <div onSubmit={handleAddApiKey} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g., My Main Project, Client ABC"
                      className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all backdrop-blur-sm placeholder-gray-400 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      OpenAI API Key
                    </label>
                    <input
                      type="password"
                      value={newApiKey}
                      onChange={(e) => setNewApiKey(e.target.value)}
                      placeholder="sk-proj-..."
                      className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all backdrop-blur-sm placeholder-gray-400 font-medium"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-3 flex items-center gap-2">
                      <Globe size={12} />
                      Get your API key from{" "}
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1 font-medium"
                      >
                        OpenAI Dashboard
                        <ExternalLink size={12} />
                      </a>
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:from-gray-700 disabled:to-gray-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 transform hover:scale-105 disabled:transform-none disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      {loading ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin relative z-10" />
                          <span className="relative z-10">Adding...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5 relative z-10" />
                          <span className="relative z-10">Add API Key</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewKeyName("");
                        setNewApiKey("");
                        setError("");
                      }}
                      className="px-6 py-4 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-xl font-semibold transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Messages */}
            {message && (
              <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-3 text-emerald-400">
                  <CheckCircle size={18} />
                  <span className="font-medium">{message}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-3 text-red-400">
                  <AlertTriangle size={18} />
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">

            {/* Enhanced Security Info */}
            <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="text-emerald-400" size={20} />
                <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-200 to-green-200 bg-clip-text text-transparent">Security</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-emerald-200 text-sm font-medium">Your API keys are encrypted and stored securely</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-emerald-200 text-sm font-medium">Only you can access and modify your keys</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-emerald-200 text-sm font-medium">API calls are made directly to OpenAI</span>
                </div>
              </div>
            </div>

            {/* NEW: How API Keys Work Explanation */}
            <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Info className="text-amber-400" size={20} />
                <h3 className="text-lg font-semibold bg-gradient-to-r from-amber-200 to-yellow-200 bg-clip-text text-transparent">
                  How API Keys Work
                </h3>
              </div>

              <div className="space-y-4">
                <p className="text-gray-300 text-sm mb-4">Different keys are used for different purposes:</p>

                <div className="space-y-3">
                  {/* Default Key */}
                  <div className="p-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                        <Star size={16} className="text-amber-400" />
                      </div>
                      <span className="text-amber-200 font-semibold">Default Key</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed ml-11">
                      Used for <strong>admin tasks</strong> like creating agents, generating prompts, FAQ creation, and development tools.
                    </p>
                  </div>

                  {/* Agent Keys */}
                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                        <Bot size={16} className="text-blue-400" />
                      </div>
                      <span className="text-blue-200 font-semibold">Agent Keys</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed ml-11">
                      Each agent uses its <strong>specific key</strong> for client conversations, webhooks, and live interactions.
                    </p>
                  </div>
                </div>

                {/* Pro Tip */}
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4 mt-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="text-purple-400" size={16} />
                    <span className="text-purple-200 text-sm font-semibold">Pro Tip</span>
                  </div>
                  <p className="text-purple-100/80 text-xs leading-relaxed">
                    Use different agent keys for different clients to separate costs and track usage per project.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Custom Styles */}
      <style jsx>{`
        .bg-grid {
          background-image: 
            linear-gradient(to right, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </div>
  );
}