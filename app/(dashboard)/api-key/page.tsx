"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Key, Shield, ExternalLink, CheckCircle, AlertTriangle, 
  Plus, Trash2, Star, Copy, RefreshCw, Settings
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

  // 👈 NOUVELLE FONCTION
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
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl p-8 text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Required</h2>
          <p className="text-gray-400">Please login to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="flex justify-center min-h-screen py-6">
        <div className="w-full max-w-5xl mx-auto px-6">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-orange-600 rounded-xl">
                <Key className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  API Key Management
                </h1>
                <p className="text-sm text-gray-400">
                  Manage your OpenAI API keys for different projects
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Panel */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Current API Keys */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Settings className="text-blue-400" size={20} />
                    <h2 className="text-lg font-semibold text-blue-200">Your API Keys</h2>
                  </div>
                  
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={16} />
                    Add New Key
                  </button>
                </div>

                {/* API Keys List */}
                <div className="space-y-4">
                  {apiKeys.length === 0 ? (
                    <div className="text-center py-8">
                      <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">No API Keys</h3>
                      <p className="text-gray-400 mb-4">Add your first OpenAI API key to get started</p>
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add API Key
                      </button>
                    </div>
                  ) : (
                    apiKeys.map((apiKey) => (
                      <div
                        key={apiKey.id}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          apiKey.isDefault
                            ? 'bg-blue-500/10 border-blue-500/30'
                            : 'bg-gray-700/50 border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Key className="text-blue-400" size={18} />
                              {apiKey.isDefault && (
                                <Star className="text-yellow-400 fill-yellow-400" size={14} />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-white">{apiKey.name}</h3>
                                {apiKey.isDefault && (
                                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-400 font-mono">{apiKey.maskedKey}</p>
                              <p className="text-xs text-gray-500">
                                Added {new Date(apiKey.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          {/* 👈 SECTION MISE À JOUR */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyToClipboard(apiKey.maskedKey)}
                              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                              title="Copy masked key"
                            >
                              <Copy size={16} />
                            </button>
                            
                            {!apiKey.isDefault && (
                              <button
                                onClick={() => handleSetDefault(apiKey.id)}
                                className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-colors"
                                title="Set as default"
                              >
                                <Star size={16} />
                              </button>
                            )}
                            
                            {apiKeys.length > 1 && (
                              <button
                                onClick={() => handleDeleteApiKey(apiKey.id)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
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

              {/* Add New API Key Form */}
              {showAddForm && (
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Plus className="text-green-400" size={20} />
                    <h2 className="text-lg font-semibold text-green-200">Add New API Key</h2>
                  </div>

                  <form onSubmit={handleAddApiKey} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Project Name
                      </label>
                      <input
                        type="text"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="e.g., My Main Project, Client ABC"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        OpenAI API Key
                      </label>
                      <input
                        type="password"
                        value={newApiKey}
                        onChange={(e) => setNewApiKey(e.target.value)}
                        placeholder="sk-proj-..."
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400"
                        required
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        Get your API key from{" "}
                        <a 
                          href="https://platform.openai.com/api-keys" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
                        >
                          OpenAI Dashboard
                          <ExternalLink size={10} />
                        </a>
                      </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="w-5 h-5" />
                            Add API Key
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
                        className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Messages */}
              {message && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle size={16} />
                    <span>{message}</span>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertTriangle size={16} />
                    <span>{error}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Security Info */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="text-green-400" size={20} />
                  <h3 className="text-lg font-semibold text-green-200">Security</h3>
                </div>
                
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Your API keys are encrypted and stored securely</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Only you can access and modify your keys</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span>API calls are made directly to OpenAI</span>
                  </div>
                </div>
              </div>

              {/* Usage Info */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Key className="text-blue-400" size={20} />
                  <h3 className="text-lg font-semibold text-blue-200">Usage</h3>
                </div>
                
                <div className="space-y-3 text-sm text-gray-300">
                  <p>Your API keys enable:</p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      AI agent conversations
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      Prompt generation
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      Demo interactions
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      Different projects
                    </li>
                  </ul>
                </div>
              </div>

              {/* Stats */}
              {apiKeys.length > 0 && (
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Settings className="text-purple-400" size={20} />
                    <h3 className="text-lg font-semibold text-purple-200">Overview</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Total Keys</span>
                      <span className="text-white font-medium">{apiKeys.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Default Project</span>
                      <span className="text-white font-medium">
                        {apiKeys.find(k => k.isDefault)?.name || "None"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Status</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        <span className="text-green-400 font-medium">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}