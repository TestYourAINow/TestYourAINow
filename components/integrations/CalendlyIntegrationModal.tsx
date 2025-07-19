"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Calendar, X, TestTube, Wand2, Save, Key } from "lucide-react";
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
  // ✅ Type narrowing spécifique à Calendly uniquement
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

      // ✅ Maintenant ce type est correctement défini
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
        body: JSON.stringify({ name, description }),
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
      // ✅ Ce type fonctionne aussi maintenant
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className="relative z-10 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl w-full max-w-2xl text-white overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800/50">
          <div className="flex items-center gap-3">
            <Calendar className="text-green-400" size={24} />
            <h2 className="text-2xl font-bold text-white">
              Calendly Integration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information Section */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="text-green-400" size={20} />
              <h3 className="text-lg font-semibold text-green-200">Integration Details</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Integration Name *</label>
                <input
                  className="w-full px-4 py-3 border-2 border-gray-500 bg-gray-600 text-white rounded-lg outline-none focus:border-green-500 transition-colors duration-150 placeholder-gray-400"
                  placeholder="Enter integration name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {nameError && <p className="text-red-400 text-sm mt-1">{nameError}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                <textarea
                  className="w-full px-4 py-3 border-2 border-gray-500 bg-gray-600 text-white rounded-lg outline-none focus:border-green-500 transition-colors duration-150 placeholder-gray-400 resize-none"
                  placeholder="Describe how this Calendly integration will be used"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
                {descError && <p className="text-red-400 text-sm mt-1">{descError}</p>}
              </div>
            </div>
          </div>

          {/* API Configuration Section */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <Key className="text-blue-400" size={20} />
              <h3 className="text-lg font-semibold text-blue-200">API Configuration</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Calendly API Key *</label>
              <input
                type="password"
                className="w-full px-4 py-3 border-2 border-gray-500 bg-gray-600 text-white rounded-lg outline-none focus:border-blue-500 transition-colors duration-150 placeholder-gray-400"
                placeholder="Enter your Calendly Personal Access Token"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              {apiKeyError && <p className="text-red-400 text-sm mt-1">{apiKeyError}</p>}
              
              <div className="mt-3 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                <p className="text-blue-200 text-sm font-medium mb-1">How to get your API Key:</p>
                <ol className="text-blue-100/80 text-xs space-y-1 pl-4">
                  <li>1. Go to Calendly Developer Settings</li>
                  <li>2. Generate a Personal Access Token</li>
                  <li>3. Copy and paste it above</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Test Success Display */}
          {testPassed && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <p className="text-green-300 text-sm">✅ API Key validated successfully!</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              onClick={handleTestApiKey}
              disabled={isTestingKey}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-700 disabled:opacity-75 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium"
            >
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
            </button>

            <button
              onClick={handleAddInstructions}
              disabled={!testPassed || !hasBeenSaved || isAddingInstructions}
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium"
            >
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
            </button>

            <button
              onClick={handleSave}
              disabled={!testPassed || isSaving}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium"
            >
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
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}