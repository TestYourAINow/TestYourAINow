"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Calendar, X, TestTube, Wand2, Save, Key, Shield, CheckCircle, Zap, Settings } from "lucide-react";
import { AgentIntegration } from "@/types/integrations";

interface CalendlyIntegrationModalProps {
  onClose: () => void;
  onSave: (integration: AgentIntegration) => void;
  agentId: string;
  initialData?: AgentIntegration;
}

export default function CalendlyIntegrationModal({
  onClose,
  onSave,
  agentId,
  initialData,
}: CalendlyIntegrationModalProps) {
  // Type narrowing spécifique à Calendly uniquement
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.type === "calendly" ? initialData.description || "" : ""
  );
  const [apiKey, setApiKey] = useState(
    initialData?.type === "calendly" ? initialData.apiKey || "" : ""
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isAddingInstructions, setIsAddingInstructions] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testPassed, setTestPassed] = useState(false);
  const [hasBeenSaved, setHasBeenSaved] = useState(!!initialData);

  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [descError, setDescError] = useState("");
  const [apiKeyError, setApiKeyError] = useState("");

  const handleTestApiKey = async () => {
    setIsTestingKey(true);
    setApiKeyError("");
    setTestPassed(false);

    if (!apiKey.trim()) {
      setApiKeyError("API Key is required");
      setIsTestingKey(false);
      return;
    }

    try {
      const res = await fetch("https://api.calendly.com/users/me", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (res.ok) {
        toast.success("✅ API Key is valid!");
        setTestPassed(true);
      } else {
        toast.error("❌ Invalid API Key. Please check it.");
        setTestPassed(false);
      }
    } catch {
      toast.error("❌ Failed to test API Key. Network error?");
      setTestPassed(false);
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setNameError("");
    setDescError("");
    setApiKeyError("");

    let hasError = false;

    if (!name.trim()) {
      setNameError("Integration name is required");
      hasError = true;
    }

    if (!description.trim()) {
      setDescError("Description is required");
      hasError = true;
    }

    if (!apiKey.trim()) {
      setApiKeyError("API Key is required");
      hasError = true;
    }

    if (hasError || !testPassed) {
      setIsSaving(false);
      return;
    }

    const endpoint = initialData
      ? `/api/agents/${agentId}/integrations/${encodeURIComponent(initialData.name)}`
      : `/api/agents/${agentId}/integrations`;

    try {
      const res = await fetch(endpoint, {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "calendly",
          name,
          description,
          apiKey,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save.");
        return;
      }

      onSave({ 
        type: "calendly", 
        name, 
        description, 
        apiKey, 
        createdAt: new Date().toISOString() 
      });
      setHasBeenSaved(true);
      toast.success("Calendly integration saved!");
      onClose();
    } catch {
      toast.error("Error while saving Calendly integration.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddInstructions = async () => {
    if (!hasBeenSaved) {
      toast.warning("Please save first.");
      return;
    }

    setIsAddingInstructions(true);

    try {
      const promptGenRes = await fetch("/api/generate-instructions-calendly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, agentId }),
      });

      if (!promptGenRes.ok) {
        toast.error("Failed to generate instructions.");
        return;
      }

      const { instructions } = await promptGenRes.json();

      const updatePromptRes = await fetch(`/api/agents/${agentId}/prompt`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appendInstructions: instructions,
          replaceInstructionsFor: name,
        }),
      });

      if (!updatePromptRes.ok) {
        toast.error("Failed to update prompt.");
        return;
      }

      const updatedPromptData = await updatePromptRes.json();
      const updatedPrompt = updatedPromptData.prompt;

      const versionRes = await fetch(`/api/agents/${agentId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: updatedPrompt,
          openaiModel: "gpt-4o",
          temperature: 0.5,
          top_p: 1,
          integrations: [
            {
              type: "calendly",
              name,
              description,
              apiKey,
            },
          ],
        }),
      });

      if (versionRes.ok) {
        toast.success("Instructions added to prompt and version created!");
      } else {
        toast.error("Failed to create version.");
      }

      onClose();
      onSave({ 
        type: "calendly", 
        name, 
        description, 
        apiKey, 
        createdAt: new Date().toISOString() 
      });
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsAddingInstructions(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Modal Container */}
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border-2 border-emerald-500/40 flex items-center justify-center shadow-lg backdrop-blur-sm">
              <Calendar className="text-emerald-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Calendly Integration
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">Connect your agent with Calendly for smart scheduling</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200 group"
          >
            <X size={20} className="relative z-10" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information Section */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-lg">
                <Settings className="text-emerald-400" size={18} />
              </div>
              <h3 className="text-lg font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">Integration Details</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Integration Name *</label>
                <input
                  className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm"
                  placeholder="Enter integration name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {nameError && <p className="text-red-400 text-sm mt-1 font-medium">{nameError}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Description *</label>
                <textarea
                  className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm resize-none"
                  placeholder="Describe how this Calendly integration will be used"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
                {descError && <p className="text-red-400 text-sm mt-1 font-medium">{descError}</p>}
              </div>
            </div>
          </div>

          {/* API Configuration Section */}
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shadow-lg">
                <Key className="text-blue-400" size={18} />
              </div>
              <h3 className="text-lg font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">API Configuration</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Calendly API Key *</label>
                <input
                  type="password"
                  className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm"
                  placeholder="Enter your Calendly Personal Access Token"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                {apiKeyError && <p className="text-red-400 text-sm mt-1 font-medium">{apiKeyError}</p>}
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                    <Shield className="text-blue-400" size={14} />
                  </div>
                  <span className="text-blue-200 text-sm font-semibold">How to get your API Key:</span>
                </div>
                <ol className="text-blue-100/80 text-xs space-y-2 pl-4 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">1.</span>
                    <span>Go to Calendly Developer Settings in your account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">2.</span>
                    <span>Generate a Personal Access Token with required permissions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">3.</span>
                    <span>Copy and paste the token in the field above</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                  <X size={12} className="text-red-400" />
                </div>
                <p className="text-red-300 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Test Success Display */}
          {testPassed && (
            <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <CheckCircle size={12} className="text-emerald-400" />
                </div>
                <p className="text-emerald-300 text-sm font-medium">✅ API Key validated successfully!</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-700/50">
            <button
              onClick={handleTestApiKey}
              disabled={isTestingKey}
              className="flex-1 px-4 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-600 disabled:opacity-75 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:scale-105 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isTestingKey ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube size={16} />
                    Test API Key
                  </>
                )}
              </span>
            </button>

            <button
              onClick={handleAddInstructions}
              disabled={!testPassed || !hasBeenSaved || isAddingInstructions}
              className="flex-1 px-4 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/20 transform hover:scale-105 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isAddingInstructions ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Wand2 size={16} />
                    Add Instructions
                  </>
                )}
              </span>
            </button>

            <button
              onClick={handleSave}
              disabled={!testPassed || isSaving}
              className="flex-1 px-4 py-3.5 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 transform hover:scale-105 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Integration
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}