"use client";

import React from "react";
import { toast } from "sonner";
import { Upload, Link, Calendar, X, Plus } from "lucide-react";
import type { AgentIntegration } from "@/types/integrations";

export type IntegrationType = "files" | "webhook" | "calendly";

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

  const integrationOptions = [
    {
      type: "files" as IntegrationType,
      title: "File Upload",
      description: "Upload documents to enhance your agent's knowledge",
      icon: Upload,
      color: "from-orange-500/20 to-orange-600/20",
      borderColor: "border-orange-500/30",
      iconColor: "text-orange-400",
      textColor: "text-orange-200",
      disabled: alreadyHasFileUpload,
      disabledReason: "Only one file upload integration allowed"
    },
    {
      type: "webhook" as IntegrationType,
      title: "Webhook",
      description: "Connect your agent to external services and APIs",
      icon: Link,
      color: "from-blue-500/20 to-blue-600/20",
      borderColor: "border-blue-500/30",
      iconColor: "text-blue-400",
      textColor: "text-blue-200",
      disabled: false
    },
    {
      type: "calendly" as IntegrationType,
      title: "Calendly",
      description: "Integrate with Calendly for appointment scheduling",
      icon: Calendar,
      color: "from-green-500/20 to-green-600/20",
      borderColor: "border-green-500/30",
      iconColor: "text-green-400",
      textColor: "text-green-200",
      disabled: false
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className="relative z-10 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl w-full max-w-lg text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800/50">
          <div className="flex items-center gap-3">
            <Plus className="text-blue-400" size={24} />
            <h2 className="text-2xl font-bold text-white">
              Add Integration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300 text-sm mb-6">
            Choose an integration type to connect your agent with external services
          </p>

          <div className="space-y-4">
            {integrationOptions.map((option) => {
              const IconComponent = option.icon;
              
              return (
                <button
                  key={option.type}
                  onClick={() => !option.disabled && handleClick(option.type)}
                  disabled={option.disabled}
                  className={`w-full p-4 rounded-xl border transition-all duration-200 text-left ${
                    option.disabled
                      ? 'opacity-50 cursor-not-allowed bg-gray-700/30 border-gray-600'
                      : `bg-gradient-to-r ${option.color} ${option.borderColor} hover:scale-[1.02] hover:shadow-lg`
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-gray-800/50 ${
                      option.disabled ? 'text-gray-500' : option.iconColor
                    }`}>
                      <IconComponent size={24} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-lg font-semibold mb-1 ${
                        option.disabled ? 'text-gray-400' : option.textColor
                      }`}>
                        {option.title}
                      </h3>
                      <p className={`text-sm ${
                        option.disabled ? 'text-gray-500' : 'text-gray-300'
                      }`}>
                        {option.disabled && option.disabledReason ? option.disabledReason : option.description}
                      </p>
                    </div>

                    {!option.disabled && (
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700/50 group-hover:bg-gray-600/50 transition-colors">
                        <Plus size={12} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer info */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-blue-200 text-sm font-medium">Integration Tips</span>
            </div>
            <p className="text-blue-100/80 text-xs leading-relaxed">
              Each integration will enhance your agent's capabilities. You can modify or remove them later from the integrations panel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}