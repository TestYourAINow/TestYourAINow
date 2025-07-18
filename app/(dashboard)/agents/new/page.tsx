"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TextareaAutosize from "react-textarea-autosize";
import { toast, Toaster } from "react-hot-toast";
import { Settings, Bot, MessageCircle, Globe, Info, User, Upload, Zap, CheckCircle, AlertCircle } from "lucide-react";
import ImportWebsiteModal from "@/components/ImportWebsiteModal";

type Step = 1 | 2;

const defaultFields = {
  name: "",
  template: "",
  openaiModel: "gpt-4o",
  apiKey: "",
  description: "",
  questions: "",
  tone: "",
  rules: "",
  companyInfo: "",
  language: "",
  industry: "",
};

const defaultAdvancedSettings = {
  temperature: 0.3,
  top_p: 1,
};

const templatePresets: Record<string, Partial<typeof defaultFields>> = {
  support: {
    description:
      "Create an AI that should work as a support agent for a (INDUSTRY) Company. Friendly, engaging, with great support skills and empathy.",
    questions:
      "The AI should handle any objections and questions from (INDUSTRY) customers. Then ask a variation of is there anything else I can help you with?",
    tone:
      "The AI should speak (LANGUAGE). The prompt should be written in (LANGUAGE). AI should speak Informal and friendly tone. Like 2 friends texting on SMS. Grade 3 according to the Hemingway app.",
    rules: `1. Handle questions with empathy and understanding.\n2. Never repeat a customer's question back to them.\n3. Don't use !'s extensively.\n4. Use smiley emojis sometimes.`,
  },
  sales: {
    description:
      "Create an AI that works as a receptionist for a (INDUSTRY) Company. Friendly, engaging, but also have the sales skills of Jeremy Miner.",
    questions: `The AI should ALWAYS answer any questions and objections first, AND ALWAYS ask this question in first it's response:\n1. (Add a question that a sales person would ask the customer in (INDUSTRY))\nThen, it should ask each of these questions 1 by 1 to go through the rest of the conversation flow:\n2. (Add a question that a sales person would ask the customer in (INDUSTRY))\n3. Would mornings or afternoons usually work best for a quick phone call?`,
    tone:
      "The AI should speak (LANGUAGE). The prompt should be written in (LANGUAGE). AI should speak Informal and friendly tone. Like 2 friends texting on SMS. Grade 3 according to the Hemingway app.",
    rules: `1. Only ask one question at a time.\n2. Never repeat a question.\n3. Don't use !'s extensively.\n4. Use smiley emojis sometimes.`,
  },
};

// Fonction pour évaluer la qualité du contenu
const getContentQuality = (content: string, minLength: number = 50) => {
  if (!content.trim()) return { status: 'empty', message: 'Field is empty', color: 'text-gray-400' };
  if (content.length < minLength) return { status: 'short', message: 'Consider adding more detail', color: 'text-yellow-400' };
  if (content.length < minLength * 2) return { status: 'good', message: 'Good content', color: 'text-green-400' };
  return { status: 'excellent', message: 'Excellent detail', color: 'text-green-400' };
};

// Composant pour les indicateurs de qualité
const QualityIndicator = ({ content, minLength = 50 }: { content: string; minLength?: number }) => {
  const quality = getContentQuality(content, minLength);
  
  if (quality.status === 'empty') return null;
  
  return (
    <div className={`flex items-center gap-1 text-xs mt-1 ${quality.color}`}>
      {quality.status === 'short' ? (
        <AlertCircle size={12} />
      ) : (
        <CheckCircle size={12} />
      )}
      {quality.message}
    </div>
  );
};

// Composant pour le compteur de caractères
const CharacterCounter = ({ content, maxLength = 1000 }: { content: string; maxLength?: number }) => {
  const percentage = (content.length / maxLength) * 100;
  const isNearLimit = percentage > 80;
  
  return (
    <div className={`text-xs mt-1 ${isNearLimit ? 'text-yellow-400' : 'text-gray-400'}`}>
      {content.length}/{maxLength} characters
    </div>
  );
};

// Composant pour l'indicateur de progression
const ProgressIndicator = ({ currentStep }: { currentStep: Step }) => {
  return (
    <div className="flex items-center justify-center gap-3 mb-6">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-600'} flex items-center justify-center text-white text-sm font-semibold transition-colors`}>
          {currentStep > 1 ? <CheckCircle size={16} /> : '1'}
        </div>
        <div className={`w-12 h-0.5 transition-colors ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-600'}`} />
        <div className={`w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-600'} flex items-center justify-center text-white text-sm font-semibold transition-colors`}>
          2
        </div>
      </div>
      <div className="text-sm text-gray-400 ml-3">
        Step {currentStep} of 2
      </div>
    </div>
  );
};

export default function CreateAgentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>(1);
  const [fields, setFields] = useState({ ...defaultFields });
  const [advanced, setAdvanced] = useState(defaultAdvancedSettings);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [faqGenerating, setFaqGenerating] = useState(false);
  const [originalCompanyText, setOriginalCompanyText] = useState("");
  const [isFaqGenerated, setIsFaqGenerated] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const modalName = searchParams.get("name");
    const modalLang = searchParams.get("language");
    const modalIndustry = searchParams.get("industry");
    const template = searchParams.get("template");
    const isFromScratch = !template || template === "blank";

    if (modalName || modalLang || modalIndustry || template) {
      const newFields = {
        ...fields,
        name: modalName || fields.name,
        language: modalLang || fields.language,
        industry: modalIndustry || fields.industry,
        template: isFromScratch ? "select" : template!,
        ...(templatePresets[template ?? ""] ?? {}),
      };

      for (const key of ["description", "questions", "tone"]) {
        const value = newFields[key as keyof typeof fields];
        if (value?.includes("(LANGUAGE)") || value?.includes("(INDUSTRY)")) {
          newFields[key as keyof typeof fields] = value
            .replaceAll("(LANGUAGE)", modalLang ?? "English")
            .replaceAll("(INDUSTRY)", modalIndustry ?? "technology");
        }
      }

      setFields(newFields);
    }
  }, []);

  const handleInput = (
    field: keyof typeof defaultFields,
    value: string
  ) => {
    setFields((prev) => ({ ...prev, [field]: value }));
  };

  const clearField = (field: keyof typeof defaultFields) => {
    setFields((prev) => ({ ...prev, [field]: "" }));
  };

  const handleTemplateSelect = (value: string) => {
    if (value === "") {
      setFields((prev) => ({ 
        ...prev, 
        template: "", 
        description: "", 
        questions: "", 
        tone: "", 
        rules: "", 
      }));
      return;
    }
    
    const base = {
      template: value,
      ...(templatePresets[value] ?? {}),
    };
    setFields((prev) => ({ ...prev, ...base }));
  };

  const handleSubmit = async () => {
    setShowOverlay(true);
    setLoading(true);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, ...advanced }),
      });
      const text = await res.text();
      let data = null;
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error("Invalid JSON response");
      }
      if (!res.ok || !data?.id) {
        throw new Error(data?.error || "Failed to create agent");
      }
      toast.success("Agent created successfully");
      
      // Add the POST request to generate prompt
      await fetch(`/api/agents/${data.id}/generate-prompt`, {
        method: "POST"
      });
      
      setTimeout(() => router.push(`/agents/${data.id}`), 800);
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while creating your agent.");
    } finally {
      setLoading(false);
      setShowOverlay(false);
    }
  };

  // Calculer la complétude générale
  const getCompleteness = () => {
    const requiredFields = ['name', 'description', 'questions', 'tone', 'rules'];
    const completedFields = requiredFields.filter(field => fields[field as keyof typeof fields].trim().length > 0);
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1f2937",
            color: "#fff",
            border: "1px solid #4b5563",
          },
        }}
      />
      
      {/* Modal d'import de site web */}
      <ImportWebsiteModal
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        onImport={(content: string) => handleInput("companyInfo", content)}
      />

      {/* Loading Overlay */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl p-8 shadow-2xl">
            <div className="animate-spin h-10 w-10 rounded-full border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
            <p className="text-white font-medium text-lg">Building your AI...</p>
            <p className="text-sm text-gray-400 mt-2">This usually takes around 1 minute.</p>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="min-h-screen bg-transparent">
        <div className="flex justify-center min-h-screen py-6">
          <div className="w-full max-w-7xl mx-auto px-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">
                Build your AI
              </h1>
              <p className="text-sm text-gray-400">
                Create and configure your AI agent with advanced settings
              </p>
              
              {/* Completeness indicator */}
              <div className="mt-4 bg-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Setup Progress</span>
                  <span className="text-sm text-blue-400">{getCompleteness()}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getCompleteness()}%` }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', height: 'calc(100vh - 240px)', gap: '24px' }}>
              {/* Left Panel - Basic Settings */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl text-white overflow-hidden" style={{ width: '400px', display: 'flex', flexDirection: 'column' }}>
                
                {/* Basic Settings Section */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                  
                  {/* Configuration Générale */}
                  <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Settings className="text-blue-400" size={20} />
                      <h3 className="text-lg font-semibold text-blue-200">Basic Settings</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {/* AI Name */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          AI Name
                        </label>
                        <input
                          value={fields.name}
                          onChange={(e) => handleInput("name", e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150 placeholder-gray-400"
                          placeholder="Example: Sarah Support Bot"
                        />
                        <CharacterCounter content={fields.name} maxLength={50} />
                        <button
                          onClick={() => clearField("name")}
                          className="absolute top-0 right-0 mt-1 mr-2 text-xs text-gray-400 hover:underline"
                        >
                          Clear
                        </button>
                      </div>

                      {/* Template */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Template
                        </label>
                        <select
                          value={fields.template}
                          onChange={(e) => handleTemplateSelect(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150"
                        >
                          <option value="">No template</option>
                          <option value="sales">Sales AI</option>
                          <option value="support">Support AI</option>
                        </select>
                      </div>

                      {/* Model */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Model
                        </label>
                        <select
                          value={fields.openaiModel}
                          onChange={(e) => handleInput("openaiModel", e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150"
                        >
                          <option value="gpt-4o">gpt-4o</option>
                          <option value="gpt-4">gpt-4</option>
                          <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                        </select>
                      </div>

                      {/* API Key */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          OpenAI API Key
                        </label>
                        <input
                          type="password"
                          disabled
                          value="sk-****************************"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg cursor-not-allowed opacity-75"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Advanced Settings */}
                  <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Globe className="text-blue-400" size={20} />
                      <h3 className="text-lg font-semibold text-blue-200">Advanced Settings</h3>
                    </div>

                    <button
                      onClick={() => setShowAdvanced((prev) => !prev)}
                      className="text-sm text-gray-300 hover:text-white transition flex items-center gap-2 mb-4"
                    >
                      <span className="text-lg">{showAdvanced ? '▼' : '►'}</span> 
                      Show Parameters
                    </button>

                    {showAdvanced && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Temperature: {advanced.temperature.toFixed(2)}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={advanced.temperature}
                            onChange={(e) =>
                              setAdvanced((prev) => ({
                                ...prev,
                                temperature: parseFloat(e.target.value),
                              }))
                            }
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="text-xs text-gray-400 mt-2">
                            Controls randomness: Lower values are more focused, higher values more creative
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Top P: {advanced.top_p.toFixed(2)}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={advanced.top_p}
                            onChange={(e) =>
                              setAdvanced((prev) => ({
                                ...prev,
                                top_p: parseFloat(e.target.value),
                              }))
                            }
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="text-xs text-gray-400 mt-2">
                            Controls output diversity: 1.0 considers all tokens, lower values limit to more likely ones
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Panel - Edit AI */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl text-white overflow-hidden" style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                
                {/* Header */}
                <div className="border-b border-gray-700 bg-gray-800/50 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Bot className="text-blue-400" size={24} />
                    <h2 className="text-xl font-semibold text-blue-200">Edit your AI</h2>
                  </div>
                  <p className="text-sm text-gray-400">Define how your AI should interact with users</p>
                </div>

                {/* Progress Indicator */}
                <div className="px-6 py-4 border-b border-gray-700">
                  <ProgressIndicator currentStep={step} />
                </div>

                {/* Step Navigation */}
                <div className="flex gap-6 px-6 py-4 border-b border-gray-700">
                  <button
                    onClick={() => setStep(1)}
                    className={`pb-3 px-2 ${step === 1 ? "text-white border-b-2 border-blue-500" : "text-gray-400 hover:text-white"} transition-colors`}
                  >
                    Step 1: Personality and Purpose
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className={`pb-3 px-2 ${step === 2 ? "text-white border-b-2 border-blue-500" : "text-gray-400 hover:text-white"} transition-colors`}
                  >
                    Step 2: Knowledge and Rules
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                  {step === 1 && (
                    <>
                      {/* Describe the AI */}
                      <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <User className="text-blue-400" size={20} />
                          <h3 className="text-lg font-semibold text-blue-200">Describe the AI</h3>
                        </div>
                        
                        <div className="relative">
                          <p className="text-xs text-gray-400 mb-3">
                            Define what your AI does, its role, and primary objective. Be specific about the context and goals.
                          </p>
                          <TextareaAutosize
                            minRows={3}
                            value={fields.description}
                            onChange={(e) => handleInput("description", e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-3 outline-none focus:border-white focus:border-2 transition-colors duration-150 placeholder-gray-400"
                            placeholder="Example: Customer support specialist for SaaS product, helping users troubleshoot issues and find solutions. Focuses on technical problems, billing questions, and feature explanations."
                          />
                          <QualityIndicator content={fields.description} minLength={50} />
                          <CharacterCounter content={fields.description} maxLength={500} />
                          <button
                            onClick={() => clearField("description")}
                            className="absolute top-0 right-0 mt-1 mr-2 text-xs text-gray-400 hover:underline"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      {/* Questions */}
                      <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <MessageCircle className="text-blue-400" size={20} />
                          <h3 className="text-lg font-semibold text-blue-200">Questions the AI should ask</h3>
                        </div>
                        
                        <div className="relative">
                          <p className="text-xs text-gray-400 mb-3">
                            Define the conversation flow and key questions. Should it follow a structured approach or be more flexible?
                          </p>
                          <TextareaAutosize
                            minRows={3}
                            value={fields.questions}
                            onChange={(e) => handleInput("questions", e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-3 outline-none focus:border-white focus:border-2 transition-colors duration-150 placeholder-gray-400"
                            placeholder="Example: What brings you here today? How can I help you with [your product/service]? Can you describe the specific issue you're experiencing?"
                          />
                          <QualityIndicator content={fields.questions} minLength={30} />
                          <CharacterCounter content={fields.questions} maxLength={800} />
                          <button
                            onClick={() => clearField("questions")}
                            className="absolute top-0 right-0 mt-1 mr-2 text-xs text-gray-400 hover:underline"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      {/* Language, Style and Tone */}
                      <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <Globe className="text-blue-400" size={20} />
                          <h3 className="text-lg font-semibold text-blue-200">Language, Style and Tone</h3>
                        </div>
                        
                        <div className="relative">
                          <p className="text-xs text-gray-400 mb-3">
                            Define the communication style, language, and personality. How should your AI "sound" to users?
                          </p>
                          <TextareaAutosize
                            minRows={3}
                            value={fields.tone}
                            onChange={(e) => handleInput("tone", e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-3 outline-none focus:border-white focus:border-2 transition-colors duration-150 placeholder-gray-400"
                            placeholder="Example: Professional but friendly, conversational, empathetic, like talking to a knowledgeable friend. Uses clear, simple language and avoids jargon."
                          />
                          <QualityIndicator content={fields.tone} minLength={30} />
                          <CharacterCounter content={fields.tone} maxLength={400} />
                          <button
                            onClick={() => clearField("tone")}
                            className="absolute top-0 right-0 mt-1 mr-2 text-xs text-gray-400 hover:underline"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      {/* Rules */}
                      <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <Settings className="text-blue-400" size={20} />
                          <h3 className="text-lg font-semibold text-blue-200">Rules</h3>
                        </div>
                        
                        <div className="relative">
                          <p className="text-xs text-gray-400 mb-3">
                            Set specific behavioral guidelines and constraints. What should your AI always do, never do, or avoid?
                          </p>
                          <TextareaAutosize
                            minRows={4}
                            value={fields.rules}
                            onChange={(e) => handleInput("rules", e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-3 outline-none focus:border-white focus:border-2 transition-colors duration-150 placeholder-gray-400"
                            placeholder="Example: Always ask clarifying questions before providing solutions. Never make assumptions about user's technical level. If unsure, escalate to human support. Keep responses concise and actionable."
                          />
                          <QualityIndicator content={fields.rules} minLength={50} />
                          <CharacterCounter content={fields.rules} maxLength={600} />
                          <button
                            onClick={() => clearField("rules")}
                            className="absolute top-0 right-0 mt-1 mr-2 text-xs text-gray-400 hover:underline"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      {/* Company Information */}
                      <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <Info className="text-blue-400" size={20} />
                          <h3 className="text-lg font-semibold text-blue-200">Company Information for FAQ</h3>
                        </div>
                        
                        <div className="relative">
                          <div className="flex justify-between items-start mb-3">
                            <p className="text-xs text-gray-400">
                              Add comprehensive company information: services, pricing, policies, contact details, FAQs. The more detail, the better your AI will respond to customers.
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowPopup(true)}
                                className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                              >
                                <Upload size={14} />
                                Import from Website
                              </button>
                              {!isFaqGenerated ? (
                                <button
                                  onClick={async () => {
                                    setOriginalCompanyText(fields.companyInfo);
                                    setFaqGenerating(true);
                                    try {
                                      const res = await fetch("/api/generate-faq", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                          content: fields.companyInfo.trim(),
                                          apiKey: fields.apiKey || "user_api_key",
                                        }),
                                      });
                                      const data = await res.json();
                                      const cleaned = (data.faq || "")
                                        .replace(/^```markdown/, "")
                                        .replace(/```$/, "")
                                        .trim();
                                      handleInput("companyInfo", cleaned || "Could not generate FAQ.");
                                      setIsFaqGenerated(true);
                                      toast.success("FAQ generated successfully");
                                    } catch {
                                      toast.error("Something went wrong while generating FAQ.");
                                    } finally {
                                      setFaqGenerating(false);
                                    }
                                  }}
                                  disabled={faqGenerating}
                                  className="text-xs bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                                >
                                  {faqGenerating ? (
                                    <>
                                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                      Converting...
                                    </>
                                  ) : (
                                    <>
                                      <Zap size={14} />
                                      Turn into FAQ
                                    </>
                                  )}
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    handleInput("companyInfo", originalCompanyText);
                                    setIsFaqGenerated(false);
                                    toast.success("Changes reverted successfully");
                                  }}
                                  className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                                >
                                  <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="14" 
                                    height="14" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  >
                                    <path d="M9 14L4 9l5-5"/>
                                    <path d="M4 9h16"/>
                                  </svg>
                                  Revert FAQ
                                </button>
                              )}
                              <button
                                onClick={() => clearField("companyInfo")}
                                className="text-xs text-gray-400 hover:underline"
                              >
                                Clear
                              </button>
                            </div>
                          </div>
                          <TextareaAutosize
                            minRows={6}
                            value={fields.companyInfo}
                            onChange={(e) => handleInput("companyInfo", e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-3 outline-none focus:border-white focus:border-2 transition-colors duration-150 placeholder-gray-400"
                            placeholder="Example: Company Name: TechCorp Solutions | Services: Cloud hosting, web development, technical support | Hours: Mon-Fri 9AM-6PM EST | Contact: support@techcorp.com | Plans: Basic ($29/mo), Pro ($99/mo), Enterprise (custom pricing)"
                          />
                          <QualityIndicator content={fields.companyInfo} minLength={100} />
                          <CharacterCounter content={fields.companyInfo} maxLength={15000} />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Navigation Footer */}
                <div className="border-t border-gray-700 bg-gray-800/50 p-6">
                  <div className="flex justify-between items-center">
                    {step > 1 ? (
                      <button
                        onClick={() => setStep((prev) => (prev - 1) as Step)}
                        className="text-gray-400 hover:text-white transition flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-700"
                      >
                        <span>←</span> Back
                      </button>
                    ) : (
                      <div />
                    )}
                    
                    {step < 2 ? (
                      <button
                        onClick={() => setStep((prev) => (prev + 1) as Step)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
                      >
                        Continue <span>→</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={loading || getCompleteness() < 80}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl"
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Generating...
                          </div>
                        ) : (
                          <>
                            <Zap size={18} />
                            Generate with AI
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
                  {/* Progress message */}
                  <div className="mt-4 text-center">
                    {getCompleteness() < 80 ? (
                      <p className="text-xs text-yellow-400">
                        Complete at least 80% to generate your AI ({getCompleteness()}% done)
                      </p>
                    ) : (
                      <p className="text-xs text-green-400">
                        Ready to generate! ({getCompleteness()}% complete)
                      </p>
                    )}
                  </div>
                  
                  {/* API Key Message */}
                  <div className="mt-2 text-center">
                    <p className="text-xs text-gray-500">You are using your own API key. Do not use too many tokens.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </>
  );
}