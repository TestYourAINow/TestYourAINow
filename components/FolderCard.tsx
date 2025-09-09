"use client"

import Link from "next/link"
import { Folder } from "lucide-react"
import FolderCardAction from "@/components/Dropdowns/FolderCardAction"

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
  onEdit: () => void
  onDelete: () => void
}

export default function FolderCard({ folder, onEdit, onDelete }: FolderCardProps) {
  return (
    <Link href={`/folders/${folder._id}`}>
      <div className="relative bg-gradient-to-br from-gray-900/60 to-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl p-5 h-[260px] hover:border-gray-500/50 hover:shadow-2xl hover:shadow-gray-500/5 hover:scale-[1.02] transition-all duration-300 group cursor-pointer">
        {/* Glow effect subtil */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-5 transition-all duration-200 pointer-events-none"
          style={{ backgroundColor: folder.color }}
        ></div>

        {/* Actions */}
        <div className="absolute top-4 right-4 z-10">
          <FolderCardAction
            folder={folder}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>

        {/* Content */}
        <div className="flex flex-col h-full">
          {/* Header avec icône folder */}
          <div className="flex items-start justify-between mb-4">
            <div className="relative">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center border-2 group-hover:scale-105 transition-transform duration-300 shadow-lg"
                style={{
                  backgroundColor: folder.color + '20',
                  borderColor: folder.color + '30',
                  boxShadow: `0 4px 12px ${folder.color}20`
                }}
              >
                <Folder className="w-6 h-6" style={{ color: folder.color }} />
              </div>

              {/* Badge avec nombre d'agents */}
              <div className="absolute -top-1 -right-1">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-gray-800 shadow-sm"
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
              <h3 className="text-white font-bold text-base mb-2 line-clamp-2 leading-tight group-hover:text-white transition-colors">
                {folder.name}
              </h3>

              {/* Description */}
              <p className="text-gray-400 text-xs line-clamp-2 group-hover:text-gray-300 transition-colors leading-relaxed">
                {folder.description || "No description provided"}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-auto pt-2 border-t border-gray-700/30">
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