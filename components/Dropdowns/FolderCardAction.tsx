"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { MoreHorizontal, Eye, FolderEdit, Trash2 } from "lucide-react";

type FolderType = {
  _id: string;
  name: string;
  description: string;
  color: string;
  agentCount: number;
  updatedAt: string;
};

interface FolderCardActionProps {
  folder: FolderType;
  onEdit: () => void;
  onDelete: () => void;
  folderType?: 'agent' | 'deployment';
}

export default function FolderCardAction({ 
  folder, 
  onEdit,
  onDelete,
  folderType = 'agent'
}: FolderCardActionProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // S'assurer qu'on est côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculer position du dropdown avec portal
  useEffect(() => {
    const updatePosition = () => {
      if (showDropdown && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        
        // Calculer position optimale (éviter débordement)
        const dropdownWidth = 140;
        const dropdownHeight = 120; // Estimation
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let left = rect.right - dropdownWidth; // Align à droite par défaut
        let top = rect.bottom + 4;
        
        // Ajuster si débordement à droite
        if (left < 8) {
          left = rect.left; // Align à gauche si pas d'espace à droite
        }
        
        // Ajuster si débordement en bas
        if (top + dropdownHeight > viewportHeight - 8) {
          top = rect.top - dropdownHeight - 4; // Placer au-dessus
        }
        
        setDropdownPosition({ top, left });
      }
    };

    if (showDropdown) {
      updatePosition();
      
      // Réévaluer la position au scroll et resize
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
      const clickedElement = event.target as Node;
      
      // Vérifier si on clique dans le bouton principal
      if (buttonRef.current && buttonRef.current.contains(clickedElement)) {
        return;
      }
      
      // Vérifier si on clique dans le dropdown portal
      const dropdowns = document.querySelectorAll('[data-folder-dropdown]');
      for (let dropdown of dropdowns) {
        if (dropdown.contains(clickedElement)) {
          return;
        }
      }
      
      // Sinon, fermer le dropdown
      setShowDropdown(false);
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  // URL basée sur le type de folder
  const getFolderUrl = () => {
    if (folderType === 'deployment') {
      return `/launch-agent/folders/${folder._id}`;
    }
    return `/folders/${folder._id}`;
  };

  return (
    <>
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button 
          ref={buttonRef}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowDropdown(!showDropdown);
          }}
          className="w-8 h-8 rounded-lg bg-gray-800/80 backdrop-blur-sm border border-gray-600/50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700/80 hover:border-gray-500/60 transition-all opacity-0 group-hover:opacity-100 duration-200"
        >
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Portal Dropdown - Même système que ConnectionActions */}
      {mounted && showDropdown && createPortal(
        <div 
          data-folder-dropdown="main"
          className="fixed bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-[99999] min-w-[140px] py-2 animate-fade-in"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Link 
            href={getFolderUrl()} 
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors font-medium"
            onClick={() => setShowDropdown(false)}
          >
            <Eye size={14} className="text-gray-400" />
            View Folder
          </Link>
          
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit();
              setShowDropdown(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors text-left font-medium"
          >
            <FolderEdit size={14} className="text-gray-400" />
            Edit Folder
          </button>
          
          <hr className="my-1 border-gray-700/50" />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
              setShowDropdown(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors text-left font-medium"
          >
            <Trash2 size={14} className="text-red-400" />
            Delete Folder
          </button>
        </div>,
        document.body
      )}
    </>
  );
}