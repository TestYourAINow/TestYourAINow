"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { 
  Eye, Edit3, Folder, ChevronDown, FolderMinus, 
  Trash2, MoreHorizontal 
} from "lucide-react";

type Agent = {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
  integrations?: { name: string; type: string }[];
  folderId?: string | null;
};

type FolderType = {
  _id: string;
  name: string;
  description: string;
  color: string;
  agentCount: number;
  updatedAt: string;
};

interface AgentActionsProps {
  agent: Agent;
  onDelete: () => void;
  folders?: FolderType[];
  onMoveToFolder?: (agentId: string, folderId: string | null) => void;
}

export default function AgentActions({ 
  agent, 
  onDelete,
  folders = [],
  onMoveToFolder
}: AgentActionsProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [moveMenuPosition, setMoveMenuPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const moveButtonRef = useRef<HTMLButtonElement>(null);

  // S'assurer qu'on est côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculer position du dropdown principal
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

  // Calculer position du sous-menu Move
  useEffect(() => {
    const updateMovePosition = () => {
      if (showMoveMenu && moveButtonRef.current) {
        const rect = moveButtonRef.current.getBoundingClientRect();
        setMoveMenuPosition({
          top: rect.top,
          left: rect.right + 4
        });
      }
    };

    if (showMoveMenu) {
      updateMovePosition();
      window.addEventListener('scroll', updateMovePosition, true);
      window.addEventListener('resize', updateMovePosition);
      
      return () => {
        window.removeEventListener('scroll', updateMovePosition, true);
        window.removeEventListener('resize', updateMovePosition);
      };
    }
  }, [showMoveMenu]);

  // Fermer les dropdowns quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // NE PAS fermer si on clique dans un des menus
      const clickedElement = event.target as Node;
      
      // Vérifier si on clique dans le bouton principal
      if (buttonRef.current && buttonRef.current.contains(clickedElement)) {
        return;
      }
      
      // Vérifier si on clique dans un des portals (dropdown ou sous-menu)
      const dropdowns = document.querySelectorAll('[data-agent-dropdown]');
      for (let dropdown of dropdowns) {
        if (dropdown.contains(clickedElement)) {
          return;
        }
      }
      
      // Sinon, fermer tout
      setShowDropdown(false);
      setShowMoveMenu(false);
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const handleMoveToFolder = (folderId: string | null) => {
    if (onMoveToFolder) {
      onMoveToFolder(agent._id, folderId);
    }
    setShowDropdown(false);
    setShowMoveMenu(false);
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
            setShowMoveMenu(false);
          }}
          className="w-8 h-8 rounded-lg bg-gray-800/80 backdrop-blur-sm border border-gray-600/50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700/80 hover:border-gray-500/60 transition-all opacity-0 group-hover:opacity-100 duration-200"
        >
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Portal Dropdown Principal */}
      {mounted && showDropdown && createPortal(
        <div 
          data-agent-dropdown="main"
          className="fixed bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl z-[99999] min-w-[140px] py-2 animate-fade-in"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseLeave={() => {
            // Fermer le sous-menu quand on quitte le dropdown principal
            // mais garder le dropdown principal ouvert
            setShowMoveMenu(false);
          }}
        >
          <Link 
            href={`/agents/${agent._id}`} 
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors font-medium"
            onClick={() => setShowDropdown(false)}
          >
            <Eye size={14} className="text-gray-400" />
            View Details
          </Link>
          
          <Link 
            href={`/agent-lab?agentId=${agent._id}`} 
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors font-medium"
            onClick={() => setShowDropdown(false)}
          >
            <Edit3 size={14} className="text-gray-400" />
            Edit in Lab
          </Link>
          
          {onMoveToFolder && (
            <>
              <hr className="my-1 border-gray-700/50" />
              <button
                ref={moveButtonRef}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMoveMenu(!showMoveMenu);
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors text-left font-medium"
              >
                <Folder size={14} className="text-gray-400" />
                Move to Folder
                <ChevronDown size={12} className={`ml-auto transition-transform ${showMoveMenu ? 'rotate-180' : ''}`} />
              </button>
            </>
          )}
          
          <hr className="my-1 border-gray-700/50" />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
              setShowDropdown(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors font-medium"
          >
            <Trash2 size={14} className="text-red-400" />
            Delete
          </button>
        </div>,
        document.body
      )}

      {/* Portal Sous-menu Move */}
      {mounted && showMoveMenu && createPortal(
        <div 
          data-agent-dropdown="submenu"
          className="fixed bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl min-w-[160px] py-2 z-[99999] animate-fade-in"
          style={{
            top: `${moveMenuPosition.top}px`,
            left: `${moveMenuPosition.left}px`,
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={() => {
            // Garder le sous-menu ouvert quand on hover dessus
            setShowMoveMenu(true);
          }}
        >
          {agent.folderId && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMoveToFolder(null);
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-orange-400 hover:text-orange-300 hover:bg-orange-900/20 transition-colors text-left font-medium"
              >
                <FolderMinus size={14} />
                Remove from Folder
              </button>
              <hr className="my-1 border-gray-700/50" />
            </>
          )}
          
          {folders.filter(f => f._id !== agent.folderId).map(folder => (
            <button
              key={folder._id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleMoveToFolder(folder._id);
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors text-left font-medium"
            >
              <div 
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: folder.color }}
              />
              <span className="truncate">{folder.name}</span>
            </button>
          ))}
          
          {folders.filter(f => f._id !== agent.folderId).length === 0 && !agent.folderId && (
            <div className="px-3 py-2.5 text-xs text-gray-500 text-center font-medium">
              No folders available
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}