"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Link, X, TestTube, Plus, Wand2, Save, Trash2, Settings, Code, Zap } from "lucide-react";
import { AgentIntegration } from "@/types/integrations";

interface WebhookIntegrationModalProps {
  onClose: () => void;
  onSave: (webhook: AgentIntegration) => void;
  agentId: string;
  initialData?: AgentIntegration;
}

export default function WebhookIntegrationModal({
  onClose,
  onSave,
  agentId,
  initialData,
}: WebhookIntegrationModalProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.type === "webhook" ? initialData.description || "" : ""
  );
  const [url, setUrl] = useState(
    initialData?.type === "webhook" ? initialData.url || "" : ""
  );
  const [fields, setFields] = useState(
    initialData?.type === "webhook" && initialData.fields?.length
      ? initialData.fields
      : [{ key: "", value: "" }]
  );
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingInstructions, setIsAddingInstructions] = useState(false);
  const [testPassed, setTestPassed] = useState(false);
  const [hasBeenSaved, setHasBeenSaved] = useState(!!initialData);

  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [descError, setDescError] = useState("");
  const [urlError, setUrlError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);

  const handleTest = async () => {
    setIsTesting(true);
    setError("");
    setNameError("");
    setDescError("");
    setUrlError("");
    setFieldErrors([]);

    let hasError = false;

    if (!name.trim()) {
      setNameError("Webhook name is required");
      hasError = true;
    }

    if (!description.trim()) {
      setDescError("Integration description is required");
      hasError = true;
    }

    if (!url.trim()) {
      setUrlError("Webhook URL is required");
      hasError = true;
    } else if (!/^https?:\/\//.test(url)) {
      setUrlError("Invalid URL format");
      hasError = true;
    }

    const fieldErrs = fields.map((f) => {
      if (!f.key.trim()) return "At least one data field name is required";
      if (!f.value.trim()) return "Description is required for all data fields";
      return "";
    });

    if (fieldErrs.some((e) => e)) {
      setFieldErrors(fieldErrs);
      hasError = true;
    }

    if (hasError) {
      setIsTesting(false);
      return;
    }

    const payload = fields.reduce((acc, f) => {
      if (f.key.trim()) {
        const cleanKey = f.key.trim().replace(/\s+/g, "_");
        acc[cleanKey] = f.value || "";
      }
      return acc;
    }, {} as Record<string, string>);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setTestPassed(res.ok);
      if (!res.ok) setError("Test failed. Check the URL or the data sent.");
      else toast.success("Webhook test passed!");
    } catch {
      setTestPassed(false);
      setError("Test failed. Invalid URL or server not responding.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");

    const method = initialData ? "PUT" : "POST";
    const endpoint = initialData
      ? `/api/agents/${agentId}/integrations/${encodeURIComponent(initialData.name)}`
      : `/api/agents/${agentId}/integrations`;

    const cleanedFields = fields.filter((f) => f.key.trim() && f.value.trim());

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "webhook",
          name,
          description,
          url,
          fields: cleanedFields,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save.");
        return;
      }

      onSave({ type: "webhook", name, description, url, fields: cleanedFields, createdAt: new Date().toISOString() });
      setHasBeenSaved(true);
      onClose();
    } catch {
      setError("Error while saving the webhook.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddInstructions = async () => {
    if (!hasBeenSaved) {
      toast.warning("Please save the webhook first.");
      return;
    }

    setIsAddingInstructions(true);
    const cleanedFields = fields.filter((f) => f.key.trim() && f.value.trim());

    try {
      const res = await fetch("/api/generate-instructions-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookName: name,
          description,
          fields: cleanedFields,
        }),
      });

      if (!res.ok) {
        toast.error("Failed to generate instructions.");
        return;
      }

      const { instructions } = await res.json();

      const updatePromptRes = await fetch(`/api/agents/${agentId}/prompt`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appendInstructions: instructions,
          replaceInstructionsFor: name,
        }),
      });

      if (updatePromptRes.ok) {
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
                type: "webhook",
                name,
                description,
                url,
                fields: cleanedFields,
                createdAt: new Date(),
              },
            ],
          }),
        });

        if (versionRes.ok) {
          toast.success("Instructions added to prompt and new version created");
        } else {
          toast.error("Failed to create new version.");
        }

        onClose();
        onSave({ type: "webhook", name, description, url, fields: cleanedFields, createdAt: new Date().toISOString() });
      } else {
        toast.error("Failed to update prompt.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsAddingInstructions(false);
    }
  };

  const handleFieldChange = (index: number, key: string, value: string) => {
    const updated = [...fields];
    updated[index] = { key, value };
    setFields(updated);
  };

  const handleRemoveField = (index: number) => {
    const updated = [...fields];
    updated.splice(index, 1);
    setFields(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Modal Container */}
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/40 flex items-center justify-center shadow-lg backdrop-blur-sm">
              <Link className="text-blue-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Webhook Integration
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">Connect your agent to external APIs and services</p>
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
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shadow-lg">
                <Settings className="text-blue-400" size={18} />
              </div>
              <h3 className="text-lg font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">Basic Information</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Webhook Name *</label>
                <input
                  className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm"
                  placeholder="Enter webhook name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {nameError && <p className="text-red-400 text-sm mt-1">{nameError}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Description *</label>
                <textarea
                  className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm resize-none"
                  placeholder="Describe what this webhook does"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
                {descError && <p className="text-red-400 text-sm mt-1">{descError}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Webhook URL *</label>
                <input
                  className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm"
                  placeholder="https://example.com/webhook"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                {urlError && <p className="text-red-400 text-sm mt-1">{urlError}</p>}
              </div>
            </div>
          </div>

          {/* Data Fields Section */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shadow-lg">
                  <Code className="text-purple-400" size={18} />
                </div>
                <h3 className="text-lg font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">Data Fields</h3>
              </div>
              <button
                onClick={() => setFields([...fields, { key: "", value: "" }])}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-purple-500/20 transform hover:scale-105 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <Plus size={16} className="relative z-10" />
                <span className="relative z-10">Add Field</span>
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={index} className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm group hover:bg-gray-900/70 transition-all duration-200">
                  <div className="flex gap-3 mb-3">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Field Name</label>
                      <input
                        placeholder="field_name"
                        className="w-full px-3 py-2.5 bg-gray-800/80 border border-gray-600/50 text-white rounded-lg outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm font-medium backdrop-blur-sm"
                        value={field.key}
                        onChange={(e) => handleFieldChange(index, e.target.value, field.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Description</label>
                      <input
                        placeholder="Describe what this field contains"
                        className="w-full px-3 py-2.5 bg-gray-800/80 border border-gray-600/50 text-white rounded-lg outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all text-sm font-medium backdrop-blur-sm"
                        value={field.value}
                        onChange={(e) => handleFieldChange(index, field.key, e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => handleRemoveField(index)}
                        className="p-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 group-hover:scale-110"
                        title="Remove field"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {field.key && (
                    <div className="bg-gray-800/50 border border-gray-600/30 rounded-lg p-3">
                      <div className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">Preview JSON</div>
                      <div className="text-xs font-mono text-emerald-400 bg-gray-900/50 px-2 py-1 rounded border border-gray-700/50">
                        "{field.key.trim().replace(/\s+/g, "_")}": "test_value"
                      </div>
                    </div>
                  )}

                  {fieldErrors[index] && (
                    <p className="text-red-400 text-xs mt-2 font-medium">{fieldErrors[index]}</p>
                  )}
                </div>
              ))}
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
                  <Zap size={12} className="text-emerald-400" />
                </div>
                <p className="text-emerald-300 text-sm font-medium">✅ Webhook test passed successfully!</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-700/50">
            <button
              onClick={handleTest}
              disabled={isTesting}
              className="flex-1 px-4 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-600 disabled:opacity-75 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:scale-105 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isTesting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube size={16} />
                    Test Webhook
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
                    Save Webhook
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