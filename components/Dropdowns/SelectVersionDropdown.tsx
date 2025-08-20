"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Clock, ChevronRight, CheckCircle, Trash2 } from "lucide-react";

type AgentVersion = {
  _id: string;
  createdAt: string;
};

interface SelectVersionDropdownProps {
  selectedVersionId: string | null;
  onVersionSelect: (versionId: string) => void;
  versions: AgentVersion[];
  disabled?: boolean;
  className?: string;
}

export default function SelectVersionDropdown({ 
  selectedVersionId, 
  onVersionSelect,
  versions,
  disabled = false,
  className = ""
}: SelectVersionDropdownProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const selectedVersion = versions.find(v => v._id === selectedVersionId);

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

  const handleSelect = (versionId: string) => {
    onVersionSelect(versionId);
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
          className={`w-full px-3 py-2.5 bg-gray-900/80 border border-gray-700/50 rounded-lg focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 outline-none text-white flex items-center justify-between hover:bg-gray-800/80 transition-all backdrop-blur-sm text-sm ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
              <Clock className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium">
              {versions.length === 0 
                ? 'No versions yet' 
                : selectedVersion 
                  ? new Date(selectedVersion.createdAt).toLocaleString()
                  : 'Select version...'
              }
            </span>
          </div>
          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-90' : 'rotate-0'}`} />
        </button>
      </div>

      {/* Portal Dropdown */}
      {mounted && showDropdown && !disabled && createPortal(
        <div 
          className="fixed bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-[99999] animate-fade-in max-h-64 overflow-y-auto custom-scrollbar"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {versions.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">
              No versions yet
            </div>
          ) : (
            <>
              {versions.map((version, index) => (
                <button
                  key={version._id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(version._id);
                  }}
                  className={`w-full p-3 text-left hover:bg-gray-800/50 transition-all border-b border-gray-700/30 ${
                    selectedVersionId === version._id ? 'bg-blue-500/20 border-blue-500/30' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="text-sm font-medium text-white">
                          {new Date(version.createdAt).toLocaleString()}
                        </span>
                        {index === 0 && (
                          <div className="text-xs text-cyan-400 mt-0.5">Latest</div>
                        )}
                      </div>
                    </div>
                    {selectedVersionId === version._id && (
                      <CheckCircle className="text-blue-400" size={16} />
                    )}
                  </div>
                </button>
              ))}
              
              {/* Delete version option */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect("__delete__");
                }}
                className="w-full p-3 text-left hover:bg-red-900/20 transition-all border-t border-gray-700/50 text-red-400"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium">Delete version...</span>
                </div>
              </button>
            </>
          )}
        </div>,
        document.body
      )}
    </>
  );
}