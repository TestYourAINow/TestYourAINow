"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Key, Shield, CheckCircle, AlertTriangle,
  Plus, Trash2, Star, Copy, Settings, Lock,
  Activity, Crown, Info, Bot
} from "lucide-react";
import LoadingScreen from '@/components/LoadingScreen';
import AddApiKeyModal from '@/components/AddApiKeyModal';

interface ApiKey {
  id: string;
  name: string;
  maskedKey: string;
  provider: string;
  isDefault: boolean;
  createdAt: string;
}

export default function ApiKeyPage() {
  const { data: session } = useSession();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

 useEffect(() => {
  if (session) {
    const startTime = Date.now();
    const minLoadingDuration = 1000;
    
    fetchApiKeys().finally(() => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingDuration - elapsedTime);
      
      setTimeout(() => {
        setInitialLoading(false);
      }, remainingTime);
    });
  } else {
    setInitialLoading(false);
  }
}, [session]);

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

 // Loading state pour toute la page
if (initialLoading || !session) {
  // SI PAS DE SESSION = LOGIN SCREEN
  if (!session) {
    return (
      <div className="h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8 flex items-center justify-center">
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
  
  // SI SESSION MAIS LOADING = LOADING SCREEN
  return (
    <LoadingScreen 
      icon={Key} 
      title="Loading API Keys" 
      subtitle="Fetching your secure keys..." 
    />
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
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-2 pb-1">
                  API Key Management
                </h1>
                <p className="text-gray-400 text-lg">
                  Manage your OpenAI and Anthropic API keys for different projects
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
                  onClick={() => setShowAddModal(true)}
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
                      onClick={() => setShowAddModal(true)}
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
                              <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                                apiKey.provider === "anthropic"
                                  ? "bg-orange-500/20 border border-orange-500/30 text-orange-400"
                                  : "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                              }`}>
                                {apiKey.provider === "anthropic" ? "Anthropic" : "OpenAI"}
                              </span>
                              {apiKey.isDefault && (
                                <span className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-400 text-xs rounded-full font-semibold">
                                  Default Project
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-300 font-mono bg-gray-800/50 px-3 py-1 rounded-lg inline-block">{apiKey.maskedKey}</div>
                            <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                              <div className="w-1 h-1 bg-gray-500 rounded-full" />
                              <p suppressHydrationWarning>
                                Added {new Date(apiKey.createdAt).toLocaleDateString()}
                              </p>
                            </div>
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
                  <span className="text-emerald-200 text-sm font-medium">API calls are made directly to OpenAI or Anthropic</span>
                </div>
              </div>
            </div>

            {/* NEW: How API Keys Work Explanation */}
            {/* Description simple pour votre page API Key */}

            <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Info className="text-amber-400" size={20} />
                <h3 className="text-lg font-semibold bg-gradient-to-r from-amber-200 to-yellow-200 bg-clip-text text-transparent">
                  How API Keys Work
                </h3>
              </div>

              <div className="space-y-4">
                <p className="text-gray-300 text-sm mb-4">Simple and straightforward API key management:</p>

                <div className="space-y-3">
                  {/* Default Key */}
                  <div className="p-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                        <Star size={16} className="text-amber-400" />
                      </div>
                      <span className="text-amber-200 font-semibold">Default Key</span>
                    </div>
                    <div className="ml-11 space-y-1">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Auto-selected when creating a new agent. Used by all <strong>platform tools</strong>:
                      </p>
                      <ul className="text-gray-400 text-xs space-y-0.5 mt-1 list-disc list-inside">
                        <li>Prompt generation</li>
                        <li>Turn into FAQ feature</li>
                        <li>AI Prompter (prompt improvement tool)</li>
                        <li>Add Instructions feature</li>
                      </ul>
                    </div>
                  </div>

                  {/* Agent Key */}
                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                        <Bot size={16} className="text-blue-400" />
                      </div>
                      <span className="text-blue-200 font-semibold">Agent Key</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed ml-11">
                      The key assigned to a specific agent. Used for <strong>all conversations</strong> with that agent, including test chat.
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
                    Set your main account key as default to keep platform tools working smoothly. For client agents, assign a separate key so costs stay isolated.
                  </p>
                </div>
              </div>

              {/* How it works */}
              <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-4 mt-4">
                <div className="text-xs text-gray-400 mb-3 uppercase tracking-wide font-semibold">How it works:</div>
                <div className="space-y-2 text-xs text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text">1.</span>
                    <span>When creating an agent, your <strong>default key</strong> is automatically selected</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text">2.</span>
                    <span>You can assign any key to any agent from the dropdown</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text">3.</span>
                    <span>The agent&apos;s assigned key handles all its conversations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddApiKeyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onApiKeyAdded={() => {
          setMessage("API key added successfully!");
          fetchApiKeys();
        }}
      />
    </div>
  );
}