"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Bot, ChevronRight, CheckCircle } from "lucide-react";

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
  // 🆕 NOUVEAUX MODÈLES GPT-5
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
  // FIN NOUVEAUX MODÈLES GPT-5
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

interface AiModelDropdownProps {
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function AiModelDropdown({ 
  selectedModel, 
  onModelSelect,
  disabled = false,
  className = ""
}: AiModelDropdownProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const selectedModelData = modelOptions.find(m => m.id === selectedModel);

  // S'assurer qu'on est côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculer la position du dropdown
  useEffect(() => {
    const updatePosition = () => {
      if (showDropdown && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width
        });
      }
    };

    if (showDropdown) {
      updatePosition();
      
      // Mettre à jour la position quand on scroll ou resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [showDropdown]);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);

  const handleSelect = (modelId: string) => {
    onModelSelect(modelId);
    setShowDropdown(false);
  };

  return (
    <>
      <div className={`relative ${className}`} onClick={(e) => e.stopPropagation()}>
        <button
          ref={buttonRef}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!disabled) {
              setShowDropdown(!showDropdown);
            }
          }}
          disabled={disabled}
          className={`w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 rounded-xl focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 outline-none text-white flex items-center justify-between hover:bg-gray-800/80 transition-all backdrop-blur-sm ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-lg">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium">{selectedModelData?.name || 'Select Model'}</div>
              {selectedModelData?.badge && (
                <div className="text-xs text-gray-400">{selectedModelData.badge}</div>
              )}
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-90' : 'rotate-0'}`} />
        </button>
      </div>

      {/* Portal Dropdown */}
      {mounted && showDropdown && !disabled && createPortal(
        <div 
          className="fixed bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-[99999] max-h-80 overflow-y-auto animate-fade-in"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {modelOptions.map((model) => (
            <button
              key={model.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelect(model.id);
              }}
              className={`w-full p-4 text-left hover:bg-gray-800/50 transition-all border-b border-gray-700/30 last:border-b-0 ${
                selectedModel === model.id ? 'bg-blue-500/20 border-blue-500/30' : ''
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded flex items-center justify-center">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <span className="font-medium text-white">{model.name}</span>
                {model.badge && (
                  <span className={`px-2 py-1 text-xs rounded-full text-white ${model.badgeColor}`}>
                    {model.badge}
                  </span>
                )}
                {selectedModel === model.id && (
                  <CheckCircle className="w-4 h-4 text-blue-400 ml-auto" />
                )}
              </div>
              <p className="text-sm text-gray-400 mb-2">{model.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Input: ${model.inputPrice}/1M</span>
                <span>Output: ${model.outputPrice}/1M</span>
                <span>Context: {model.contextWindow}</span>
              </div>
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}