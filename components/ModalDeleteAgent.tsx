"use client";

import { useState } from "react";
import { AlertTriangle, X, Trash2, Shield, Lock } from "lucide-react";

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
      {/* Enhanced Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Enhanced Modal Content */}
      <div 
        className="relative z-10 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center shadow-lg">
              <AlertTriangle className="text-red-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Confirm Deletion
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200 group disabled:opacity-50"
          >
            <X size={20} className="relative z-10" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Enhanced Warning Section */}
          <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-400" size={20} />
              <h3 className="text-lg font-bold text-red-200">Dangerous Action</h3>
            </div>
            
            <p className="text-red-100/90 text-sm leading-relaxed">
              You are about to permanently delete the agent{" "}
              <span className="font-bold text-red-200 bg-red-500/20 px-2 py-1 rounded-lg">
                "{agent.name}"
              </span>
              . This action cannot be undone.
            </p>
            
            <div className="bg-red-900/30 rounded-xl p-4 border border-red-500/40 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="text-red-300" size={16} />
                <p className="text-red-200 text-sm font-semibold">What will be permanently deleted:</p>
              </div>
              <div className="space-y-2">
                {[
                  "All agent configurations and prompts",
                  "All conversation history and data",
                  "All integrations and connections",
                  "All versions and backups"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-red-100/80 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Confirmation Section */}
          <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Lock className="text-yellow-400" size={20} />
              <h3 className="text-lg font-bold text-yellow-200">Security Confirmation</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                Type{" "}
                <code className="bg-gray-900/80 text-yellow-300 px-2.5 py-1 rounded-lg font-mono text-sm border border-yellow-500/30">
                  confirm
                </code>
                {" "}to enable deletion:
              </p>
              
              <input
                type="text"
                className="w-full px-4 py-3.5 border-2 bg-gray-900/80 text-white rounded-xl outline-none transition-all duration-200 placeholder-gray-400 font-medium backdrop-blur-sm"
                style={{
                  borderColor: isConfirmValid ? '#10b981' : '#6b7280'
                }}
                placeholder="Type 'confirm'"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                autoComplete="off"
              />
              
              {/* Enhanced Validation Indicator */}
              <div className="flex items-center gap-3 text-sm">
                <div className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  isConfirmValid ? 'bg-emerald-400 shadow-emerald-400/50 shadow-md' : 'bg-gray-500'
                }`}></div>
                <span className={`font-medium transition-colors duration-200 ${
                  isConfirmValid ? 'text-emerald-400' : 'text-gray-400'
                }`}>
                  {isConfirmValid ? 'Confirmation valid - deletion enabled' : 'Please type "confirm" to proceed'}
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-700/50">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3.5 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-xl font-semibold transition-all backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              disabled={!isConfirmValid || loading}
              onClick={handleDelete}
              className={`flex-1 px-4 py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-semibold relative overflow-hidden ${
                isConfirmValid && !loading
                  ? "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg hover:shadow-xl hover:shadow-red-500/20 transform hover:scale-105"
                  : "bg-gray-700/50 text-gray-400 cursor-not-allowed border border-gray-600/50"
              }`}
            >
              {/* Shimmer effect */}
              {isConfirmValid && !loading && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              )}
              
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  <span>Delete Agent</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}