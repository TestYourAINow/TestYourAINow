"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { AgentIntegration } from "@/types/integrations";

interface IntegrationActionsProps {
  integration: AgentIntegration;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

export default function IntegrationActions({
  integration,
  onEdit,
  onDelete,
  className = ""
}: IntegrationActionsProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
          left: rect.left - 140 + rect.width, // Aligné à droite
          width: 140 // Width fixe pour le menu
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

  const handleEdit = () => {
    onEdit();
    setShowDropdown(false);
  };

  const handleDelete = () => {
    onDelete();
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
            setShowDropdown(!showDropdown);
          }}
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 group"
        >
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-gray-500/0 to-gray-500/0 group-hover:from-gray-500/10 group-hover:to-gray-500/10 transition-all duration-200"></div>
          <MoreVertical size={14} className="relative z-10" />
        </button>
      </div>

      {/* Portal Dropdown */}
      {mounted && showDropdown && createPortal(
        <div 
          className="fixed bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-[99999] py-2 animate-fade-in"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleEdit();
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
              handleDelete();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all text-left group"
          >
            <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
            Delete
          </button>
        </div>,
        document.body
      )}
    </>
  );
}