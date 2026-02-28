"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import TextareaAutosize from "react-textarea-autosize";
import {
  Bot, Briefcase, Settings, User, Globe, MessageCircle,
  ChevronLeft, ChevronRight, CheckCircle, Key, Zap, Info, Upload, AlertCircle,
  X, Plus, Clock, Star, TrendingUp, Shield, FileText
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

// ===== ÉTAPE 1: AJOUTER CES IMPORTS =====
import AiModelDropdown from "@/components/Dropdowns/AiModelDropdown";
import ApiKeyDropdown, { ApiKeyOption } from "@/components/Dropdowns/ApiKeyDropdown";

// 🔧 CORRECTION - Import du vrai composant au lieu du mock
import ImportWebsiteModal from "@/components/ImportWebsiteModal";
import AddApiKeyModal from "@/components/AddApiKeyModal";

type Step = 1 | 2 | 3 | 4;

interface FormData {
  name: string;
  industry: string;
  language: string;
  template: "sales" | "support" | "blank" | "raw" | "";
  openaiModel: string;
  apiKey: string;
  temperature: number;
  top_p: number;
  description: string;
  questions: string;
  tone: string;
  rules: string;
  companyInfo: string;
  rawPrompt: string; // 🆕 NOUVEAU CHAMP
}

const defaultFormData: FormData = {
  name: "",
  industry: "",
  language: "",
  template: "",
  openaiModel: "gpt-4o",
  apiKey: "", // On va le définir automatiquement via useEffect
  temperature: 0.3,
  top_p: 1,
  description: "",
  questions: "",
  tone: "",
  rules: "",
  companyInfo: "",
  rawPrompt: "", // 🆕 NOUVEAU CHAMP
};
const templatePresets: Record<string, Partial<typeof defaultFormData>> = {
  support: {
    description: "Create an AI that should work as a support agent for a (INDUSTRY) Company. Friendly, engaging, with great support skills and empathy.",
    questions: "The AI should handle any objections and questions from (INDUSTRY) customers. Then ask a variation of is there anything else I can help you with?",
    tone: "The AI should speak (LANGUAGE). The prompt should be written in english. AI should speak In a formal and friendly tone. Like 2 friends texting on SMS. Grade 3 according to the Hemingway app.",
    rules: "1. Handle questions with empathy and understanding.\n2. Never repeat a customer's question back to them.\n3. Don't use !'s extensively.\n4. Use smiley emojis sometimes.\n5. Ensure clarity and structure in responses.",
  },
  sales: {
    description: "Create an AI that works as a receptionist for a (INDUSTRY) Company. Friendly, engaging, but also have the sales skills of Jeremy Miner.",
    questions: "The AI should ALWAYS answer any questions and objections first, AND ALWAYS ask this question in first response:\n1. (Add a sales question)\nThen continue with structured questions.",
    tone: "The AI should speak (LANGUAGE). The prompt should be written in english. AI should speak In a formal and friendly tone. Like 2 friends texting on SMS. Grade 3 according to the Hemingway app.",
    rules: "1. Only ask one question at a time.\n2. Never repeat a question.\n3. Don't use !'s extensively.\n4. Use smiley emojis sometimes.\n5. Ensure clarity and structure in responses.",
  },
};

const updateTemplateContent = (
  formData: FormData,
  templateKey: string,
  industry: string,
  language: string
): Partial<FormData> => {
  if (!templateKey || templateKey === "blank" || templateKey === "raw" || !templatePresets[templateKey]) {
    return {};
  }

  const preset = templatePresets[templateKey];
  const updates: Partial<FormData> = {};

  if (preset.description) {
    updates.description = preset.description
      .replaceAll("(LANGUAGE)", language || "English")
      .replaceAll("(INDUSTRY)", industry || "technology");
  }

  if (preset.questions) {
    updates.questions = preset.questions
      .replaceAll("(LANGUAGE)", language || "English")
      .replaceAll("(INDUSTRY)", industry || "technology");
  }

  if (preset.tone) {
    updates.tone = preset.tone
      .replaceAll("(LANGUAGE)", language || "English")
      .replaceAll("(INDUSTRY)", industry || "technology");
  }

  if (preset.rules) {
    updates.rules = preset.rules
      .replaceAll("(LANGUAGE)", language || "English")
      .replaceAll("(INDUSTRY)", industry || "technology");
  }

  return updates;
};

const getContentQuality = (content: string, minLength: number = 50) => {
  if (!content.trim()) return { status: 'empty', message: 'Field is empty', color: 'text-gray-400' };
  if (content.length < minLength) return { status: 'short', message: 'Consider adding more detail', color: 'text-orange-400' };
  if (content.length < minLength * 2) return { status: 'good', message: 'Good content', color: 'text-green-400' };
  return { status: 'excellent', message: 'Excellent detail', color: 'text-green-400' };
};

const QualityIndicator = ({ content, minLength = 50 }: { content: string; minLength?: number }) => {
  const quality = getContentQuality(content, minLength);

  if (quality.status === 'empty') return null;

  return (
    <div className={`flex items-center gap-1.5 text-xs mt-2 ${quality.color}`}>
      {quality.status === 'short' ? (
        <AlertCircle size={12} />
      ) : (
        <CheckCircle size={12} />
      )}
      {quality.message}
    </div>
  );
};

const CharacterCounter = ({ content, maxLength = 1000 }: { content: string; maxLength?: number }) => {
  const percentage = (content.length / maxLength) * 100;
  const isNearLimit = percentage > 80;

  return (
    <div className={`text-xs mt-1 ${isNearLimit ? 'text-orange-400' : 'text-gray-400'}`}>
      {content.length}/{maxLength} characters
    </div>
  );
};
// 🎨 NOUVEAU - Step Indicator Premium
const StepIndicator = ({ currentStep, formData }: { currentStep: Step; formData: FormData }) => {
  const steps = [
    { number: 1, title: "AI Type & Basics", icon: Bot, color: "from-blue-500 to-cyan-500" },
    { number: 2, title: "Model Settings", icon: Settings, color: "from-purple-500 to-pink-500" },
    {
      number: 3,
      title: formData.template === 'raw' ? "Raw Prompt" : "Personality & Knowledge",
      icon: formData.template === 'raw' ? FileText : User,
      color: "from-green-500 to-emerald-500"
    },
    { number: 4, title: "Final Review", icon: CheckCircle, color: "from-orange-500 to-red-500" },
  ];

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const isConnected = index < steps.length - 1;

          return (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex items-center">
                {/* Circle avec gradient et effets premium */}
                <div className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white transform scale-110'
                  : isActive
                    ? `bg-gradient-to-r ${step.color} text-white transform scale-110 shadow-lg shadow-blue-500/30`
                    : 'bg-gray-800/50 text-gray-400 border border-gray-700/50'
                  }`}>
                  {/* Glow effect pour step actif */}
                  {isActive && (
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${step.color} blur-lg opacity-50 animate-pulse`}></div>
                  )}

                  {/* Icon */}
                  <div className="relative z-10">
                    {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
                  </div>
                </div>

                {/* Text */}
                <div className="ml-4 hidden sm:block">
                  <div className={`text-sm font-semibold transition-colors ${isActive ? 'text-white' : isCompleted ? 'text-green-400' : 'text-gray-400'
                    }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Step {step.number}</div>
                </div>
              </div>

              {/* Connector Line */}
              {isConnected && (
                <div className="flex-1 mx-4 h-0.5 transition-all duration-500">
                  <div className={`h-full rounded-full transition-all duration-500 ${isCompleted
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/20'
                    : 'bg-gray-700/50'
                    }`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function CreateAgentWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [showAddApiModal, setShowAddApiModal] = useState(false);

  // ===== ÉTAPE 2: METTRE À JOUR LE TYPE DES APIKEYS =====
  const [apiKeys, setApiKeys] = useState<ApiKeyOption[]>([]);

  // Ajouter useEffect pour charger les vraies API keys
  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        const response = await fetch("/api/user/api-key");
        const data = await response.json();
        if (response.ok) {
          setApiKeys(data.apiKeys || []);

          // Définir l'API key par défaut automatiquement
          const defaultKey = data.apiKeys?.find((key: any) => key.isDefault);
          if (defaultKey) {
            updateFormData("apiKey", defaultKey.id);
          }
        }
      } catch (error) {
        console.error("Error fetching API keys:", error);
      }
    };

    if (session) {
      fetchApiKeys();
    }
  }, [session]);

  // 🔧 CORRECTION - Variables d'état corrigées pour correspondre à l'ancienne version
  const [showImportModal, setShowImportModal] = useState(false);
  const [faqGenerating, setFaqGenerating] = useState(false);
  const [originalCompanyText, setOriginalCompanyText] = useState("");
  const [isFaqGenerated, setIsFaqGenerated] = useState(false);
  const handleApiKeyAdded = async (newApiKeyData: { id: string; name: string; maskedKey: string; isDefault: boolean }) => {
    // Au lieu d'ajouter juste l'objet temporaire, on refetch toutes les API keys
    try {
      const response = await fetch("/api/user/api-key");
      const data = await response.json();
      if (response.ok) {
        setApiKeys(data.apiKeys || []);

        // Définir la nouvelle clé comme sélectionnée (elle sera probablement la dernière ajoutée)
        const newlyAddedKey = data.apiKeys?.find((key: any) => key.name === newApiKeyData.name);
        if (newlyAddedKey) {
          updateFormData("apiKey", newlyAddedKey.id);
        }
      }
    } catch (error) {
      console.error("Error refetching API keys:", error);
      // Fallback: ajouter quand même l'objet temporaire
      setApiKeys((prev: ApiKeyOption[]) => [...prev, newApiKeyData]);
      updateFormData("apiKey", newApiKeyData.id);
    }
  };

  // 🔧 CORRECTION - Fonction d'import corrigée pour correspondre à l'ancienne version
  const handleImportWebsite = (content: string) => {
    updateFormData("companyInfo", content);
    setShowImportModal(false);
    toast.success("Website content imported successfully!");
  };

  // 🔧 FONCTION MANQUANTE - Generate FAQ
  const handleGenerateFaq = async () => {
    if (!formData.companyInfo.trim()) {
      toast.error("Please add company information first");
      return;
    }

    setOriginalCompanyText(formData.companyInfo);
    setFaqGenerating(true);

    try {
      const res = await fetch("/api/generate-faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: formData.companyInfo.trim(),
          apiKey: formData.apiKey || "user_api_key",
        }),
      });

      const data = await res.json();
      const cleaned = (data.faq || "")
        .replace(/^```markdown/, "")
        .replace(/```$/, "")
        .trim();

      updateFormData("companyInfo", cleaned || "Could not generate FAQ.");
      setIsFaqGenerated(true);
      toast.success("FAQ generated successfully");
    } catch (error) {
      console.error("Error generating FAQ:", error);
      toast.error("Something went wrong while generating FAQ.");
    } finally {
      setFaqGenerating(false);
    }
  };

  // 🔧 FONCTION MANQUANTE - Revert FAQ
  const handleRevertFaq = () => {
    updateFormData("companyInfo", originalCompanyText);
    setIsFaqGenerated(false);
    toast.success("Changes reverted successfully");
  };

  const updateFormData = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => {
      const newFormData = { ...prev, [field]: value };

      if ((field === 'industry' || field === 'language') && prev.template && prev.template !== 'blank' && prev.template !== 'raw') {
        const templateUpdates = updateTemplateContent(
          { ...prev, [field]: value },
          prev.template,
          field === 'industry' ? value as string : prev.industry,
          field === 'language' ? value as string : prev.language
        );

        return { ...newFormData, ...templateUpdates };
      }

      return newFormData;
    });
  };

  const handleTemplateSelect = (template: typeof formData.template) => {
    setFormData(prev => {
      const baseData: FormData = { ...prev, template };

      if (template && template !== "blank" && template !== "raw" && templatePresets[template]) {
        const templateUpdates = updateTemplateContent(
          baseData,
          template,
          prev.industry,
          prev.language
        );
        return { ...baseData, ...templateUpdates };
      } else if (template === "blank" || template === "raw") {
        return {
          ...baseData,
          description: "",
          questions: "",
          tone: "",
          rules: ""
        };
      }

      return baseData;
    });
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        if (formData.template === 'raw') {
          return formData.name && formData.template;
        } else {
          return formData.name && formData.industry && formData.language && formData.template;
        }
      case 2:
        return formData.openaiModel;
      case 3:
        if (formData.template === 'raw') {
          return formData.rawPrompt && formData.rawPrompt.trim().length > 50;
        } else {
          return formData.description && formData.questions && formData.tone && formData.rules;
        }
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNextStep() && currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to create agent");
      }

      toast.success("Agent created successfully");

      await fetch(`/api/agents/${data.id}/generate-prompt`, {
        method: "POST"
      });

      setTimeout(() => router.push(`/agents/${data.id}`), 800);
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while creating your agent.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Toaster
        position="top-center"
        containerStyle={{
          top: '80px'
        }}
        toastOptions={{
          style: {
            zIndex: 9999,
            background: 'rgba(17, 24, 39, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(75, 85, 99, 0.5)',
            color: 'white',
            borderRadius: '12px',
          },
        }}
      />

      {/* 🔧 CORRECTION - Utilisation du vrai modal avec les bonnes props */}
      <ImportWebsiteModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportWebsite}
      />

      <AddApiKeyModal
        isOpen={showAddApiModal}
        onClose={() => setShowAddApiModal(false)}
        onApiKeyAdded={handleApiKeyAdded}
      />

      <div className="h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar bg-transparent relative">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="flex justify-center min-h-screen py-8">
          <div className="w-full max-w-6xl mx-auto px-6 relative z-10">

            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl px-6 py-3 mb-6">
                <Bot className="w-6 h-6 text-blue-400" />
                <span className="text-blue-400 font-semibold">AI Agent Creation</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-4 pb-1">
                Create your AI Agent
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Build and customize your intelligent AI assistant with our step-by-step wizard
              </p>
            </div>

            <StepIndicator currentStep={currentStep} formData={formData} />

            {/* Main Card */}
            <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
              {/* Card Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>

              <div className="relative z-10">
                {/* STEP 1 - AI Type Selection */}
                {currentStep === 1 && (
                  <div className="space-y-8">
                    <div className="text-center mb-10">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
                        <Bot className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent pb-1">
                        Choose Your AI Type
                      </h2>
                      <p className="text-gray-400 text-lg">Start by selecting the type of AI assistant you want to create</p>
                    </div>

                    {/* Template Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                      {[
                        {
                          key: "sales",
                          title: "Sales AI",
                          desc: "Perfect for lead generation and sales automation",
                          icon: Briefcase,
                          gradient: "from-orange-500 to-red-500",
                          features: ["Lead qualification", "Product recommendations", "Follow-up automation"],
                          bgGradient: "from-orange-500/10 to-red-500/10",
                          borderGradient: "from-orange-500/30 to-red-500/30"
                        },
                        {
                          key: "support",
                          title: "Support AI",
                          desc: "Ideal for customer support and service inquiries",
                          icon: Shield,
                          gradient: "from-blue-500 to-cyan-500",
                          features: ["Ticket classification", "FAQ responses", "Escalation handling"],
                          bgGradient: "from-blue-500/10 to-cyan-500/10",
                          borderGradient: "from-blue-500/30 to-cyan-500/30"
                        },
                        {
                          key: "blank",
                          title: "Start Blank",
                          desc: "Start from scratch with a completely custom AI",
                          icon: Globe,
                          gradient: "from-purple-500 to-pink-500",
                          features: ["Full customization", "No presets", "Maximum flexibility"],
                          bgGradient: "from-purple-500/10 to-pink-500/10",
                          borderGradient: "from-purple-500/30 to-pink-500/30"
                        },
                        {
                          key: "raw",
                          title: "Raw Prompt",
                          desc: "Ideal for using prompts from other AI platforms",
                          icon: FileText,
                          gradient: "from-indigo-500 to-purple-500",
                          features: ["Direct import", "No AI processing", "Use as-is"],
                          bgGradient: "from-indigo-500/10 to-purple-500/10",
                          borderGradient: "from-indigo-500/30 to-purple-500/30"
                        }
                      ].map((template) => {
                        const Icon = template.icon;
                        const isSelected = formData.template === template.key;
                        return (
                          <button
                            key={template.key}
                            onClick={() => handleTemplateSelect(template.key as any)}
                            className={`group p-6 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden ${isSelected
                              ? `bg-gradient-to-br ${template.bgGradient} border-transparent shadow-2xl transform scale-105`
                              : "bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/70"
                              }`}
                          >
                            {/* Background Gradient for selected */}
                            {isSelected && (
                              <div className={`absolute inset-0 bg-gradient-to-br ${template.bgGradient} opacity-50`}></div>
                            )}

                            <div className="relative z-10">
                              <div className={`w-16 h-16 rounded-xl mb-4 flex items-center justify-center transition-all duration-300 ${isSelected
                                ? `bg-gradient-to-r ${template.gradient} shadow-lg`
                                : `bg-gradient-to-r ${template.gradient} opacity-70 group-hover:opacity-100`
                                }`}>
                                <Icon size={28} className="text-white" />
                              </div>
                              <h3 className="font-bold text-xl mb-3 text-white">{template.title}</h3>
                              <p className="text-sm text-gray-300 mb-4 leading-relaxed">{template.desc}</p>
                              <ul className="text-xs space-y-2">
                                {template.features.map((feature, idx) => (
                                  <li key={idx} className="flex items-center gap-2 text-gray-400">
                                    <CheckCircle size={12} className={isSelected ? "text-white" : "text-gray-500"} />
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Basic Info Form - Conditionnel selon le template */}
                    {formData.template && formData.template !== 'raw' && (
                      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
                        <h3 className="text-xl font-semibold mb-6 text-white">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-medium mb-3 text-gray-300">AI Name *</label>
                            <input
                              value={formData.name}
                              onChange={(e) => updateFormData("name", e.target.value)}
                              className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 rounded-xl focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 outline-none text-white placeholder-gray-400 font-medium backdrop-blur-sm transition-all"
                              placeholder="e.g., Sarah Support Bot"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-3 text-gray-300">Industry *</label>
                            <input
                              value={formData.industry}
                              onChange={(e) => updateFormData("industry", e.target.value)}
                              className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 rounded-xl focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 outline-none text-white placeholder-gray-400 font-medium backdrop-blur-sm transition-all"
                              placeholder="e.g., Technology, Healthcare"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-3 text-gray-300">Language *</label>
                            <input
                              value={formData.language}
                              onChange={(e) => updateFormData("language", e.target.value)}
                              className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 rounded-xl focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 outline-none text-white placeholder-gray-400 font-medium backdrop-blur-sm transition-all"
                              placeholder="e.g., English, French"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Nom seulement pour raw template */}
                    {formData.template === 'raw' && (
                      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
                        <h3 className="text-xl font-semibold mb-6 text-white">Basic Information</h3>
                        <div className="max-w-md">
                          <label className="block text-sm font-medium mb-3 text-gray-300">AI Name *</label>
                          <input
                            value={formData.name}
                            onChange={(e) => updateFormData("name", e.target.value)}
                            className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 rounded-xl focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 outline-none text-white placeholder-gray-400 font-medium backdrop-blur-sm transition-all"
                            placeholder="e.g., Sarah Support Bot"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2 - Model Settings */}
                {currentStep === 2 && (
                  <div className="space-y-8">
                    <div className="text-center mb-10">
                      <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
                        <Settings className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent pb-1">
                        Model Settings
                      </h2>
                      <p className="text-gray-400 text-lg">Configure your AI model and parameters</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                      {/* AI Model Section */}
                      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Bot className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-xl font-semibold text-white">AI Model</h3>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-3 text-gray-300">Select Model *</label>
                          {/* ===== ÉTAPE 4: REMPLACER PAR LE NOUVEAU COMPOSANT ===== */}
                          <AiModelDropdown
                            selectedModel={formData.openaiModel}
                            onModelSelect={(modelId) => updateFormData("openaiModel", modelId)}
                          />
                        </div>

                        {/* Model Info */}
                        {(() => {
                          const modelOptions = [
                            {
                              id: "gpt-4o",
                              name: "GPT-4o",
                              description: "Multimodal model, excellent for complex tasks",
                              badge: "Most Popular",
                              badgeColor: "bg-blue-500",
                              inputPrice: 2.50,
                              outputPrice: 10.00,
                              contextWindow: "128K",
                            },
                            {
                              id: "gpt-4o-mini",
                              name: "GPT-4o Mini",
                              description: "Fast and cost-effective multimodal model",
                              badge: "Best Value",
                              badgeColor: "bg-green-500",
                              inputPrice: 0.15,
                              outputPrice: 0.60,
                              contextWindow: "128K",
                            },
                            {
                              id: "gpt-5-nano",
                              name: "GPT-5 Nano",
                              description: "Fastest, most cost-efficient version of GPT-5",
                              badge: "New",
                              badgeColor: "bg-purple-500",
                              inputPrice: 0.05,
                              outputPrice: 0.40,
                              contextWindow: "400K",
                            },
                            {
                              id: "gpt-5-mini",
                              name: "GPT-5 Mini",
                              description: "A faster, cost-efficient version of GPT-5 for well-defined tasks",
                              badge: "New",
                              badgeColor: "bg-purple-500",
                              inputPrice: 0.25,
                              outputPrice: 2.00,
                              contextWindow: "400K",
                            },
                            {
                              id: "gpt-4-turbo",
                              name: "GPT-4 Turbo",
                              description: "Advanced reasoning with large context window",
                              badge: "",
                              badgeColor: "",
                              inputPrice: 10.00,
                              outputPrice: 30.00,
                              contextWindow: "128K",
                            },
                            {
                              id: "gpt-4",
                              name: "GPT-4",
                              description: "High-intelligence standard model",
                              badge: "",
                              badgeColor: "",
                              inputPrice: 30.00,
                              outputPrice: 60.00,
                              contextWindow: "8K",
                            },
                            {
                              id: "gpt-4-32k",
                              name: "GPT-4 32K",
                              description: "Extended context version of GPT-4",
                              badge: "",
                              badgeColor: "",
                              inputPrice: 60.00,
                              outputPrice: 120.00,
                              contextWindow: "32K",
                            },
                            {
                              id: "gpt-3.5-turbo",
                              name: "GPT-3.5 Turbo",
                              description: "Fast and efficient for most tasks",
                              badge: "",
                              badgeColor: "",
                              inputPrice: 0.50,
                              outputPrice: 1.50,
                              contextWindow: "16K",
                            },
                          ];

                          const selectedModel = modelOptions.find(m => m.id === formData.openaiModel);
                          return selectedModel ? (
                            <div className="mt-6 p-4 bg-gray-900/50 rounded-xl space-y-4">
                              {/* Context Window & Type */}
                              <div className="grid grid-cols-2 gap-4 text-sm pb-4 border-b border-gray-700/30">
                                <div>
                                  <div className="text-gray-400 mb-1">Context Window</div>
                                  <div className="text-white font-semibold">{selectedModel.contextWindow}</div>
                                </div>
                                <div>
                                  <div className="text-gray-400 mb-1">Type</div>
                                  <div className="text-white font-semibold">
                                    {selectedModel.id.includes('4o') || selectedModel.id.includes('5') ? 'Multimodal' : 'Text'}
                                  </div>
                                </div>
                              </div>

                              {/* Description */}
                              <p className="text-gray-400 text-sm">{selectedModel.description}</p>

                              {/* Token Pricing */}
                              <div>
                                <div className="text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
                                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                  </svg>
                                  Token Pricing
                                </div>
                                <div className="text-white text-sm font-medium mb-3">
                                  Input: <span className="text-green-400">${selectedModel.inputPrice.toFixed(2)}/1M</span>
                                  {' • '}
                                  Output: <span className="text-green-400">${selectedModel.outputPrice.toFixed(2)}/1M</span>
                                </div>
                                <div className="text-xs text-gray-500 bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                                  💡 A token is approximately 4 characters or 0.75 words. You only pay for what you use.
                                </div>
                                <a
                                  href="https://platform.openai.com/docs/models"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-gray-500 hover:text-gray-400 transition-colors flex items-center gap-1 mt-2"
                                >
                                  Learn more about models
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </div>

                      {/* API & Parameters Section */}
                      <div className="space-y-6">
                        {/* API Key */}
                        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                              <Key className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-white">API Configuration</h3>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-3 text-gray-300">API Key Project *</label>
                            {/* ===== ÉTAPE 5: REMPLACER PAR LE NOUVEAU COMPOSANT ===== */}
                            <ApiKeyDropdown
                              selectedApiKey={formData.apiKey}
                              onApiKeySelect={(keyId) => updateFormData("apiKey", keyId)}
                              onAddNewClick={() => setShowAddApiModal(true)}
                              apiKeys={apiKeys}
                            />
                          </div>
                        </div>

                        {/* Parameters */}
                        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                              <Settings className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-white">Parameters</h3>
                          </div>

                          <div className="space-y-6">
                            <div>
                              <label className="block text-sm font-medium mb-3 text-gray-300">
                                Temperature: {formData.temperature}
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={formData.temperature}
                                onChange={(e) => updateFormData("temperature", parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                              />
                              <div className="text-xs text-gray-400 mt-2">
                                Controls randomness: lower for focused, higher for creative
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-3 text-gray-300">
                                Top P: {formData.top_p}
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={formData.top_p}
                                onChange={(e) => updateFormData("top_p", parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                              />
                              <div className="text-xs text-gray-400 mt-2">
                                Controls diversity: lower for focused, higher for diverse
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>


                  </div>
                )}
                {/* STEP 3 - Personality & Knowledge OU Raw Prompt */}
                {currentStep === 3 && (
                  <div className="space-y-8">
                    <div className="text-center mb-10">
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg ${formData.template === 'raw'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-indigo-500/30'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-500/30'
                        }`}>
                        {formData.template === 'raw' ? (
                          <FileText className="w-10 h-10 text-white" />
                        ) : (
                          <User className="w-10 h-10 text-white" />
                        )}
                      </div>
                      <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent pb-1">
                        {formData.template === 'raw' ? 'Raw Prompt' : 'Personality & Knowledge'}
                      </h2>
                      <p className="text-gray-400 text-lg">
                        {formData.template === 'raw'
                          ? 'Paste your complete prompt exactly as you want it'
                          : 'Define how your AI should behave and what it knows'
                        }
                      </p>
                    </div>

                    {formData.template === 'raw' ? (
                      // 🆕 Mode Raw Prompt
                      <div>
                        {/* Raw Prompt Textarea */}
                        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 mb-6">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                              <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-white">Raw Prompt</h3>
                              <p className="text-sm text-gray-400">Paste your complete prompt here</p>
                            </div>
                          </div>

                          <TextareaAutosize
                            value={formData.rawPrompt}
                            onChange={(e) => updateFormData("rawPrompt", e.target.value)}
                            minRows={20}
                            className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none placeholder-gray-400 font-mono text-sm backdrop-blur-sm"
                            placeholder="Paste your complete prompt here..."
                          />

                          <div className="flex justify-between items-center mt-3">
                            <div className="text-xs text-gray-400 flex items-center gap-2">
                              <FileText size={12} />
                              This prompt will be used exactly as written, without AI modifications
                            </div>
                            <div className="text-xs text-gray-500">
                              {formData.rawPrompt.length.toLocaleString()} characters
                            </div>
                          </div>
                        </div>

                        {/* 🆕 Company Info Section - COPIÉ DU MODE NORMAL */}
                        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
                          <div className="flex justify-between items-start mb-4">
                            <label className="block text-sm font-medium text-gray-300">
                              Company Information (Optional)
                            </label>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setShowImportModal(true)}
                                className="text-xs bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 font-medium shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:scale-105"
                              >
                                <Upload size={12} />
                                Import Website
                              </button>

                              {!isFaqGenerated ? (
                                <button
                                  type="button"
                                  onClick={handleGenerateFaq}
                                  disabled={faqGenerating || !formData.companyInfo.trim()}
                                  className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 font-medium shadow-lg hover:shadow-xl hover:shadow-purple-500/20 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                                >
                                  {faqGenerating ? (
                                    <>
                                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                      Converting...
                                    </>
                                  ) : (
                                    <>
                                      <Zap size={12} />
                                      Turn into FAQ
                                    </>
                                  )}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleRevertFaq}
                                  className="text-xs bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 font-medium shadow-lg hover:shadow-xl hover:shadow-red-500/20 transform hover:scale-105"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M9 14L4 9l5-5" />
                                    <path d="M4 9h16" />
                                  </svg>
                                  Revert FAQ
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => updateFormData("companyInfo", "")}
                                className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                              >
                                Clear
                              </button>
                            </div>
                          </div>

                          <TextareaAutosize
                            value={formData.companyInfo}
                            onChange={(e) => updateFormData("companyInfo", e.target.value)}
                            minRows={6}
                            className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none placeholder-gray-400 font-medium backdrop-blur-sm"
                            placeholder="Add company information, services, pricing, policies, contact details..."
                          />
                          <QualityIndicator content={formData.companyInfo} minLength={100} />
                          <CharacterCounter content={formData.companyInfo} maxLength={15000} />

                          <p className="text-xs text-gray-400 mt-3">
                            💡 This information will be added to your raw prompt as additional context.
                          </p>
                        </div>
                      </div>
                    ) : (
                      // Mode normal avec les champs structurés
                      <div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Description */}
                          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
                            <label className="block text-sm font-medium mb-3 text-gray-300">
                              Description *
                            </label>
                            <TextareaAutosize
                              value={formData.description}
                              onChange={(e) => updateFormData("description", e.target.value)}
                              minRows={4}
                              className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none placeholder-gray-400 font-medium backdrop-blur-sm"
                              placeholder="Define what your AI does, its role, and primary objective..."
                            />
                            <QualityIndicator content={formData.description} minLength={50} />
                            <CharacterCounter content={formData.description} maxLength={500} />
                          </div>

                          {/* Questions */}
                          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
                            <label className="block text-sm font-medium mb-3 text-gray-300">
                              Questions to Ask *
                            </label>
                            <TextareaAutosize
                              value={formData.questions}
                              onChange={(e) => updateFormData("questions", e.target.value)}
                              minRows={4}
                              className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none placeholder-gray-400 font-medium backdrop-blur-sm"
                              placeholder="Define the conversation flow and key questions..."
                            />
                            <QualityIndicator content={formData.questions} minLength={30} />
                            <CharacterCounter content={formData.questions} maxLength={800} />
                          </div>

                          {/* Tone */}
                          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
                            <label className="block text-sm font-medium mb-3 text-gray-300">
                              Tone & Style *
                            </label>
                            <TextareaAutosize
                              value={formData.tone}
                              onChange={(e) => updateFormData("tone", e.target.value)}
                              minRows={4}
                              className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none placeholder-gray-400 font-medium backdrop-blur-sm"
                              placeholder="Define the communication style, language, and personality..."
                            />
                            <QualityIndicator content={formData.tone} minLength={30} />
                            <CharacterCounter content={formData.tone} maxLength={400} />
                          </div>

                          {/* Rules */}
                          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
                            <label className="block text-sm font-medium mb-3 text-gray-300">
                              Rules *
                            </label>
                            <TextareaAutosize
                              value={formData.rules}
                              onChange={(e) => updateFormData("rules", e.target.value)}
                              minRows={4}
                              className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none placeholder-gray-400 font-medium backdrop-blur-sm"
                              placeholder="Set specific behavioral guidelines and constraints..."
                            />
                            <QualityIndicator content={formData.rules} minLength={50} />
                            <CharacterCounter content={formData.rules} maxLength={600} />
                          </div>
                        </div>

                        {/* Company Info */}
                        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 lg:col-span-2 mt-6">
                          <div className="flex justify-between items-start mb-4">
                            <label className="block text-sm font-medium text-gray-300">
                              Company Information (Optional)
                            </label>
                            <div className="flex gap-2">
                              {/* 🔧 CORRECTION - Bouton corrigé pour utiliser showImportModal */}
                              <button
                                type="button"
                                onClick={() => setShowImportModal(true)}
                                className="text-xs bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 font-medium shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:scale-105"
                              >
                                <Upload size={12} />
                                Import Website
                              </button>

                              {!isFaqGenerated ? (
                                <button
                                  type="button"
                                  onClick={handleGenerateFaq}
                                  disabled={faqGenerating || !formData.companyInfo.trim()}
                                  className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 font-medium shadow-lg hover:shadow-xl hover:shadow-purple-500/20 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                                >
                                  {faqGenerating ? (
                                    <>
                                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                      Converting...
                                    </>
                                  ) : (
                                    <>
                                      <Zap size={12} />
                                      Turn into FAQ
                                    </>
                                  )}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleRevertFaq}
                                  className="text-xs bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 font-medium shadow-lg hover:shadow-xl hover:shadow-red-500/20 transform hover:scale-105"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M9 14L4 9l5-5" />
                                    <path d="M4 9h16" />
                                  </svg>
                                  Revert FAQ
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => updateFormData("companyInfo", "")}
                                className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                              >
                                Clear
                              </button>
                            </div>
                          </div>

                          <TextareaAutosize
                            value={formData.companyInfo}
                            onChange={(e) => updateFormData("companyInfo", e.target.value)}
                            minRows={6}
                            className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none placeholder-gray-400 font-medium backdrop-blur-sm"
                            placeholder="Add company information, services, pricing, policies, contact details..."
                          />
                          <QualityIndicator content={formData.companyInfo} minLength={100} />
                          <CharacterCounter content={formData.companyInfo} maxLength={15000} />

                          <p className="text-xs text-gray-400 mt-3">
                            💡 The more detailed company information you provide, the better your AI will respond to customers.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 4 - Final Review */}
                {currentStep === 4 && (
                  <div className="space-y-8">
                    <div className="text-center mb-10">
                      <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/30">
                        <CheckCircle className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent pb-1">
                        Final Review
                      </h2>
                      <p className="text-gray-400 text-lg">Review your AI configuration and generate your assistant</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Configuration Summary */}
                      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Settings className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-xl font-semibold text-blue-200">AI Configuration</h3>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl">
                            <span className="text-gray-400 text-sm">AI Name</span>
                            <span className="text-white font-medium">{formData.name}</span>
                          </div>
                          {formData.template !== 'raw' && (
                            <>
                              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl">
                                <span className="text-gray-400 text-sm">Industry</span>
                                <span className="text-white font-medium">{formData.industry}</span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl">
                                <span className="text-gray-400 text-sm">Language</span>
                                <span className="text-white font-medium">{formData.language}</span>
                              </div>
                            </>
                          )}
                          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl">
                            <span className="text-gray-400 text-sm">Template</span>
                            <span className={`px-3 py-1 text-xs rounded-full text-white ${formData.template === 'sales' ? 'bg-orange-600' :
                              formData.template === 'support' ? 'bg-blue-600' :
                                formData.template === 'raw' ? 'bg-indigo-600' : 'bg-purple-600'
                              }`}>
                              {formData.template === 'sales' ? 'Sales AI' :
                                formData.template === 'support' ? 'Support AI' :
                                  formData.template === 'raw' ? 'Raw Prompt' : 'Custom'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl">
                            <span className="text-gray-400 text-sm">Model</span>
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 rounded flex items-center justify-center">
                                <Bot className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-white font-medium">{formData.openaiModel.toUpperCase()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Requirements & Status OU Raw Prompt Preview */}
                      {formData.template === 'raw' ? (
                        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                              <FileText className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-indigo-200">Raw Prompt Preview</h3>
                          </div>
                          <div className="bg-gray-900/50 rounded-xl p-4 max-h-64 overflow-y-auto">
                            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                              {formData.rawPrompt || 'No raw prompt provided'}
                            </pre>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                              <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-green-200">Requirements</h3>
                          </div>

                          <div className="space-y-3 mb-8">
                            {[
                              { label: "AI Name", check: !!formData.name },
                              { label: "Industry", check: !!formData.industry },
                              { label: "Language", check: !!formData.language },
                              { label: "Template", check: !!formData.template },
                              { label: "Model", check: !!formData.openaiModel },
                              { label: "API Key", check: !!formData.apiKey },
                              { label: "Description", check: !!formData.description },
                              { label: "Conversation Flow", check: !!formData.questions },
                              { label: "Tone & Style", check: !!formData.tone },
                              { label: "Rules", check: !!formData.rules },
                              { label: "Company Info", check: !!formData.companyInfo, optional: true }
                            ].map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3 p-2 rounded-lg">
                                {item.check ? (
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                ) : (
                                  <div className={`w-5 h-5 rounded-full border-2 ${item.optional ? 'border-gray-500' : 'border-orange-400'}`} />
                                )}
                                <span className={`text-sm ${item.check ? 'text-white' : item.optional ? 'text-gray-400' : 'text-orange-400'}`}>
                                  {item.label}
                                  {item.optional && ' (Optional)'}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* API Key Warning */}
                          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4">
                            <div className="flex items-center gap-3 text-yellow-400 mb-2">
                              <Key className="w-5 h-5" />
                              <span className="font-semibold">API Key Usage</span>
                            </div>
                            <p className="text-sm text-yellow-200">
                              You're using your own OpenAI API key. Costs will be charged directly to your OpenAI account.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Ready to Deploy */}
                    <div className="text-center">
                      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                          <Zap className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Ready to Generate!</h3>
                        <p className="text-gray-400 mb-6 max-w-md mx-auto">
                          Your AI assistant will be created and ready to use in about 1 minute.
                        </p>

                        <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>All requirements met</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-700/50">
                  <button
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-xl hover:bg-gray-800/50"
                  >
                    <ChevronLeft size={20} />
                    Previous
                  </button>

                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">
                      Step {currentStep} of 4
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`w-2 h-2 rounded-full transition-all ${step === currentStep
                            ? 'bg-blue-400 w-6'
                            : step < currentStep
                              ? 'bg-green-400'
                              : 'bg-gray-600'
                            }`}
                        />
                      ))}
                    </div>
                  </div>

                  {currentStep < 4 ? (
                    <button
                      onClick={handleNext}
                      disabled={!canProceedToNextStep()}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:scale-105"
                    >
                      Next
                      <ChevronRight size={20} />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-green-500/20 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Creating Agent...
                        </>
                      ) : (
                        <>
                          <Zap size={20} />
                          Create Agent
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          border: 2px solid white;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .slider::-webkit-slider-track {
          background: linear-gradient(to right, #374151, #4b5563);
          border-radius: 8px;
        }
      `}</style>
    </>
  );
}