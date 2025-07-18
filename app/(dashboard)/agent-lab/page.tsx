"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import SelectIntegrationModal, { IntegrationType } from "@/components/integrations/SelectIntegrationModal";
import WebhookIntegrationModal from "@/components/integrations/WebhookIntegrationModal";
import CalendlyIntegrationModal from "@/components/integrations/CalendlyIntegrationModal";
import FileUploadIntegrationModal from "@/components/integrations/FileUploadIntegrationModal";
import RequireApiKey from "@/components/RequireApiKey";
import { AgentIntegration } from "@/types/integrations";
import { 
  Settings, User, Bot, MessageCircle, Globe, Info, Code, TestTube, Zap, X, Check, 
  Edit, Trash2, Activity, Beaker, ChevronDown, MoreVertical, Circle
} from "lucide-react";

type Agent = {
  _id: string;
  name: string;
  openaiModel: string;
  temperature: number;
  top_p: number;
};

type AgentVersion = { 
  _id: string; 
  createdAt: string;
};

type UploadedFile = { 
  url: string; 
  path?: string;
};

type ChatMessage = { 
  role: "user" | "assistant"; 
  content: string; 
};

// Composant pour le statut d'intégration
const IntegrationStatus = ({ type, isActive = true }: { type: string; isActive?: boolean }) => {
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
      isActive 
        ? 'bg-green-500/20 text-green-400' 
        : 'bg-gray-500/20 text-gray-400'
    }`}>
      <Circle size={6} className={isActive ? 'fill-green-400' : 'fill-gray-400'} />
      {isActive ? 'Active' : 'Inactive'}
    </div>
  );
};

// Composant pour les actions d'intégration
const IntegrationActions = ({ 
  integration, 
  onEdit, 
  onDelete 
}: { 
  integration: AgentIntegration; 
  onEdit: () => void; 
  onDelete: () => void; 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(false);
    };

    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowDropdown(!showDropdown);
        }}
        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
      >
        <MoreVertical size={16} />
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 top-full mt-1 bg-gray-700 border border-gray-500 rounded-lg shadow-2xl z-50 min-w-[120px] py-1 backdrop-blur-sm">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Edit clicked for:', integration.name);
              onEdit();
              setShowDropdown(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:text-white hover:bg-gray-600 transition-colors text-left"
          >
            <Edit size={14} />
            Edit
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Delete clicked for:', integration.name);
              onDelete();
              setShowDropdown(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/30 transition-colors text-left"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default function AgentLab() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [versions, setVersions] = useState<AgentVersion[]>([]);
  const [integrations, setIntegrations] = useState<AgentIntegration[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [initialPrompt, setInitialPrompt] = useState("");
  const [openaiModel, setOpenaiModel] = useState("gpt-4o");
  const [temperature, setTemperature] = useState(0.3);
  const [topP, setTopP] = useState(1);
  const [mode, setMode] = useState<"prompter" | "test">("prompter");
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddIntegrationModal, setShowAddIntegrationModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [editWebhook, setEditWebhook] = useState<AgentIntegration | null>(null);
  const [editCalendly, setEditCalendly] = useState<AgentIntegration | null>(null);
  const [showCalendlyModal, setShowCalendlyModal] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [editFiles, setEditFiles] = useState<AgentIntegration | null>(null);
  
  // États pour AI Prompter
  const [userInstruction, setUserInstruction] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [suggestedPrompt, setSuggestedPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [diff, setDiff] = useState<any[] | null>(null);
  const [diffPrompt, setDiffPrompt] = useState<string | null>(null);
  const [chatMessagesTestAI, setChatMessagesTestAI] = useState<{ role: "user" | "assistant", content: string }[]>([]);
  const [testMessage, setTestMessage] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Refreshing the prompt
  const refreshPrompt = async (agentId: string) => {
    const res = await fetch(`/api/agents/${agentId}/prompt`);
    const data = await res.json();
    setPrompt(data.prompt || "");
  };

  useEffect(() => {
    fetch("/api/agents")
      .then((res) => res.json())
      .then((data) => setAgents(data.agents || []));
  }, []);

  // Auto-select agent from URL
  useEffect(() => { 
    const idFromUrl = searchParams.get("agentId"); 
    if (idFromUrl && agents.length > 0 && !selectedAgentId) { 
      handleAgentSelect(idFromUrl); 
    } 
  }, [agents, searchParams, selectedAgentId]);

  // Load integrations when agent is selected
  useEffect(() => {
    const fetchIntegrations = async () => {
      if (!selectedAgentId) return;
      try {
        const res = await fetch(`/api/agents/${selectedAgentId}/integrations`);
        const data = await res.json();
        setIntegrations(data.integrations || []);
      } catch (error) {
        console.error("Failed to fetch integrations", error);
      }
    };
    fetchIntegrations();
  }, [selectedAgentId]);

  const handleAgentSelect = async (id: string) => {
    const selected = agents.find((a) => a._id === id);
    if (!selected) return;

    setSelectedAgentId(id);
    setOpenaiModel(selected.openaiModel);
    setTemperature(selected.temperature);
    setTopP(selected.top_p);
    
    // Réinitialiser les messages du AI Prompter
    setMessages([]);
    setUserInstruction("");
    setSuggestedPrompt("");
    setAiSummary("");
    setDiff(null);
    setDiffPrompt(null);
    setChatMessagesTestAI([]);
    setTestMessage("");

    try {
      const res = await fetch(`/api/agents/${id}/prompt`);
      const data = await res.json();
      const loadedPrompt = data.prompt || "";
      setPrompt(loadedPrompt);
      setInitialPrompt(loadedPrompt);

      const versionRes = await fetch(`/api/agents/${id}/versions`);
      const versionData = await versionRes.json();
      const allVersions = versionData.versions || [];
      setVersions(allVersions);

      if (allVersions.length > 0) {
        const latest = allVersions[0];
        setSelectedVersionId(latest._id);
      } else {
        setSelectedVersionId(null);
      }
    } catch {
      setPrompt("");
      setVersions([]);
      setSelectedVersionId(null);
      setIntegrations([]);
    }
    
    router.push(`?agentId=${id}`);
  };
  
  // Fonction pour le AI Prompter
  const handleSendInstruction = async () => {
    if (!userInstruction.trim() || !selectedAgentId) return;
    
    setMessages(prev => [...prev, { role: "user", content: userInstruction }]);
    setIsThinking(true);
    setUserInstruction("");
    
    try {
      const res = await fetch(`/api/agents/${selectedAgentId}/ai-prompter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction: userInstruction,
          prompt,
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI Prompter error");
      
      setMessages(prev => [...prev, { role: "assistant", content: data.summary }]);
      setAiSummary(data.summary);
      setSuggestedPrompt(data.rewrittenPrompt);
      setDiff(data.diff);
      setDiffPrompt(data.diffPrompt);
    } catch (err: any) {
      toast.error(err.message || "AI Prompter failed");
    } finally {
      setIsThinking(false);
    }
  };

  // Fonction pour tester l'agent AI
  const handleSendTestMessage = async () => {
    if (!selectedAgentId || !testMessage.trim()) return;
    
    setIsThinking(true);
    
    const newUserMessage: { role: "user"; content: string } = {
      role: "user",
      content: testMessage.trim(),
    };
    
    const updatedHistory: { role: "user" | "assistant"; content: string }[] = [
      ...chatMessagesTestAI,
      newUserMessage,
    ];
    
    setChatMessagesTestAI(updatedHistory);
    setTestMessage("");
    
    try {
      const res = await fetch(`/api/agents/${selectedAgentId}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: testMessage,
          previousMessages: updatedHistory,
        }),
      });
      
      const data = await res.json();
      
      const newAssistantMessage: { role: "assistant"; content: string } = {
        role: "assistant",
        content: data.reply,
      };
      
      setChatMessagesTestAI([...updatedHistory, newAssistantMessage]);
    } catch (err: any) {
      toast.error(err.message || "Test AI failed");
    } finally {
      setIsThinking(false);
    }
  };

  const handleSave = async () => {
    if (!selectedAgentId) return;
    if (!prompt.trim()) {
      toast.error("Prompt is empty, please write something.");
      return;
    }

    setIsSaving(true);

    try {
      // Step 1: Update the agent BEFORE creating the version
      const agentUpdateRes = await fetch(`/api/agents/${selectedAgentId}?id=${selectedAgentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          openaiModel,
          temperature,
          top_p: topP,
          integrations,
        }),
      });

      if (!agentUpdateRes.ok) {
        toast.error("Error updating agent parameters.");
        return;
      }

      // Step 2: Create the new version
      const versionRes = await fetch(`/api/agents/${selectedAgentId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          openaiModel,
          temperature,
          top_p: topP,
        }),
      });

      if (!versionRes.ok) {
        toast.error("Error creating version.");
        return;
      }

      const versionData = await versionRes.json();
      const newVersion = versionData.version;
      setVersions((prev) => [newVersion, ...prev]);
      setSelectedVersionId(newVersion._id);

      // Step 3: Update the final prompt
      const updateRes = await fetch(`/api/agents/${selectedAgentId}/prompt`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!updateRes.ok) {
        toast.error("Version created, but error updating final prompt.");
        return;
      }

      toast.success("Version saved and prompt updated!");
    } catch (error) {
      toast.error("An error occurred during saving.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteIntegration = async (name: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this integration?");
    if (!confirmed || !selectedAgentId) return;
    
    const integration = integrations.find(i => i.name === name);
    
    // Si c'est une intégration de type "files", supprimer les fichiers du bucket
    if (integration?.type === "files" && Array.isArray(integration.files)) {
      const filePaths = integration.files
        .map((f: any) => f.path)
        .filter((p): p is string => !!p);
      
      if (filePaths.length > 0) {
        await fetch(`/api/agents/${selectedAgentId}/upload`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paths: filePaths }),
        });
        
        // Supprime aussi dans AgentKnowledge
        await fetch(`/api/agents/${selectedAgentId}/knowledge`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paths: filePaths }),
        });
      }
    }
    
    // Supprimer du state + BDD
    const updated = integrations.filter((i) => i.name !== name);
    setIntegrations(updated);
    
    await fetch(`/api/agents/${selectedAgentId}?id=${selectedAgentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ integrations: updated }),
    });
    
    toast.success("Integration deleted");
  };

  const refreshIntegrations = async () => {
    if (!selectedAgentId) return;
    const res = await fetch(`/api/agents/${selectedAgentId}/integrations`);
    const data = await res.json();
    setIntegrations(data.integrations || []);
  };

  // Vérifier si le prompt a été modifié
  const isModified = prompt !== initialPrompt;
  const selectedAgentName = agents.find(a => a._id === selectedAgentId)?.name;

  return (
    <RequireApiKey>
      <div className="min-h-screen bg-transparent">
        <div className="flex justify-center min-h-screen py-6">
          <div className="w-full max-w-7xl mx-auto px-6">
            {/* Header amélioré */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-purple-600 rounded-xl">
                  <Beaker className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    The Agent Lab
                  </h1>
                  <p className="text-sm text-gray-400">
                    Build and test your AI agents with advanced prompting tools
                  </p>
                </div>
                {/* Indicateur de modification */}
                {isModified && (
                  <div className="ml-auto flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2">
                    <Circle size={8} className="fill-orange-400 text-orange-400" />
                    <span className="text-orange-400 text-sm font-medium">Unsaved changes</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', height: 'calc(100vh - 200px)', gap: '24px' }}>
              {/* LEFT PANEL */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl text-white overflow-hidden" style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                  
                  {/* Configuration Générale */}
                  <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Settings className="text-blue-400" size={20} />
                      <h3 className="text-lg font-semibold text-blue-200">General Configuration</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Select a Build
                          </label>
                          <select
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                              backgroundPosition: 'right 0.5rem center',
                              backgroundRepeat: 'no-repeat',
                              backgroundSize: '1.5em 1.5em',
                              appearance: 'none'
                            }}
                            value={selectedAgentId ?? ""}
                            onChange={(e) => handleAgentSelect(e.target.value)}
                          >
                            <option value="" className="bg-gray-700 text-gray-400">Select a build...</option>
                            {agents.map((agent) => (
                              <option key={agent._id} value={agent._id} className="bg-gray-700 text-white hover:bg-gray-600">
                                {agent.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-[200px]">
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Version
                          </label>
                          <select 
                            className={`w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150 ${!selectedAgentId ? 'opacity-50 cursor-not-allowed' : ''}`}
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                              backgroundPosition: 'right 0.5rem center',
                              backgroundRepeat: 'no-repeat',
                              backgroundSize: '1.5em 1.5em',
                              appearance: 'none'
                            }}
                            disabled={!selectedAgentId || versions.length === 0}
                            value={selectedVersionId ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "__delete__") {
                                setShowDeleteModal(true);
                                return;
                              }
                              setSelectedVersionId(value);
                              fetch(`/api/agents/${selectedAgentId}/versions/${value}`)
                                .then((res) => res.json())
                                .then((data) => {
                                  if (data.version) {
                                    setPrompt(data.version.prompt);
                                    setOpenaiModel(data.version.openaiModel);
                                    setTemperature(data.version.temperature);
                                    setTopP(data.version.top_p);
                                  }
                                });
                            }}
                          >
                            {versions.length === 0 ? (
                              <option value="" className="bg-gray-700 text-gray-300">No version yet</option>
                            ) : (
                              <>
                                <option disabled value="" className="bg-gray-700 text-gray-400">Select a version</option>
                                {versions.map((v) => (
                                  <option key={v._id} value={v._id} className="bg-gray-700 text-white hover:bg-gray-600">
                                    {new Date(v.createdAt).toLocaleString()}
                                  </option>
                                ))}
                                <option value="__delete__" className="bg-red-900/20 text-red-400 border-t border-gray-600">
                                   Delete a version
                                </option>
                              </>
                            )}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Configuration du Prompt */}
                  <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Code className="text-blue-400" size={20} />
                      <h3 className="text-lg font-semibold text-blue-200">Prompt Setup</h3>
                    </div>
                    
                    {diffPrompt ? (
                      <div 
                        className="bg-gray-800 border border-gray-600 rounded-lg p-4 text-sm text-white whitespace-pre-wrap max-h-[400px] overflow-y-auto custom-scrollbar" 
                        dangerouslySetInnerHTML={{ __html: diffPrompt }}
                      />
                    ) : (
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter your prompt here..."
                        className={cn(
                          "w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150 placeholder-gray-400 h-64 resize-y custom-scrollbar",
                          !selectedAgentId ? "opacity-50 cursor-not-allowed" : ""
                        )}
                        disabled={!selectedAgentId}
                      />
                    )}
                  </div>

                  {/* Paramètres du Modèle */}
                  <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Bot className="text-blue-400" size={20} />
                      <h3 className="text-lg font-semibold text-blue-200">Model Settings</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">Model</label>
                        <select
                          value={openaiModel}
                          onChange={(e) => setOpenaiModel(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: 'right 0.5rem center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '1.5em 1.5em',
                            appearance: 'none'
                          }}
                          disabled={!selectedAgentId}
                        >
                          <option value="gpt-4o" className="bg-gray-700 text-white">gpt-4o</option>
                          <option value="gpt-4" className="bg-gray-700 text-white">gpt-4</option>
                          <option value="gpt-3.5-turbo" className="bg-gray-700 text-white">gpt-3.5-turbo</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Temperature: {temperature.toFixed(2)}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={temperature}
                          onChange={(e) => setTemperature(parseFloat(e.target.value))}
                          className={`w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider ${!selectedAgentId ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={!selectedAgentId}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Top P: {topP.toFixed(2)}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={topP}
                          onChange={(e) => setTopP(parseFloat(e.target.value))}
                          className={`w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider ${!selectedAgentId ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={!selectedAgentId}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Intégrations améliorées */}
                  <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Zap className="text-blue-400" size={20} />
                      <h3 className="text-lg font-semibold text-blue-200">Integrations</h3>
                      {integrations.length > 0 && (
                        <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full">
                          {integrations.length}
                        </span>
                      )}
                    </div>
                    
                    {integrations.length === 0 ? (
                      <div className="text-center py-6">
                        <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm mb-3">No integrations yet</p>
                        <p className="text-gray-500 text-xs">Add integrations to enhance your AI agent's capabilities</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {integrations.map((integration, idx) => (
                          <div key={idx} className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-white font-medium">{integration.name}</h4>
                                  <IntegrationStatus type={integration.type} />
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  <span className="bg-gray-700 px-2 py-1 rounded capitalize">
                                    {integration.type}
                                  </span>
                                  <span>•</span>
                                  <span>
                                    {integration.type === "files" 
                                      ? `${integration.files?.length || 0} file(s)` 
                                      : integration.url || "No URL"
                                    }
                                  </span>
                                </div>
                              </div>
                              
                              <IntegrationActions
                                integration={integration}
                                onEdit={() => {
                                  if (integration.type === "webhook") {
                                    setEditWebhook(integration);
                                    setShowWebhookModal(true);
                                  } else if (integration.type === "calendly") {
                                    setEditCalendly(integration);
                                    setShowCalendlyModal(true);
                                  } else if (integration.type === "files") {
                                    setEditFiles(integration);
                                    setTimeout(() => setShowFileUploadModal(true), 0);
                                  }
                                }}
                                onDelete={() => handleDeleteIntegration(integration.name)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <button 
                      onClick={() => setShowAddIntegrationModal(true)}
                      className={`mt-4 w-full border-2 border-dashed border-gray-600 hover:border-blue-500 text-gray-400 hover:text-blue-400 transition-colors py-3 rounded-lg flex items-center justify-center gap-2 ${!selectedAgentId ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!selectedAgentId}
                    >
                      <Zap size={16} />
                      Add Integration
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4">
                    <button 
                      onClick={handleSave}
                      className={cn(
                        "w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl",
                        (!selectedAgentId || isSaving || !isModified) && "opacity-50 cursor-not-allowed"
                      )}
                      disabled={!selectedAgentId || isSaving || !isModified}
                    >
                      {isSaving ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Settings className="w-5 h-5" />
                          Save Configuration
                        </>
                      )}
                    </button>
                  </div>

                  {/* Informations de l'Agent - avec fond bleu */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Info className="text-blue-400" size={20} />
                      <h3 className="text-lg font-semibold text-blue-200">Agent Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-800/30 rounded-lg p-3">
                        <div className="text-gray-400 text-xs mb-1">Agent</div>
                        <div className="text-white font-medium truncate">{selectedAgentName || 'None selected'}</div>
                      </div>
                      <div className="bg-gray-800/30 rounded-lg p-3">
                        <div className="text-gray-400 text-xs mb-1">Model</div>
                        <div className="text-white">{openaiModel}</div>
                      </div>
                      <div className="bg-gray-800/30 rounded-lg p-3">
                        <div className="text-gray-400 text-xs mb-1">Temperature</div>
                        <div className="text-white">{temperature.toFixed(2)}</div>
                      </div>
                      <div className="bg-gray-800/30 rounded-lg p-3">
                        <div className="text-gray-400 text-xs mb-1">Top P</div>
                        <div className="text-white">{topP.toFixed(2)}</div>
                      </div>
                      <div className="bg-gray-800/30 rounded-lg p-3">
                        <div className="text-gray-400 text-xs mb-1">Integrations</div>
                        <div className="text-white">{integrations.length}</div>
                      </div>
                      <div className="bg-gray-800/30 rounded-lg p-3">
                        <div className="text-gray-400 text-xs mb-1">Versions</div>
                        <div className="text-white">{versions.length}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT PANEL */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl text-white overflow-hidden" style={{ width: '400px', display: 'flex', flexDirection: 'column' }}>
                
                {/* Mode Toggle amélioré */}
                <div className="border-b border-gray-700 bg-gray-800/50 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <TestTube className="text-purple-400" size={20} />
                    <h3 className="text-lg font-semibold text-purple-200">Testing Suite</h3>
                  </div>
                  
                  <div className="flex bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setMode("prompter")}
                      className={cn(
                        "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2",
                        mode === "prompter" 
                          ? "bg-blue-600 text-white shadow-lg" 
                          : "text-gray-300 hover:text-white hover:bg-gray-600"
                      )}
                      disabled={!selectedAgentId}
                    >
                      <Beaker className="w-4 h-4" />
                      AI Prompter
                    </button>
                    <button
                      onClick={() => setMode("test")}
                      className={cn(
                        "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2",
                        mode === "test" 
                          ? "bg-blue-600 text-white shadow-lg" 
                          : "text-gray-300 hover:text-white hover:bg-gray-600"
                      )}
                      disabled={!selectedAgentId}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Test AI
                    </button>
                  </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 p-4 text-sm text-gray-300 overflow-y-auto custom-scrollbar">
                  {!selectedAgentId ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Bot className="w-16 h-16 text-gray-600 mb-4" />
                      <h3 className="text-lg font-medium text-gray-400 mb-2">No Agent Selected</h3>
                      <p className="text-gray-500 text-sm">Select an agent to start testing</p>
                    </div>
                  ) : mode === "test" ? (
                    <>
                      {chatMessagesTestAI.length === 0 && !isThinking && (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <MessageCircle className="w-12 h-12 text-gray-600 mb-3" />
                          <p className="text-gray-400 text-sm mb-2">Start a conversation</p>
                          <p className="text-gray-500 text-xs">Ask your AI something to test its responses</p>
                        </div>
                      )}
                      
                      <div className="flex flex-col gap-3 mb-4">
                        {chatMessagesTestAI.map((msg, i) => (
                          <div
                            key={i}
                            className={cn(
                              "px-4 py-3 rounded-lg text-sm whitespace-pre-wrap max-w-[85%] shadow-sm",
                              msg.role === "user"
                                ? "self-end bg-blue-600 text-white"
                                : "self-start bg-gray-700/50 text-gray-100 border border-gray-600"
                            )}
                          >
                            <strong className="block text-xs mb-1 opacity-75">
                              {msg.role === "user" ? "You" : "AI"}
                            </strong>
                            {msg.content}
                          </div>
                        ))}
                        
                        {isThinking && (
                          <div className="flex items-center gap-2 text-gray-400 text-sm mt-2 px-2">
                            <span className="inline-block w-3 h-3 border-2 border-t-transparent border-blue-400 rounded-full animate-spin" />
                            AI is thinking...
                          </div>
                        )}
                      </div>

                      {chatMessagesTestAI.length > 0 && (
                        <div className="flex justify-center mb-3">
                          <button
                            onClick={() => setChatMessagesTestAI([])}
                            className="text-xs text-gray-400 hover:text-red-400 transition px-3 py-1 rounded-lg hover:bg-red-900/20"
                          >
                            Clear Chat
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {!suggestedPrompt && !aiSummary && messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <Beaker className="w-12 h-12 text-gray-600 mb-3" />
                          <p className="text-gray-400 text-sm mb-2">AI Prompt Assistant</p>
                          <p className="text-gray-500 text-xs">Tell the AI what to improve in your prompt</p>
                        </div>
                      )}
                      
                      {/* Chat Messages Display */}
                      <div className="flex flex-col gap-3 mb-4">
                        {messages.map((msg, i) => (
                          <div key={i} className={cn(
                            "px-4 py-3 rounded-lg text-sm whitespace-pre-wrap max-w-[85%] shadow-sm",
                            msg.role === "user" 
                              ? "self-end bg-blue-600 text-white" 
                              : "self-start bg-gray-700/50 text-gray-100 border border-gray-600"
                          )}>
                            <strong className="block text-xs mb-1 opacity-75">
                              {msg.role === "user" ? "You" : "Prompt AI"}
                            </strong>
                            {msg.content}
                          </div>
                        ))}
                        
                        {isThinking && (
                          <div className="flex items-center gap-2 text-gray-400 text-sm mt-2 px-2">
                            <span className="inline-block w-3 h-3 border-2 border-t-transparent border-blue-400 rounded-full animate-spin" />
                            AI is analyzing your prompt...
                          </div>
                        )}
                      </div>

                      {/* Affichage du diff */}
                      {suggestedPrompt && diff && (
                        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 mb-4 text-sm leading-relaxed max-w-[85%] self-start">
                          <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
                            <Code size={12} />
                            Suggested changes
                          </div>
                          <div className="whitespace-pre-wrap">
                            {diff.map((part, i) => (
                              <span key={i} className={
                                part.added ? "text-green-400 bg-green-900/20 px-1 rounded-sm" : 
                                part.removed ? "text-red-400 bg-red-900/20 line-through px-1 rounded-sm" : 
                                "text-white"
                              }>
                                {part.value}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Boutons d'action */}
                      {suggestedPrompt && (
                        <div className="flex justify-start gap-2 mb-4 max-w-[85%] self-start">
                          <button
                            onClick={() => {
                              setSuggestedPrompt("");
                              setAiSummary("");
                              setDiff(null);
                              setDiffPrompt(null);
                            }}
                            className="bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Reject
                          </button>
                          <button
                            onClick={() => {
                              setPrompt(suggestedPrompt);
                              setSuggestedPrompt("");
                              setAiSummary("");
                              setDiff(null);
                              setDiffPrompt(null);
                              toast.success("Prompt updated!");
                            }}
                            className="bg-green-600 hover:bg-green-500 text-white text-xs px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Accept
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Input Area améliorée */}
                <div className="border-t border-gray-700 bg-gray-800/50 p-4">
                  <div className="space-y-3">
                    <textarea
                      placeholder={mode === "prompter" ? "Describe what you want to improve in your prompt..." : "Type your message here..."}
                      rows={3}
                      className={`bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-sm w-full resize-none text-white placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${!selectedAgentId ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={!selectedAgentId}
                      readOnly={isThinking}
                      value={mode === "prompter" ? userInstruction : testMessage}
                      onChange={(e) => {
                        if (mode === "prompter") {
                          setUserInstruction(e.target.value);
                        } else {
                          setTestMessage(e.target.value);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (mode === "prompter") {
                            handleSendInstruction();
                          } else {
                            handleSendTestMessage();
                          }
                        }
                      }}
                    />
                    
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Enter</kbd> to send • <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Shift+Enter</kbd> for new line
                      </div>
                      
                      <button 
                        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                          (mode === "prompter" ? userInstruction.trim() : testMessage.trim()) && selectedAgentId && !isThinking
                            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg" 
                            : "bg-gray-600 text-gray-400 cursor-not-allowed"
                        }`} 
                        disabled={!(mode === "prompter" ? userInstruction.trim() : testMessage.trim()) || !selectedAgentId || isThinking}
                        onClick={mode === "prompter" ? handleSendInstruction : handleSendTestMessage}
                      >
                        {isThinking ? (
                          <>
                            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs">Processing...</span>
                          </>
                        ) : (
                          <>
                            <span className="text-sm">Send</span>
                          </>
                        )}
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-500 text-center">
                      You are using your own API key. Monitor your usage carefully.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Modal avec style premium */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => setShowDeleteModal(false)}
            />
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl w-full max-w-md p-6 text-white relative z-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-600 rounded-lg">
                  <Trash2 className="text-white" size={16} />
                </div>
                <h2 className="text-xl font-semibold text-white">Delete Version</h2>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                {versions.map((version, i) => {
                  const isLatest = i === 0;
                  return (
                    <div
                      key={version._id}
                      className="flex justify-between items-center bg-gray-700/50 border border-gray-600 px-4 py-3 rounded-lg"
                    >
                      <span className="text-sm text-white">{new Date(version.createdAt).toLocaleString()}</span>
                      {isLatest ? (
                        <span className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded flex items-center gap-1">
                          <Circle size={4} className="fill-green-400" />
                          Latest
                        </span>
                      ) : (
                        <button
                          className="text-red-400 text-sm hover:text-red-300 px-3 py-1 rounded-lg transition-colors hover:bg-red-900/20 flex items-center gap-1"
                          onClick={async () => {
                            const res = await fetch(
                              `/api/agents/${selectedAgentId}/versions/${version._id}`,
                              { method: "DELETE" }
                            );

                            if (res.ok) {
                              toast.success("Version deleted");

                              const updatedVersions = versions.filter((v) => v._id !== version._id);
                              setVersions(updatedVersions);

                              if (selectedVersionId === version._id && updatedVersions.length > 0) {
                                const newVersion = updatedVersions[0];
                                setSelectedVersionId(newVersion._id);

                                const fetchRes = await fetch(`/api/agents/${selectedAgentId}/versions/${newVersion._id}`);
                                const data = await fetchRes.json();
                                if (data.version) {
                                  setPrompt(data.version.prompt);
                                  setOpenaiModel(data.version.openaiModel);
                                  setTemperature(data.version.temperature);
                                  setTopP(data.version.top_p);
                                }
                              }
                            } else {
                              const errorData = await res.json();
                              toast.error(errorData.error || "Could not delete version");
                            }
                          }}
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Modals */}
        {showAddIntegrationModal && (
          <SelectIntegrationModal 
            onClose={() => setShowAddIntegrationModal(false)} 
            onSelect={(type: IntegrationType) => {
              setShowAddIntegrationModal(false);
              if (type === "webhook") setShowWebhookModal(true);
              else if (type === "calendly") setShowCalendlyModal(true);
              else if (type === "files") setShowFileUploadModal(true);
            }}
            existingIntegrations={integrations}
          />
        )}

        {showWebhookModal && selectedAgentId && (
          <WebhookIntegrationModal 
            agentId={selectedAgentId}
            initialData={editWebhook ?? undefined}
            onClose={() => {
              setShowWebhookModal(false);
              setEditWebhook(null);
            }}
            onSave={(webhookData) => {
              setIntegrations((prev) => {
                const exists = prev.find((w) => w.name === webhookData.name);
                if (exists) {
                  return prev.map((w) => w.name === webhookData.name ? webhookData : w);
                } else {
                  return [...prev, webhookData];
                }
              });
              refreshPrompt(selectedAgentId);
              toast.success("Webhook saved!");
            }}
          />
        )}

        {showCalendlyModal && selectedAgentId && (
          <CalendlyIntegrationModal 
            agentId={selectedAgentId}
            initialData={editCalendly ?? undefined}
            onClose={() => {
              setShowCalendlyModal(false);
              setEditCalendly(null);
            }}
            onSave={(data) => {
              setIntegrations((prev) => {
                const exists = prev.find((w) => w.name === data.name);
                if (exists) {
                  return prev.map((w) => w.name === data.name ? data : w);
                } else {
                  return [...prev, data];
                }
              });
              refreshPrompt(selectedAgentId);
              toast.success("Calendly saved!");
            }}
          />
        )}

        {showFileUploadModal && selectedAgentId && (
          <FileUploadIntegrationModal 
            agentId={selectedAgentId}
            initialData={editFiles ?? undefined}
            onClose={() => {
              setShowFileUploadModal(false);
              setEditFiles(null);
            }}
            onRefresh={refreshIntegrations}
          />
        )}

        {/* Custom Styles */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #6b7280;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
          }
          
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 20px;
            width: 20px;
            background: #3b82f6;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          }
          
          .slider::-moz-range-thumb {
            height: 20px;
            width: 20px;
            background: #3b82f6;
            border-radius: 50%;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          }
        `}</style>
      </div>
    </RequireApiKey>
  );
}