"use client"

import Link from "next/link"
import { Folder, MoreHorizontal, Eye, FolderEdit, Trash2 } from "lucide-react"
import { useState, useRef, useEffect } from "react"

type FolderType = {
  _id: string
  name: string
  description: string
  color: string
  agentCount: number
  updatedAt: string
}

interface FolderCardProps {
  folder: FolderType
  onEdit: () => void  // 🆕 Nouvelle prop
  onDelete: () => void
}

// Actions dropdown pour folder
const FolderActions = ({ 
  folder, 
  onEdit,    // 🆕 Nouveau param
  onDelete
}: { 
  folder: FolderType; 
  onEdit: () => void;   // 🆕 Nouveau param
  onDelete: () => void; 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  return (
    <div ref={dropdownRef} className="relative" onClick={(e) => e.stopPropagation()}>
      <button 
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowDropdown(!showDropdown);
        }}
        className="w-8 h-8 rounded-lg bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-600/50 transition-all opacity-0 group-hover:opacity-100"
      >
        <MoreHorizontal size={14} />
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 top-full mt-1 bg-gray-800/95 backdrop-blur-md border border-gray-600/50 rounded-xl shadow-2xl z-[100] min-w-[140px] py-2">
          <Link href={`/folders/${folder._id}`} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors">
            <Eye size={14} className="text-gray-400" />
            View Folder
          </Link>
          
          {/* 🆕 BOUTON EDIT FOLDER */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit();
              setShowDropdown(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors text-left"
          >
            <FolderEdit size={14} className="text-gray-400" />
            Edit Folder
          </button>
          
          <hr className="my-1 border-gray-600/50" />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
              setShowDropdown(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors text-left"
          >
            <Trash2 size={14} className="text-red-400" />
            Delete Folder
          </button>
        </div>
      )}
    </div>
  );
};

export default function FolderCard({ folder, onEdit, onDelete }: FolderCardProps) {
  return (
    <Link href={`/folders/${folder._id}`}>
      <div className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-2xl shadow-xl p-6 h-[280px] hover:border-gray-500/50 hover:shadow-2xl hover:shadow-gray-500/5 hover:scale-[1.02] transition-all duration-200 group cursor-pointer">
        
        {/* Glow effect subtil */}
        <div 
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-5 transition-all duration-200 pointer-events-none"
          style={{ backgroundColor: folder.color }}
        ></div>
        
        {/* Actions */}
        <div className="absolute top-4 right-4 z-10">
          <FolderActions
            folder={folder}
            onEdit={onEdit}     // 🆕 Passer onEdit
            onDelete={onDelete}
          />
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          {/* Header avec icône folder */}
          <div className="flex items-start justify-between mb-4">
            <div className="relative">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center border group-hover:scale-110 transition-transform duration-200"
                style={{ 
                  backgroundColor: folder.color + '20',
                  borderColor: folder.color + '40'
                }}
              >
                <Folder className="w-7 h-7" style={{ color: folder.color }} />
              </div>
              
              {/* Badge avec nombre d'agents */}
              <div className="absolute -top-2 -right-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-gray-800"
                  style={{ backgroundColor: folder.color }}
                >
                  {folder.agentCount}
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col">
            <div className="mb-4">
              <h3 className="text-white font-semibold text-lg mb-2 truncate group-hover:text-white transition-colors">
                {folder.name}
              </h3>
              
              {/* Description */}
              <p className="text-gray-400 text-sm line-clamp-2 group-hover:text-gray-300 transition-colors">
                {folder.description || "No description provided"}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-auto">
              <div className="flex items-center gap-1">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: folder.color }}
                />
                <span>
                  {folder.agentCount} agent{folder.agentCount !== 1 ? 's' : ''}
                </span>
              </div>
              <span>•</span>
              <span>
                Updated {new Date(folder.updatedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}