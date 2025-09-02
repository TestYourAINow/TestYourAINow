"use client";

import React from "react";
import { toast } from "sonner";
import { Upload, Link, Calendar, X, Plus, Sparkles } from "lucide-react";
import type { AgentIntegration } from "@/types/integrations";

export type IntegrationType = "files" | "webhook" | "calendly" | "google_calendar";

interface SelectIntegrationModalProps {
  onSelect: (type: IntegrationType) => void;
  onClose: () => void;
  existingIntegrations: AgentIntegration[];
}

export default function SelectIntegrationModal({
  onSelect,
  onClose,
  existingIntegrations,
}: SelectIntegrationModalProps) {
  const alreadyHasFileUpload = existingIntegrations.some(i => i.type === "files");

  const handleClick = (type: IntegrationType) => {
    if (type === "files" && alreadyHasFileUpload) {
      toast.error("You can only have one File Upload integration.");
      return;
    }
    onSelect(type);
  };

  // Dans /components/integrations/SelectIntegrationModal.tsx
// REMPLACEZ la section integrationOptions par :

const integrationOptions = [
  {
    type: "files" as IntegrationType,
    title: "File Upload",
    description: "Upload documents to enhance your agent's knowledge",
    icon: Upload,
    gradient: "from-orange-600 to-red-600",
    bgGradient: "from-orange-500/10 to-red-500/10",
    borderColor: "border-orange-500/30",
    iconBg: "bg-orange-500/20",
    iconColor: "text-orange-400",
    shadowColor: "",
    disabled: alreadyHasFileUpload,
    disabledReason: "Only one file upload integration allowed"
  },
  {
    type: "webhook" as IntegrationType,
    title: "Webhook",
    description: "Connect your agent to external services and APIs",
    icon: Link,
    gradient: "from-blue-600 to-cyan-600",
    bgGradient: "from-blue-500/10 to-cyan-500/10",
    borderColor: "border-blue-500/30",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
    shadowColor: "",
    disabled: false
  },
  {
    type: "calendly" as IntegrationType,
    title: "Calendly",
    description: "Integrate with Calendly for appointment scheduling",
    icon: Calendar,
    gradient: "from-emerald-600 to-blue-600",
    bgGradient: "from-emerald-500/10 to-blue-500/10",
    borderColor: "border-emerald-500/30",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    shadowColor: "",
    disabled: false
  }
  // 🚫 GOOGLE CALENDAR TEMPORAIREMENT SUPPRIMÉ
  // Sera réactivé après vérification Google (4-6 semaines)
  // {
  //   type: "google_calendar" as IntegrationType,
  //   title: "Google Calendar",
  //   description: "Créez des rendez-vous automatiquement dans Google Calendar",
  //   icon: Calendar,
  //   gradient: "from-blue-600 to-green-600",
  //   bgGradient: "from-blue-500/10 to-green-500/10",
  //   borderColor: "border-blue-500/30",
  //   iconBg: "bg-blue-500/20",
  //   iconColor: "text-blue-400",
  //   shadowColor: "hover:shadow-blue-500/20",
  //   disabled: false
  // }
];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-2 md:p-4 pt-20 md:pt-4">
      {/* Modal Container */}
<div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl md:rounded-2xl shadow-2xl w-full max-w-2xl mx-auto max-h-[85vh] md:max-h-[70vh] overflow-hidden">
  <div className="overflow-y-auto max-h-[85vh] md:max-h-[70vh] custom-scrollbar">        
        {/* Header */}
       <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/40 flex items-center justify-center shadow-lg backdrop-blur-sm">
              <Plus className="text-blue-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Add Integration
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">Connect your agent with external services</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200 group"
          >
            <X size={20} className="relative z-10" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {integrationOptions.map((option) => {
            const IconComponent = option.icon;
            
            return (
              <button
                key={option.type}
                onClick={() => !option.disabled && handleClick(option.type)}
                disabled={option.disabled}
                className={`w-full p-5 rounded-xl border transition-all duration-300 text-left group relative overflow-hidden ${
                  option.disabled
                    ? 'opacity-60 cursor-not-allowed bg-gray-800/30 border-gray-700/50'
                    : `bg-gradient-to-r ${option.bgGradient} ${option.borderColor} hover:scale-[1.02] hover:shadow-xl ${option.shadowColor} backdrop-blur-sm`
                }`}
              >
                {/* Shimmer Effect pour les options actives */}
                {!option.disabled && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                )}
                
                <div className="flex items-start gap-4 relative z-10">
                  <div className={`w-14 h-14 rounded-xl ${option.iconBg} border-2 ${option.borderColor} flex items-center justify-center shadow-lg backdrop-blur-sm group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent 
                      size={24} 
                      className={option.disabled ? 'text-gray-500' : option.iconColor} 
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`text-lg font-bold ${
                        option.disabled ? 'text-gray-400' : 'text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent'
                      }`}>
                        {option.title}
                      </h3>
                    </div>
                    <p className={`text-sm leading-relaxed ${
                      option.disabled ? 'text-gray-500' : 'text-gray-300'
                    }`}>
                      {option.disabled && option.disabledReason ? option.disabledReason : option.description}
                    </p>
                    
                    {!option.disabled && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="text-xs text-gray-400 font-medium">Click to configure</div>
                        <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                        <div className="text-xs text-gray-500">Ready to setup</div>
                      </div>
                    )}
                  </div>

                  {!option.disabled && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800/50 border border-gray-600/50 group-hover:bg-gray-700/50 group-hover:border-gray-500/50 transition-all duration-200">
                      <Plus size={14} className="text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-200 text-sm font-semibold">Integration Tips</span>
            </div>
            <p className="text-blue-100/80 text-xs leading-relaxed">
              Each integration enhances your agent's capabilities. You can modify or remove them later from the integrations panel.
            </p>
          </div>
        </div>
      </div>
     </div>
</div>
  );
}