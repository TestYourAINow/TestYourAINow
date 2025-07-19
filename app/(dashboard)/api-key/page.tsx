"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Key, Shield, ExternalLink, CheckCircle, AlertTriangle, Eye, EyeOff, Copy, RefreshCw } from "lucide-react";

export default function ApiKeyPage() {
  const { data: session } = useSession();
  const [apiKey, setApiKey] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [keyStrength, setKeyStrength] = useState<"weak" | "medium" | "strong" | null>(null);

  // Récupère l'info sur l'API key au chargement
  useEffect(() => {
    fetchApiKeyInfo();
  }, []);

  // Analyse la force de la clé API
  useEffect(() => {
    if (apiKey.length === 0) {
      setKeyStrength(null);
    } else if (apiKey.startsWith("sk-") && apiKey.length > 20) {
      setKeyStrength("strong");
    } else if (apiKey.startsWith("sk-")) {
      setKeyStrength("medium");
    } else {
      setKeyStrength("weak");
    }
  }, [apiKey]);

  const fetchApiKeyInfo = async () => {
    try {
      const response = await fetch("/api/user/api-key");
      const data = await response.json();
      
      if (response.ok) {
        setHasApiKey(data.hasApiKey);
        setMaskedKey(data.maskedKey || "");
      }
    } catch (err) {
      console.error("Error fetching API key info:", err);
    }
  };

  const handleSaveApiKey = async (e: React.FormEvent) => {
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
        body: JSON.stringify({ apiKey }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(hasApiKey ? "API key updated successfully!" : "API key saved successfully!");
        setApiKey("");
        setShowApiKey(false);
        fetchApiKeyInfo(); // Refresh l'info
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
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
        <div className="w-full max-w-4xl mx-auto px-6">
          {/* Header amélioré */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-orange-600 rounded-xl">
                <Key className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  API Key Settings
                </h1>
                <p className="text-sm text-gray-400">
                  Manage your OpenAI API key for AI agent functionality
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Configuration Panel */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl p-6">
                
                {/* Current Status Section */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="text-blue-400" size={20} />
                    <h2 className="text-lg font-semibold text-blue-200">Current Status</h2>
                  </div>
                  
                  <div className={`p-4 rounded-xl border ${hasApiKey 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : 'bg-red-500/10 border-red-500/20'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {hasApiKey ? (
                          <>
                            <CheckCircle className="text-green-400" size={20} />
                            <div>
                              <p className="text-green-400 font-medium">API Key Configured</p>
                              <p className="text-green-300 text-sm">{maskedKey}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="text-red-400" size={20} />
                            <div>
                              <p className="text-red-400 font-medium">No API Key Configured</p>
                              <p className="text-red-300 text-sm">Add your OpenAI API key to enable AI features</p>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {hasApiKey && (
                        <button
                          onClick={() => copyToClipboard(maskedKey)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                          title="Copy masked key"
                        >
                          <Copy size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* API Key Form */}
                <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Key className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold text-blue-200">
                      {hasApiKey ? "Update API Key" : "Add API Key"}
                    </h3>
                  </div>

                  <form onSubmit={handleSaveApiKey} className="space-y-6">
                    <div>
                      <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-3">
                        OpenAI API Key
                      </label>
                      <div className="relative">
                        <input
                          id="apiKey"
                          type={showApiKey ? "text" : "password"}
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder={hasApiKey ? "Enter new API key to replace current one" : "sk-proj-..."}
                          className="w-full pl-4 pr-12 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      
                      {/* Key strength indicator */}
                      {keyStrength && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className={`w-2 h-2 rounded-full ${keyStrength === 'weak' ? 'bg-red-500' : keyStrength === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                            <div className={`w-2 h-2 rounded-full ${keyStrength === 'medium' || keyStrength === 'strong' ? 'bg-green-500' : 'bg-gray-600'}`} />
                            <div className={`w-2 h-2 rounded-full ${keyStrength === 'strong' ? 'bg-green-500' : 'bg-gray-600'}`} />
                          </div>
                          <span className={`text-xs ${keyStrength === 'weak' ? 'text-red-400' : keyStrength === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                            {keyStrength === 'weak' ? 'Invalid format' : keyStrength === 'medium' ? 'Valid format' : 'Strong API key'}
                          </span>
                        </div>
                      )}
                      
                      <div className="mt-3 text-sm text-gray-400">
                        {hasApiKey ? "Enter a new API key to replace your current one. " : ""}
                        You can get your API key from{" "}
                        <a 
                          href="https://platform.openai.com/api-keys" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
                        >
                          OpenAI Dashboard
                          <ExternalLink size={12} />
                        </a>
                      </div>
                      
                      {hasApiKey && (
                        <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <div className="flex items-center gap-2 text-yellow-400 text-sm">
                            <AlertTriangle size={16} />
                            <span>Note: You cannot remove your API key, only replace it with a new one.</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading || keyStrength === 'weak'}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Key className="w-5 h-5" />
                          {hasApiKey ? "Update API Key" : "Save API Key"}
                        </>
                      )}
                    </button>
                  </form>

                  {/* Messages */}
                  {message && (
                    <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle size={16} />
                        <span>{message}</span>
                      </div>
                    </div>
                  )}
                  
                  {error && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center gap-2 text-red-400">
                        <AlertTriangle size={16} />
                        <span>{error}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Information */}
            <div className="space-y-6">
              {/* Security Information */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="text-green-400" size={20} />
                  <h3 className="text-lg font-semibold text-green-200">Security</h3>
                </div>
                
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Your API key is encrypted and stored securely</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Only you can access and modify your API key</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span>API calls are made directly to OpenAI</span>
                  </div>
                </div>
              </div>

              {/* Usage Information */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Key className="text-blue-400" size={20} />
                  <h3 className="text-lg font-semibold text-blue-200">Usage</h3>
                </div>
                
                <div className="space-y-3 text-sm text-gray-300">
                  <p>Your API key enables:</p>
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
                      Chatbot widgets
                    </li>
                  </ul>
                </div>
              </div>

              {/* Quick Stats */}
              {hasApiKey && (
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="text-purple-400" size={20} />
                    <h3 className="text-lg font-semibold text-purple-200">API Info</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Status</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        <span className="text-green-400 font-medium">Active</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Key Type</span>
                      <span className="text-white">OpenAI</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Format</span>
                      <span className="text-white font-mono text-xs">sk-proj-***</span>
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