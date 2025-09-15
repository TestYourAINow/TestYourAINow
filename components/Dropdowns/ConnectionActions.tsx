"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, Eye, Power, Trash2, FolderOpen, FolderMinus } from "lucide-react";

type Connection = {
  _id: string;
  name: string;
  integrationType: string;
  isActive: boolean;
  folderId?: string | null;
}

type DeploymentFolder = {
  _id: string;
  name: string;
  color: string;
}

interface ConnectionActionsProps {
  connection: Connection;
  deploymentFolders: DeploymentFolder[];
  onToggle: () => void;
  onDelete: () => void;
  onView: () => void;
  onMoveToFolder: (folderId: string | null) => void;
}

export default function ConnectionActions({ 
  connection, 
  deploymentFolders,
  onToggle,
  onDelete,
  onView,
  onMoveToFolder
}: ConnectionActionsProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFolderSubmenu, setShowFolderSubmenu] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [submenuPosition, setSubmenuPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const moveButtonRef = useRef<HTMLButtonElement>(null);

  // S'assurer qu'on est côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculer la position du dropdown principal
  useEffect(() => {
    const updateDropdownPosition = () => {
      if (showDropdown && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 4,
          left: rect.right - 160 // Align à droite
        });
      }
    };

    if (showDropdown) {
      updateDropdownPosition();
      window.addEventListener('scroll', updateDropdownPosition, true);
      window.addEventListener('resize', updateDropdownPosition);
      
      return () => {
        window.removeEventListener('scroll', updateDropdownPosition, true);
        window.removeEventListener('resize', updateDropdownPosition);
      };
    }
  }, [showDropdown]);

  // Calculer la position du submenu
  useEffect(() => {
    const updateSubmenuPosition = () => {
      if (showFolderSubmenu && moveButtonRef.current) {
        const rect = moveButtonRef.current.getBoundingClientRect();
        setSubmenuPosition({
          top: rect.top,
          left: rect.right + 4
        });
      }
    };

    if (showFolderSubmenu) {
      updateSubmenuPosition();
      window.addEventListener('scroll', updateSubmenuPosition, true);
      window.addEventListener('resize', updateSubmenuPosition);
      
      return () => {
        window.removeEventListener('scroll', updateSubmenuPosition, true);
        window.removeEventListener('resize', updateSubmenuPosition);
      };
    }
  }, [showFolderSubmenu]);

  // Fermer les dropdowns quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedElement = event.target as Node;
      
      // Vérifier si on clique dans le bouton principal
      if (buttonRef.current && buttonRef.current.contains(clickedElement)) {
        return;
      }
      
      // Vérifier si on clique dans les dropdowns portals
      const dropdowns = document.querySelectorAll('[data-connection-dropdown]');
      for (let dropdown of dropdowns) {
        if (dropdown.contains(clickedElement)) {
          return;
        }
      }
      
      // Sinon, fermer tous les dropdowns
      setShowDropdown(false);
      setShowFolderSubmenu(false);
    };

    if (showDropdown || showFolderSubmenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown, showFolderSubmenu]);

  const handleMoveToFolder = (folderId: string | null) => {
    console.log('🔄 Moving connection to folder:', folderId);
    onMoveToFolder(folderId);
    setShowDropdown(false);
    setShowFolderSubmenu(false);
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
            setShowFolderSubmenu(false); // Fermer le submenu
          }}
          className="w-8 h-8 rounded-lg bg-gray-800/60 border border-gray-600/50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700/80 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
        >
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Portal Dropdown Principal */}
      {mounted && showDropdown && createPortal(
        <div 
          data-connection-dropdown="main"
          className="fixed bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-[100] min-w-[160px] py-2 animate-fade-in"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Primary Actions */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onView();
              setShowDropdown(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all text-left"
          >
            <Eye size={14} className="text-blue-400" />
            View Details
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggle();
              setShowDropdown(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all text-left"
          >
            <Power size={14} className="text-green-400" />
            {connection.isActive ? 'Deactivate' : 'Activate'}
          </button>

          {/* Folder Actions */}
          <hr className="my-1 border-gray-700/50" />
          
          <button
            ref={moveButtonRef}
            type="button"
            onMouseEnter={() => setShowFolderSubmenu(true)}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowFolderSubmenu(!showFolderSubmenu);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all text-left"
          >
            <FolderOpen size={14} className="text-yellow-400" />
            Move to Folder
            <span className="ml-auto text-gray-500">›</span>
          </button>

          {/* Remove from current folder (if in folder) */}
          {connection.folderId && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🗂️ Removing from current folder');
                handleMoveToFolder(null);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-orange-400 hover:text-orange-300 hover:bg-orange-900/20 transition-all text-left"
            >
              <FolderMinus size={14} />
              Remove from Folder
            </button>
          )}

          {/* Dangerous Actions */}
          <hr className="my-1 border-gray-700/50" />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
              setShowDropdown(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all text-left"
          >
            <Trash2 size={14} />
            Delete Connection
          </button>
        </div>,
        document.body
      )}

      {/* Portal Submenu Folders */}
      {mounted && showFolderSubmenu && createPortal(
        <div 
          data-connection-dropdown="submenu"
          className="fixed bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-[200] min-w-[180px] py-2 max-h-[200px] overflow-y-auto animate-fade-in"
          style={{
            top: `${submenuPosition.top}px`,
            left: `${submenuPosition.left}px`,
          }}
          onMouseEnter={() => setShowFolderSubmenu(true)}
          onMouseLeave={() => setShowFolderSubmenu(false)}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Deployment folders seulement */}
          {deploymentFolders.map((folder) => (
            <button
              key={folder._id}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('📁 Moving to folder:', folder.name, folder._id);
                handleMoveToFolder(folder._id);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all text-left"
            >
              <div 
                className="w-3 h-3 rounded" 
                style={{ backgroundColor: folder.color }}
              ></div>
              <span className="truncate">{folder.name}</span>
            </button>
          ))}

          {deploymentFolders.length === 0 && (
            <div className="px-3 py-2 text-xs text-gray-500 text-center">
              No folders available
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}