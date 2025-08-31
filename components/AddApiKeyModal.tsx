"use client";

import { useState } from "react";
import { X, Key, Eye, EyeOff, Globe, ExternalLink, RefreshCw, Plus } from "lucide-react";
import { toast } from "react-hot-toast";

interface AddApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeyAdded?: (apiKey: { id: string; name: string; maskedKey: string; isDefault: boolean }) => void;
}

export default function AddApiKeyModal({ isOpen, onClose, onApiKeyAdded }: AddApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [projectName, setProjectName] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim() || !projectName.trim()) {
      toast.error("Please fill in both fields");
      return;
    }
    
    if (!apiKey.startsWith('sk-')) {
      toast.error("Please enter a valid OpenAI API key");
      return;
    }
    
    setSaving(true);
    
    try {
      // 🔥 VRAIE REQUÊTE - Même logique que la page API Key
      const response = await fetch('/api/user/api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName.trim(),
          apiKey: apiKey.trim(),
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success("API key added successfully!");
        
        // Créer l'objet comme il serait retourné par l'API
        const newApiKeyData = {
          id: Date.now().toString(), // Temporaire, on va fetch la vraie liste après
          name: projectName.trim(),
          maskedKey: `sk-...${apiKey.slice(-4)}`,
          isDefault: false
        };
        
        // Reset du formulaire
        setApiKey("");
        setProjectName("");
        setShowApiKey(false);
        onClose();
        
        // Notifier le parent pour refresh la liste
        if (onApiKeyAdded) {
          onApiKeyAdded(newApiKeyData);
        }
      } else {
        toast.error(data.error || "Failed to add API key");
      }
    } catch (error) {
      console.error('Error adding API key:', error);
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setApiKey("");
      setProjectName("");
      setShowApiKey(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 rounded-lg">
                <Key className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Add New API Key</h3>
            </div>
            <button
              onClick={handleClose}
              disabled={saving}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>
          
          <p className="text-gray-400 text-sm mb-6">
            Provide a project name and your OpenAI API key. It will be stored securely.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., My Main Project, Test Environment"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-white placeholder-gray-500 transition-all"
                disabled={saving}
                autoFocus
              />
            </div>
            
            {/* OpenAI API Key */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">
                OpenAI API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-600 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-white placeholder-gray-500 transition-all font-mono"
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  disabled={saving}
                >
                  {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
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
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!apiKey.trim() || !projectName.trim() || saving}
                className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    Save API Key
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}