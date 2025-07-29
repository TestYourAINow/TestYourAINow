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
}

export default function FolderCardAction({ 
  folder, 
  onEdit,
  onDelete
}: FolderCardActionProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // S'assurer qu'on est côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculer position du dropdown
  useEffect(() => {
    const updatePosition = () => {
      if (showDropdown && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 4,
          left: rect.right - 140 // Align à droite du bouton
        });
      }
    };

    if (showDropdown) {
      updatePosition();
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

      {/* Portal Dropdown */}
      {mounted && showDropdown && createPortal(
        <div 
          data-folder-dropdown="main"
          className="fixed bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl z-[99999] min-w-[140px] py-2 animate-fade-in"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Link 
            href={`/folders/${folder._id}`} 
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