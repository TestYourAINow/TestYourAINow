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
import AiModelDropdown from "@/components/Dropdowns/AiModelDropdown";
import ApiKeyDropdown, { ApiKeyOption } from "@/components/Dropdowns/ApiKeyDropdown";
import { AgentIntegration } from "@/types/integrations";
import { 
  Settings, User, Bot, MessageCircle, Globe, Info, Code, TestTube, Zap, X, Check, 
  Edit, Trash2, Activity, Beaker, ChevronDown, MoreVertical, Circle, Sparkles,
  Brain, Cpu, Gauge, Layers, Save, AlertTriangle, CheckCircle, Key
} from "lucide-react";

type Agent = {
  _id: string;
  name: string;
  openaiModel: string;
  temperature: number;
  top_p: number;
  apiKey?: string;
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

// ===== ENHANCED COMPONENTS =====

const IntegrationStatus = ({ type, isActive = true }: { type: string; isActive?: boolean }) => {
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
      isActive 
        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
        : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
    )}>
      <div className={cn(
        "w-1.5 h-1.5 rounded-full",
        isActive ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-gray-400'
      )} />
      {isActive ? 'Active' : 'Inactive'}
    </div>
  );
};

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
    const handleClickOutside = () => setShowDropdown(false);
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
        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 group"
      >
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-gray-500/0 to-gray-500/0 group-hover:from-gray-500/10 group-hover:to-gray-500/10 transition-all duration-200"></div>
        <MoreVertical size={14} className="relative z-10" />
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-50 min-w-[140px] py-2 animate-fade-in">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit();
              setShowDropdown(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:text-white hover:bg-gray-700/50 transition-all text-left group"
          >
            <Edit size={14} className="group-hover:scale-110 transition-transform" />
            Edit
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
              setShowDropdown(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all text-left group"
          >
            <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const SectionCard = ({ 
  icon, 
  title, 
  subtitle, 
  children, 
  className = "",
  headerAction,
  allowOverflow = false
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  allowOverflow?: boolean;
}) => (
  <div className={cn(
    "bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl",
    allowOverflow ? "overflow-visible" : "overflow-hidden",
    className
  )}>
    <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-600/20 border-2 border-blue-600/40 flex items-center justify-center shadow-lg">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {headerAction}
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

// ===== MAIN COMPONENT =====

export default function AgentLab() {
  // ===== EXISTING STATE (preserved) =====
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

  // ===== NOUVEAUX ÉTATS POUR API KEYS =====
  const [apiKeys, setApiKeys] = useState<ApiKeyOption[]>([]);
  const [showAddApiModal, setShowAddApiModal] = useState(false);
  const [selectedAgentApiKey, setSelectedAgentApiKey] = useState<string>("");
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // ===== FONCTION POUR CHARGER LES API KEYS =====
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

  // useEffect pour charger les API keys
  useEffect(() => {
    fetchApiKeys();
  }, []);

  // ===== EXISTING FUNCTIONS (preserved) =====
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

  useEffect(() => { 
    const idFromUrl = searchParams.get("agentId"); 
    if (idFromUrl && agents.length > 0 && !selectedAgentId) { 
      handleAgentSelect(idFromUrl); 
    } 
  }, [agents, searchParams, selectedAgentId]);

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
    setSelectedAgentApiKey(selected.apiKey || ""); // NOUVELLE LIGNE AJOUTÉE
    
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
      const agentUpdateRes = await fetch(`/api/agents/${selectedAgentId}?id=${selectedAgentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          openaiModel,
          temperature,
          top_p: topP,
          integrations,
          apiKey: selectedAgentApiKey, // NOUVELLE LIGNE AJOUTÉE
        }),
      });

      if (!agentUpdateRes.ok) {
        toast.error("Error updating agent parameters.");
        return;
      }

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

      const updateRes = await fetch(`/api/agents/${selectedAgentId}/prompt`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!updateRes.ok) {
        toast.error("Version created, but error updating final prompt.");
        return;
      }

      setInitialPrompt(prompt);
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
        
        await fetch(`/api/agents/${selectedAgentId}/knowledge`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paths: filePaths }),
        });
      }
    }
    
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

  // ===== COMPUTED VALUES =====
  const isModified = prompt !== initialPrompt;
  const selectedAgentName = agents.find(a => a._id === selectedAgentId)?.name;

  return (
    <RequireApiKey>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">

        <div className="relative z-10 min-h-screen py-8">
          <div className="max-w-7xl mx-auto px-6">
            
            {/* ===== ENHANCED HEADER ===== */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 p-0.5 shadow-2xl">
                      <div className="w-full h-full rounded-2xl bg-gray-900 flex items-center justify-center">
                        <Beaker className="text-white" size={28} />
                      </div>
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center">
                      <Sparkles className="text-gray-900" size={12} />
                    </div>
                  </div>
                  
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                      Agent Lab
                    </h1>
                    <p className="text-gray-400 text-lg">
                      Advanced AI agent development and testing environment
                    </p>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="flex items-center gap-4">
                  {selectedAgentName && (
                    <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-xl px-4 py-2 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-sm text-gray-300">
                        Editing: <span className="text-white font-medium">{selectedAgentName}</span>
                      </span>
                    </div>
                  )}
                  
                  {isModified && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-2 flex items-center gap-3 animate-fade-in">
                      <AlertTriangle size={16} className="text-orange-400" />
                      <span className="text-orange-400 text-sm font-medium">Unsaved changes</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ===== MAIN LAYOUT ===== */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
              
              {/* ===== LEFT PANEL - Configuration ===== */}
              <div className="xl:col-span-2 space-y-6 overflow-y-auto custom-scrollbar">
                
                {/* Agent Selection */}
                <SectionCard
                  icon={<Bot className="text-blue-400" size={24} />}
                  title="Agent Selection"
                  subtitle="Choose your AI agent and version"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-semibold text-gray-300 mb-3">
                        Select Agent
                      </label>
                      <select
                        className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm"
                        value={selectedAgentId ?? ""}
                        onChange={(e) => handleAgentSelect(e.target.value)}
                      >
                        <option value="" className="bg-gray-800 text-gray-400">Select an agent...</option>
                        {agents.map((agent) => (
                          <option key={agent._id} value={agent._id} className="bg-gray-800 text-white">
                            {agent.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">
                        Version
                      </label>
                      <select 
                        className={cn(
                          "w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm",
                          !selectedAgentId && 'opacity-50 cursor-not-allowed'
                        )}
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
                                setInitialPrompt(data.version.prompt);
                                setOpenaiModel(data.version.openaiModel);
                                setTemperature(data.version.temperature);
                                setTopP(data.version.top_p);
                              }
                            });
                        }}
                      >
                        {versions.length === 0 ? (
                          <option value="" className="bg-gray-800 text-gray-400">No versions yet</option>
                        ) : (
                          <>
                            <option disabled value="" className="bg-gray-800 text-gray-400">Select version...</option>
                            {versions.map((v) => (
                              <option key={v._id} value={v._id} className="bg-gray-800 text-white">
                                {new Date(v.createdAt).toLocaleString()}
                              </option>
                            ))}
                            <option value="__delete__" className="bg-red-900/20 text-red-400 border-t border-gray-600">
                               Delete version...
                            </option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                </SectionCard>

                {/* Prompt Configuration */}
                <SectionCard
                  icon={<Code className="text-purple-400" size={24} />}
                  title="System Prompt"
                  subtitle="Define your agent's behavior and instructions"
                >
                  {diffPrompt ? (
                    <div 
                      className="bg-gray-900/60 border border-gray-700/50 rounded-xl p-4 text-sm text-white whitespace-pre-wrap max-h-[400px] overflow-y-auto custom-scrollbar backdrop-blur-sm" 
                      dangerouslySetInnerHTML={{ __html: diffPrompt }}
                    />
                  ) : (
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Enter your system prompt here... This will define how your AI agent behaves and responds."
                      className={cn(
                        "w-full px-4 py-3.5 bg-gray-900/60 border border-gray-700/50 text-white rounded-xl outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder-gray-400 resize-none backdrop-blur-sm",
                        "min-h-[200px] custom-scrollbar",
                        !selectedAgentId && "opacity-50 cursor-not-allowed"
                      )}
                      disabled={!selectedAgentId}
                    />
                  )}
                </SectionCard>

                {/* Model Configuration */}
                <SectionCard
                  icon={<Brain className="text-cyan-400" size={24} />}
                  title="Model Parameters"
                  subtitle="Fine-tune your AI model settings"
                  allowOverflow={true}
                >
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">AI Model</label>
                        <AiModelDropdown
                          selectedModel={openaiModel}
                          onModelSelect={(modelId) => setOpenaiModel(modelId)}
                          disabled={!selectedAgentId}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">
                          API Key Project
                        </label>
                        <ApiKeyDropdown
                          selectedApiKey={selectedAgentApiKey}
                          onApiKeySelect={(keyId) => setSelectedAgentApiKey(keyId)}
                          onAddNewClick={() => setShowAddApiModal(true)}
                          apiKeys={apiKeys}
                          disabled={!selectedAgentId}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                          <Gauge size={16} className="text-cyan-400" />
                          Temperature: <span className="text-cyan-400 font-mono">{temperature.toFixed(2)}</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={temperature}
                          onChange={(e) => setTemperature(parseFloat(e.target.value))}
                          className={cn(
                            "w-full h-2 bg-gray-700/50 rounded-lg appearance-none cursor-pointer slider-enhanced",
                            !selectedAgentId && 'opacity-50 cursor-not-allowed'
                          )}
                          disabled={!selectedAgentId}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>Conservative</span>
                          <span>Creative</span>
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                          <Layers size={16} className="text-cyan-400" />
                          Top P: <span className="text-cyan-400 font-mono">{topP.toFixed(2)}</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={topP}
                          onChange={(e) => setTopP(parseFloat(e.target.value))}
                          className={cn(
                            "w-full h-2 bg-gray-700/50 rounded-lg appearance-none cursor-pointer slider-enhanced",
                            !selectedAgentId && 'opacity-50 cursor-not-allowed'
                          )}
                          disabled={!selectedAgentId}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>Focused</span>
                          <span>Diverse</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SectionCard>

                {/* Integrations */}
                <SectionCard
                  icon={<Zap className="text-yellow-400" size={24} />}
                  title="Integrations"
                  subtitle="Enhance your agent with external capabilities"
                  headerAction={
                    integrations.length > 0 && (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-1.5 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-400" />
                        <span className="text-yellow-400 text-sm font-medium">{integrations.length} active</span>
                      </div>
                    )
                  }
                >
                  {integrations.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-2xl bg-gray-800/50 border border-gray-700/50 flex items-center justify-center mx-auto mb-4">
                        <Activity className="text-gray-500" size={24} />
                      </div>
                      <h4 className="text-white font-medium mb-2">No integrations configured</h4>
                      <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                        Add integrations like webhooks, file uploads, or calendar connections to expand your agent's capabilities
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 mb-6">
                      {integrations.map((integration, idx) => (
                        <div key={idx} className="group bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 hover:bg-gray-800/60 transition-all duration-200 backdrop-blur-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 flex items-center justify-center">
                                  <Zap size={16} className="text-yellow-400" />
                                </div>
                                <div>
                                  <h4 className="text-white font-semibold">{integration.name}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <IntegrationStatus type={integration.type} />
                                    <span className="text-xs text-gray-500">•</span>
                                    <span className="text-xs text-gray-400 capitalize">
                                      {integration.type}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-xs text-gray-400 bg-gray-900/50 border border-gray-700/30 rounded-lg px-3 py-2 font-mono">
                                {integration.type === "files" 
                                  ? `${integration.files?.length || 0} file(s) uploaded` 
                                  : integration.url || "No URL configured"
                                }
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
                    className={cn(
                      "w-full border-2 border-dashed border-gray-600 hover:border-yellow-500/50 text-gray-400 hover:text-yellow-400 transition-all duration-200 py-4 rounded-xl flex items-center justify-center gap-3 group backdrop-blur-sm",
                      "hover:bg-yellow-500/5",
                      !selectedAgentId && 'opacity-50 cursor-not-allowed'
                    )}
                    disabled={!selectedAgentId}
                  >
                    <div className="w-8 h-8 rounded-lg border border-gray-600 group-hover:border-yellow-500/50 flex items-center justify-center group-hover:bg-yellow-500/10 transition-all">
                      <Zap size={16} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="font-medium">Add Integration</span>
                  </button>
                </SectionCard>

                {/* Agent Information */}
                <SectionCard
                  icon={<Info className="text-blue-400" size={24} />}
                  title="Agent Overview"
                  subtitle="Current configuration summary"
                  className="bg-blue-600/5 border-blue-600/20"
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-gray-900/40 border border-gray-700/30 rounded-xl p-4 text-center backdrop-blur-sm">
                      <div className="text-2xl font-bold text-white mb-1">{selectedAgentName || '—'}</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Agent</div>
                    </div>
                    <div className="bg-gray-900/40 border border-gray-700/30 rounded-xl p-4 text-center backdrop-blur-sm">
                      <div className="text-2xl font-bold text-white mb-1">{openaiModel}</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Model</div>
                    </div>
                    <div className="bg-gray-900/40 border border-gray-700/30 rounded-xl p-4 text-center backdrop-blur-sm">
                      <div className="text-2xl font-bold text-white mb-1">{versions.length}</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Versions</div>
                    </div>
                    <div className="bg-gray-900/40 border border-gray-700/30 rounded-xl p-4 text-center backdrop-blur-sm">
                      <div className="text-2xl font-bold text-cyan-400 mb-1">{temperature.toFixed(2)}</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Temperature</div>
                    </div>
                    <div className="bg-gray-900/40 border border-gray-700/30 rounded-xl p-4 text-center backdrop-blur-sm">
                      <div className="text-2xl font-bold text-cyan-400 mb-1">{topP.toFixed(2)}</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Top P</div>
                    </div>
                    <div className="bg-gray-900/40 border border-gray-700/30 rounded-xl p-4 text-center backdrop-blur-sm">
                      <div className="text-2xl font-bold text-yellow-400 mb-1">{integrations.length}</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Integrations</div>
                    </div>
                  </div>
                </SectionCard>

                {/* Save Button */}
                <div className="sticky bottom-0 bg-gradient-to-t from-gray-900/95 to-transparent pt-8 pb-4 backdrop-blur-sm">
                  <button 
                    onClick={handleSave}
                    className={cn(
                      "w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 transform hover:scale-105 relative overflow-hidden",
                      (!selectedAgentId || isSaving || !isModified) && "opacity-50 cursor-not-allowed transform-none hover:scale-100"
                    )}
                    disabled={!selectedAgentId || isSaving || !isModified}
                  >
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving configuration...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Save Configuration</span>
                        {isModified && <span className="text-emerald-200 text-sm">• Unsaved changes</span>}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* ===== RIGHT PANEL - Testing Suite ===== */}
              <div className="xl:col-span-1">
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl h-full flex flex-col overflow-hidden">
                  
                  {/* Testing Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-600/20 border-2 border-purple-600/40 flex items-center justify-center shadow-lg">
                        <TestTube className="text-purple-400" size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                          Testing Suite
                        </h3>
                        <p className="text-sm text-gray-400 mt-0.5">Test and refine your agent</p>
                      </div>
                    </div>
                  </div>

                  {/* Mode Toggle */}
                  <div className="p-6 border-b border-gray-700/50">
                    <div className="flex bg-gray-800/50 backdrop-blur-sm rounded-xl p-1.5 border border-gray-700/30">
                      <button
                        onClick={() => setMode("prompter")}
                        className={cn(
                          "flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden",
                          mode === "prompter" 
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                            : "text-gray-400 hover:text-white hover:bg-gray-700/30"
                        )}
                        disabled={!selectedAgentId}
                      >
                        {mode === "prompter" && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer"></div>
                        )}
                        <Brain className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">AI Prompter</span>
                      </button>
                      <button
                        onClick={() => setMode("test")}
                        className={cn(
                          "flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden",
                          mode === "test" 
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                            : "text-gray-400 hover:text-white hover:bg-gray-700/30"
                        )}
                        disabled={!selectedAgentId}
                      >
                        {mode === "test" && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer"></div>
                        )}
                        <MessageCircle className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">Test Chat</span>
                      </button>
                    </div>
                  </div>

                  {/* Chat Area */}
                  <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                    {!selectedAgentId ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-20 h-20 rounded-2xl bg-gray-800/50 border border-gray-700/50 flex items-center justify-center mb-6">
                          <Bot className="w-10 h-10 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-400 mb-2">No Agent Selected</h3>
                        <p className="text-gray-500 text-sm max-w-sm">Select an agent from the configuration panel to start testing and development</p>
                      </div>
                    ) : mode === "test" ? (
                      <>
                        {chatMessagesTestAI.length === 0 && !isThinking && (
                          <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center mb-4">
                              <MessageCircle className="w-8 h-8 text-blue-400" />
                            </div>
                            <h4 className="text-white font-medium mb-2">Start Testing</h4>
                            <p className="text-gray-400 text-sm max-w-sm">Send a message to test your agent's responses and behavior</p>
                          </div>
                        )}
                        
                        <div className="space-y-4">
                          {chatMessagesTestAI.map((msg, i) => (
                            <div
                              key={i}
                              className={cn(
                                "flex",
                                msg.role === "user" ? "justify-end" : "justify-start"
                              )}
                            >
                              <div
                                className={cn(
                                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg backdrop-blur-sm animate-fade-in",
                                  msg.role === "user"
                                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                    : "bg-gray-800/60 border border-gray-700/50 text-gray-100"
                                )}
                              >
                                <div className="text-xs opacity-75 mb-1 font-medium">
                                  {msg.role === "user" ? "You" : "AI Agent"}
                                </div>
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                              </div>
                            </div>
                          ))}
                          
                          {isThinking && (
                            <div className="flex justify-start">
                              <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl px-4 py-3 flex items-center gap-3 backdrop-blur-sm">
                                <div className="w-4 h-4 border-2 border-t-transparent border-blue-400 rounded-full animate-spin" />
                                <span className="text-gray-300 text-sm">AI is thinking...</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {chatMessagesTestAI.length > 0 && (
                          <div className="flex justify-center mt-6">
                            <button
                              onClick={() => setChatMessagesTestAI([])}
                              className="text-xs text-gray-500 hover:text-red-400 transition-colors px-4 py-2 rounded-lg hover:bg-red-900/10 border border-gray-700/30 hover:border-red-500/30"
                            >
                              Clear conversation
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {!suggestedPrompt && !aiSummary && messages.length === 0 && (
                          <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 flex items-center justify-center mb-4">
                              <Brain className="w-8 h-8 text-purple-400" />
                            </div>
                            <h4 className="text-white font-medium mb-2">AI Prompt Assistant</h4>
                            <p className="text-gray-400 text-sm max-w-sm">Describe what you want to improve and the AI will suggest prompt enhancements</p>
                          </div>
                        )}
                        
                        <div className="space-y-4">
                          {messages.map((msg, i) => (
                            <div
                              key={i}
                              className={cn(
                                "flex",
                                msg.role === "user" ? "justify-end" : "justify-start"
                              )}
                            >
                              <div
                                className={cn(
                                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg backdrop-blur-sm animate-fade-in",
                                  msg.role === "user"
                                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                    : "bg-gray-800/60 border border-gray-700/50 text-gray-100"
                                )}
                              >
                                <div className="text-xs opacity-75 mb-1 font-medium">
                                  {msg.role === "user" ? "You" : "Prompt AI"}
                                </div>
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                              </div>
                            </div>
                          ))}
                          
                          {isThinking && (
                            <div className="flex justify-start">
                              <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl px-4 py-3 flex items-center gap-3 backdrop-blur-sm">
                                <div className="w-4 h-4 border-2 border-t-transparent border-purple-400 rounded-full animate-spin" />
                                <span className="text-gray-300 text-sm">Analyzing your prompt...</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Diff Display */}
                        {suggestedPrompt && diff && (
                          <div className="mt-6 bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm animate-fade-in">
                            <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
                              <Code size={12} />
                              Suggested changes
                            </div>
                            <div className="text-sm leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-y-auto custom-scrollbar">
                              {diff.map((part, i) => (
                                <span key={i} className={
                                  part.added ? "text-emerald-400 bg-emerald-900/20 px-1 rounded-sm" : 
                                  part.removed ? "text-red-400 bg-red-900/20 line-through px-1 rounded-sm" : 
                                  "text-white"
                                }>
                                  {part.value}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {suggestedPrompt && (
                          <div className="flex gap-3 mt-4 animate-fade-in">
                            <button
                              onClick={() => {
                                setSuggestedPrompt("");
                                setAiSummary("");
                                setDiff(null);
                                setDiffPrompt(null);
                              }}
                              className="flex-1 bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 text-red-400 hover:text-red-300 py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
                            >
                              <X className="w-4 h-4" />
                              Reject
                            </button>
                            <button
                              onClick={() => {
                                setPrompt(suggestedPrompt);
                                setSuggestedPrompt("");
                                setAiSummary("");
                                setDiff(null);
                                setDiffPrompt(null);
                                toast.success("Prompt updated successfully!");
                              }}
                              className="flex-1 bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 text-emerald-400 hover:text-emerald-300 py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Accept
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="border-t border-gray-700/50 bg-gray-800/30 backdrop-blur-sm p-6">
                    <div className="space-y-4">
                      <textarea
                        placeholder={mode === "prompter" ? "Describe what you want to improve in your prompt..." : "Type your message to test the agent..."}
                        rows={3}
                        className={cn(
                          "w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm resize-none custom-scrollbar",
                          !selectedAgentId && 'opacity-50 cursor-not-allowed'
                        )}
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
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <kbd className="px-2 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-xs font-mono">Enter</kbd>
                          <span>to send</span>
                          <span>•</span>
                          <kbd className="px-2 py-1 bg-gray-700/50 border border-gray-600/50 rounded text-xs font-mono">Shift+Enter</kbd>
                          <span>new line</span>
                        </div>
                        
                        <button 
                          className={cn(
                            "px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 relative overflow-hidden",
                            (mode === "prompter" ? userInstruction.trim() : testMessage.trim()) && selectedAgentId && !isThinking
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105" 
                              : "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                          )} 
                          disabled={!(mode === "prompter" ? userInstruction.trim() : testMessage.trim()) || !selectedAgentId || isThinking}
                          onClick={mode === "prompter" ? handleSendInstruction : handleSendTestMessage}
                        >
                          {/* Shimmer Effect */}
                          {!isThinking && (mode === "prompter" ? userInstruction.trim() : testMessage.trim()) && selectedAgentId && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                          )}
                          
                          {isThinking ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span className="text-sm relative z-10">Processing...</span>
                            </>
                          ) : (
                            <span className="text-sm relative z-10">Send</span>
                          )}
                        </button>
                      </div>
                      
                      <p className="text-xs text-gray-500 text-center bg-gray-800/30 rounded-lg px-3 py-2 border border-gray-700/30">
                        Using your personal API key • Monitor usage carefully
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== MODALS ===== */}
        
        {/* Delete Version Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md mx-auto animate-fade-in">
              <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-600/20 border-2 border-red-600/40 flex items-center justify-center shadow-lg">
                    <Trash2 className="text-red-400" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                      Delete Version
                    </h2>
                    <p className="text-sm text-gray-400 mt-0.5">Select a version to delete</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200 group"
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-500/0 to-gray-500/0 group-hover:from-gray-500/10 group-hover:to-gray-500/10 transition-all duration-200"></div>
                  <X size={20} className="relative z-10" />
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                  {versions.map((version, i) => {
                    const isLatest = i === 0;
                    return (
                      <div
                        key={version._id}
                        className="flex justify-between items-center bg-gray-800/40 border border-gray-700/50 px-4 py-3 rounded-xl backdrop-blur-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-400" />
                          <span className="text-sm text-white font-medium">
                            {new Date(version.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {isLatest ? (
                          <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-full border border-emerald-500/30">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Latest
                          </div>
                        ) : (
                          <button
                            className="bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-2 text-xs font-medium"
                            onClick={async () => {
                              const res = await fetch(
                                `/api/agents/${selectedAgentId}/versions/${version._id}`,
                                { method: "DELETE" }
                              );

                              if (res.ok) {
                                toast.success("Version deleted successfully");

                                const updatedVersions = versions.filter((v) => v._id !== version._id);
                                setVersions(updatedVersions);

                                if (selectedVersionId === version._id && updatedVersions.length > 0) {
                                  const newVersion = updatedVersions[0];
                                  setSelectedVersionId(newVersion._id);

                                  const fetchRes = await fetch(`/api/agents/${selectedAgentId}/versions/${newVersion._id}`);
                                  const data = await fetchRes.json();
                                  if (data.version) {
                                    setPrompt(data.version.prompt);
                                    setInitialPrompt(data.version.prompt);
                                    setOpenaiModel(data.version.openaiModel);
                                    setTemperature(data.version.temperature);
                                    setTopP(data.version.top_p);
                                  }
                                }

                                if (updatedVersions.length === 0) {
                                  setShowDeleteModal(false);
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
              </div>
            </div>
          </div>
        )}

        {/* Add API Key Modal */}
        {showAddApiModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 border-2 border-blue-500/40 flex items-center justify-center shadow-lg">
                    <Key className="text-blue-400" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Add API Key</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Connect your OpenAI API key</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddApiModal(false)}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-300 text-center">
                  Go to <span className="text-blue-400 font-medium">API Key page</span> to add new API keys.
                </p>
                <button
                  onClick={() => setShowAddApiModal(false)}
                  className="w-full mt-4 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Integration Modals */}
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
              toast.success("Webhook integration saved!");
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
              toast.success("Calendly integration saved!");
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

        {/* ===== ENHANCED STYLES ===== */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(17, 24, 39, 0.3);
            border-radius: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, rgba(59, 130, 246, 0.6), rgba(6, 182, 212, 0.6));
            border-radius: 8px;
            border: 1px solid rgba(75, 85, 99, 0.3);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, rgba(59, 130, 246, 0.8), rgba(6, 182, 212, 0.8));
          }
          
          .slider-enhanced::-webkit-slider-thumb {
            appearance: none;
            height: 20px;
            width: 20px;
            background: linear-gradient(135deg, #3b82f6, #06b6d4);
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            border: 2px solid rgba(255, 255, 255, 0.2);
            transition: all 0.2s ease;
          }
          
          .slider-enhanced::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
          }
          
          .slider-enhanced::-moz-range-thumb {
            height: 20px;
            width: 20px;
            background: linear-gradient(135deg, #3b82f6, #06b6d4);
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          }

          @keyframes shimmer {
            0% {
              background-position: -200px 0;
            }
            100% {
              background-position: calc(200px + 100%) 0;
            }
          }

          .animate-shimmer {
            animation: shimmer 2s infinite;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            background-size: 200px 100%;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.98) translateY(8px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          .animate-fade-in {
            animation: fadeIn 0.3s ease-out forwards;
          }

          .bg-grid {
            background-image: 
              linear-gradient(to right, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
            background-size: 40px 40px;
          }

          .bg-premium-gradient {
            background: 
              radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 40% 70%, rgba(168, 85, 247, 0.05) 0%, transparent 50%),
              linear-gradient(135deg, #0a0a0b 0%, #111827 25%, #1f2937 50%, #111827 75%, #0a0a0b 100%);
            background-size: 
              800px 800px,
              600px 600px, 
              400px 400px,
              100% 100%;
            animation: premiumFloat 25s ease-in-out infinite;
          }

          @keyframes premiumFloat {
            0%, 100% { 
              background-position: 0% 0%, 100% 100%, 50% 50%, 0% 0%;
            }
            25% { 
              background-position: 100% 0%, 0% 100%, 0% 50%, 0% 0%;
            }
            50% { 
              background-position: 100% 100%, 0% 0%, 100% 0%, 0% 0%;
            }
            75% { 
              background-position: 0% 100%, 100% 0%, 50% 100%, 0% 0%;
            }
          }
        `}</style>
      </div>
    </RequireApiKey>
  );
}