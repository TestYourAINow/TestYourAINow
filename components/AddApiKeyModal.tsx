"use client";

import { useState } from "react";
import { X, Key, Eye, EyeOff, Globe, ExternalLink, RefreshCw } from "lucide-react";
import { Claude, OpenAI } from "@lobehub/icons";
import { toast } from "react-hot-toast";

interface AddApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeyAdded?: (apiKey: { id: string; name: string; maskedKey: string; isDefault: boolean }) => void;
}

export default function AddApiKeyModal({ isOpen, onClose, onApiKeyAdded }: AddApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [projectName, setProjectName] = useState("");
  const [provider, setProvider] = useState<"openai" | "anthropic">("openai");
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!apiKey.trim() || !projectName.trim()) {
      toast.error("Please fill in both fields");
      return;
    }

    if (provider === "openai" && !apiKey.startsWith("sk-")) {
      toast.error("Please enter a valid OpenAI API key (starts with sk-)");
      return;
    }

    if (provider === "anthropic" && !apiKey.startsWith("sk-ant-")) {
      toast.error("Please enter a valid Anthropic API key (starts with sk-ant-)");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/user/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName.trim(), apiKey: apiKey.trim(), provider }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("API key added successfully!");

        const maskedKey = provider === "anthropic"
          ? `sk-ant-...${apiKey.slice(-4)}`
          : `sk-...${apiKey.slice(-4)}`;

        const newApiKeyData = {
          id: Date.now().toString(),
          name: projectName.trim(),
          maskedKey,
          isDefault: false,
        };

        setApiKey("");
        setProjectName("");
        setProvider("openai");
        setShowApiKey(false);
        onClose();

        if (onApiKeyAdded) onApiKeyAdded(newApiKeyData);
      } else {
        toast.error(data.error || "Failed to add API key");
      }
    } catch (error) {
      console.error("Error adding API key:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setApiKey("");
      setProjectName("");
      setProvider("openai");
      setShowApiKey(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  const placeholder = provider === "anthropic" ? "sk-ant-..." : "sk-proj-...";
  const docUrl = provider === "anthropic"
    ? "https://console.anthropic.com/settings/keys"
    : "https://platform.openai.com/api-keys";
  const docLabel = provider === "anthropic" ? "Anthropic Console" : "OpenAI Dashboard";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg">
                <Key className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Add New API Key</h3>
            </div>
            <button onClick={handleClose} disabled={saving} className="text-gray-400 hover:text-white transition-colors disabled:opacity-50">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Provider toggle */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">Provider</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setProvider("openai")}
                  className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                    provider === "openai"
                      ? "bg-gray-700 text-white border border-gray-500"
                      : "bg-gray-800 text-gray-400 hover:text-white border border-gray-700"
                  }`}
                >
                  <OpenAI size={16} style={{ color: "white" }} />
                  OpenAI
                </button>
                <button
                  type="button"
                  onClick={() => setProvider("anthropic")}
                  className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                    provider === "anthropic"
                      ? "bg-gray-700 text-white border border-gray-500"
                      : "bg-gray-800 text-gray-400 hover:text-white border border-gray-700"
                  }`}
                >
                  <Claude.Color size={16} />
                  Anthropic
                </button>
              </div>
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., My Main Project, Client ABC"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-white placeholder-gray-500 transition-all"
                disabled={saving}
                autoFocus
              />
            </div>

            {/* API Key */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">
                {provider === "anthropic" ? "Anthropic API Key" : "OpenAI API Key"}
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-white placeholder-gray-500 transition-all font-mono"
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
                  href={docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1 font-medium"
                >
                  {docLabel}
                  <ExternalLink size={12} />
                </a>
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!apiKey.trim() || !projectName.trim() || saving}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
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
