"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Key, ChevronRight, CheckCircle, Plus } from "lucide-react";

export interface ApiKeyOption {
  id: string;
  name: string;
  maskedKey: string;
  isDefault: boolean;
}

interface ApiKeyDropdownProps {
  selectedApiKey: string;
  onApiKeySelect: (keyId: string) => void;
  onAddNewClick: () => void;
  apiKeys: ApiKeyOption[];
  disabled?: boolean;
  className?: string;
}

export default function ApiKeyDropdown({ 
  selectedApiKey, 
  onApiKeySelect,
  onAddNewClick,
  apiKeys,
  disabled = false,
  className = ""
}: ApiKeyDropdownProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const selectedApiKeyData = apiKeys.find(k => k.id === selectedApiKey) || apiKeys.find(k => k.isDefault) || apiKeys[0];

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

  // Fermer sur scroll pour éviter le décalage - SUPPRIMÉ CAR ON SUIT MAINTENANT

  const handleSelect = (keyId: string) => {
    onApiKeySelect(keyId);
    setShowDropdown(false);
  };

  const handleAddNew = () => {
    setShowDropdown(false);
    onAddNewClick();
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
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
              <Key className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">{selectedApiKeyData?.name || 'Select API Key'}</span>
                {selectedApiKeyData?.isDefault && (
                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                    Default
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400 font-mono">{selectedApiKeyData?.maskedKey || 'No key selected'}</div>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-90' : 'rotate-0'}`} />
        </button>
      </div>

      {/* Portal Dropdown */}
      {mounted && showDropdown && !disabled && createPortal(
        <div 
          className="fixed bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-[99999] animate-fade-in"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {apiKeys.map((apiKey) => (
            <button
              key={apiKey.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelect(apiKey.id);
              }}
              className={`w-full p-3 text-left hover:bg-gray-800/50 transition-all border-b border-gray-700/30 last:border-b-0 ${
                selectedApiKey === apiKey.id ? 'bg-blue-500/20 border-blue-500/30' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">{apiKey.name}</span>
                    {apiKey.isDefault && (
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 font-mono">{apiKey.maskedKey}</div>
                </div>
                {selectedApiKey === apiKey.id && (
                  <CheckCircle className="text-blue-400" size={16} />
                )}
              </div>
            </button>
          ))}
          
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddNew();
            }}
            className="w-full p-3 text-left hover:bg-gray-800/50 transition-all text-blue-400 border-t border-gray-700/50"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add New API Key</span>
            </div>
          </button>
        </div>,
        document.body
      )}
    </>
  );
}