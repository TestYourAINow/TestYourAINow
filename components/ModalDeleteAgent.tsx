"use client";

import { useState } from "react";
import { AlertTriangle, X, Trash2, Shield } from "lucide-react";

type Props = {
  agent: { _id: string; name: string };
  onClose: () => void;
  onDelete: (id: string) => void;
};

export default function ModalDeleteAgent({ agent, onClose, onDelete }: Props) {
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agents/${agent._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        onDelete(agent._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isConfirmValid = confirmText === "confirm";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className="relative z-10 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl w-full max-w-md text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="text-red-400" size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">
              Confirm Deletion
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Warning Section */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="text-red-400" size={18} />
              <h3 className="text-lg font-semibold text-red-200">Dangerous Action</h3>
            </div>
            
            <div className="space-y-3">
              <p className="text-red-100/90 text-sm leading-relaxed">
                You are about to permanently delete the agent <span className="font-semibold text-red-200">"{agent.name}"</span>. 
                This action cannot be undone.
              </p>
              
              <div className="bg-red-900/20 rounded-lg p-3 border border-red-500/30">
                <p className="text-red-200 text-xs font-medium mb-1">⚠️ What will be deleted:</p>
                <ul className="text-red-100/80 text-xs space-y-1 pl-4">
                  <li>• All agent configurations and prompts</li>
                  <li>• All conversation history</li>
                  <li>• All integrations and connections</li>
                  <li>• All versions and backups</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Confirmation Section */}
          <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-yellow-400" size={18} />
              <h3 className="text-lg font-semibold text-yellow-200">Security Confirmation</h3>
            </div>
            
            <div className="space-y-3">
              <p className="text-gray-300 text-sm">
                Type <code className="bg-gray-800 text-yellow-300 px-2 py-1 rounded font-mono text-xs">confirm</code> to enable deletion:
              </p>
              
              <input
                type="text"
                className="w-full px-4 py-3 border-2 border-gray-500 bg-gray-600 text-white rounded-lg outline-none focus:border-yellow-500 transition-colors duration-150 placeholder-gray-400"
                placeholder="Type 'confirm'"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                autoComplete="off"
              />
              
              {/* Validation Indicator */}
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${
                  isConfirmValid ? 'bg-green-400' : 'bg-gray-500'
                }`}></div>
                <span className={
                  isConfirmValid ? 'text-green-400' : 'text-gray-400'
                }>
                  {isConfirmValid ? 'Confirmation valid' : 'Please type "confirm"'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              disabled={!isConfirmValid || loading}
              onClick={handleDelete}
              className={`flex-1 px-6 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium ${
                isConfirmValid && !loading
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Delete Agent
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}