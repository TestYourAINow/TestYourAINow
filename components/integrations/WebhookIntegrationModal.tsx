"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Link, X, TestTube, Plus, Wand2, Save, Trash2 } from "lucide-react";
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
            <Link className="text-blue-400" size={24} />
            <h2 className="text-2xl font-bold text-white">
              Webhook Integration
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
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <Link className="text-blue-400" size={20} />
              <h3 className="text-lg font-semibold text-blue-200">Basic Information</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Webhook Name *</label>
                <input
                  className="w-full px-4 py-3 border-2 border-gray-500 bg-gray-600 text-white rounded-lg outline-none focus:border-blue-500 transition-colors duration-150 placeholder-gray-400"
                  placeholder="Enter webhook name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {nameError && <p className="text-red-400 text-sm mt-1">{nameError}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                <textarea
                  className="w-full px-4 py-3 border-2 border-gray-500 bg-gray-600 text-white rounded-lg outline-none focus:border-blue-500 transition-colors duration-150 placeholder-gray-400 resize-none"
                  placeholder="Describe what this webhook does"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
                {descError && <p className="text-red-400 text-sm mt-1">{descError}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Webhook URL *</label>
                <input
                  className="w-full px-4 py-3 border-2 border-gray-500 bg-gray-600 text-white rounded-lg outline-none focus:border-blue-500 transition-colors duration-150 placeholder-gray-400"
                  placeholder="https://example.com/webhook"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                {urlError && <p className="text-red-400 text-sm mt-1">{urlError}</p>}
              </div>
            </div>
          </div>

          {/* Data Fields Section */}
          <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <div className="w-4 h-4 bg-purple-400 rounded"></div>
                </div>
                <h3 className="text-lg font-semibold text-purple-200">Data Fields</h3>
              </div>
              <button
                onClick={() => setFields([...fields, { key: "", value: "" }])}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
              >
                <Plus size={16} />
                Add Field
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={index} className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                  <div className="flex gap-3 mb-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-400 mb-1">Field Name</label>
                      <input
                        placeholder="field_name"
                        className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg outline-none focus:border-purple-500 transition-colors text-sm"
                        value={field.key}
                        onChange={(e) => handleFieldChange(index, e.target.value, field.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-400 mb-1">Description</label>
                      <input
                        placeholder="Describe what this field contains"
                        className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg outline-none focus:border-purple-500 transition-colors text-sm"
                        value={field.value}
                        onChange={(e) => handleFieldChange(index, field.key, e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => handleRemoveField(index)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Remove field"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {field.key && (
                    <div className="text-xs text-gray-400 bg-gray-900/50 px-2 py-1 rounded font-mono">
                      Preview: <span className="text-green-400">{field.key.trim().replace(/\s+/g, "_")}_testvalue</span>
                    </div>
                  )}

                  {fieldErrors[index] && (
                    <p className="text-red-400 text-xs mt-1">{fieldErrors[index]}</p>
                  )}
                </div>
              ))}
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
              <p className="text-green-300 text-sm">✅ Webhook test passed successfully!</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              onClick={handleTest}
              disabled={isTesting}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-700 disabled:opacity-75 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium"
            >
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
                  Save Webhook
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}