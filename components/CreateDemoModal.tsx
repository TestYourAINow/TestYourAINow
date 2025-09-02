'use client';

import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { X, Settings, Copy, ExternalLink, Rocket, CheckCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess?: () => void;
  agentConfig: {
    name: string;
    agentId: string;
    theme: string;
    color: string;
    avatarUrl?: string;
    showWelcome: boolean;
    welcomeMessage: string;
    placeholderText: string;
    chatTitle: string;
    subtitle: string;
    showPopup: boolean;
    popupMessage: string;
    popupDelay: number;
    usageLimit: number; // ✅ REÇU du parent maintenant
  };
}

export default function CreateDemoModal({ isOpen, onClose, onCreateSuccess, agentConfig }: Props) {
  // ❌ SUPPRIMÉ : const [usageLimit, setUsageLimit] = useState(150);
  const [loading, setLoading] = useState(false);
  const [createdDemo, setCreatedDemo] = useState<{ id: string; link: string } | null>(null);

const handleCreate = async () => {
  setLoading(true);

  // 🎯 VALIDATION POPUP MESSAGE - 55 CHARS (NOUVEAU)
  let validatedPopupMessage = agentConfig.popupMessage || '';
  if (validatedPopupMessage.length > 55) {
    validatedPopupMessage = validatedPopupMessage.substring(0, 55);
    alert('⚠️ Popup message truncated to 55 characters maximum');
  }

  // Utiliser validatedPopupMessage au lieu de agentConfig.popupMessage
  const configToSave = {
    ...agentConfig,
    popupMessage: validatedPopupMessage
  };

  try {
    const res = await fetch('/api/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configToSave), // ✅ CHANGÉ : configToSave au lieu de agentConfig
    });

    if (!res.ok) {
      const errorData = await res.json();
      alert(errorData.message || 'Erreur lors de la création');
      setLoading(false);
      return;
    }

    const data = await res.json();
    setCreatedDemo({
      id: data.id,
      link: `${window.location.origin}/shared/${data.id}`
    });

    if (onCreateSuccess) {
      await onCreateSuccess();
    }

  } catch (err) {
    alert('Erreur réseau. Veuillez réessayer.');
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  const handleCopy = async () => {
    if (createdDemo?.link) {
      await navigator.clipboard.writeText(createdDemo.link);
      // Visual feedback could be added here
    }
  };

  const handleOpenDemo = () => {
    if (createdDemo?.link) {
      window.open(createdDemo.link, '_blank', 'noopener,noreferrer,width=800,height=600');
    }
  };

  const handleClose = () => {
    setCreatedDemo(null);
    onClose();
  };

  // ❌ SUPPRIMÉ : const adjustUsageLimit

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-2xl text-white overflow-hidden">
          
          {/* Enhanced Header (INCHANGÉ) */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                createdDemo 
                  ? 'bg-emerald-500/20 border-2 border-emerald-500/40' 
                  : 'bg-blue-500/20 border-2 border-blue-500/40'
              }`}>
                {createdDemo ? (
                  <CheckCircle className="text-emerald-400" size={24} />
                ) : (
                  <Rocket className="text-blue-400" size={24} />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  {createdDemo ? 'Demo Created!' : 'Create Demo'}
                </h2>
                <p className="text-gray-400 text-sm mt-0.5">
                  {createdDemo 
                    ? `${agentConfig.name} • ID: ${createdDemo.id.slice(-8)}...`
                    : 'Review your configuration before creating'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200 group"
            >
              <X size={20} className="relative z-10" />
            </button>
          </div>

          <div className="p-6">
            {!createdDemo ? (
              // ✅ SIMPLIFIÉ : Configuration Phase (sans usage limit)
              <div className="space-y-6">
                
                {/* Enhanced Agent Configuration Display */}
                <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <Settings className="text-blue-400" size={20} />
                    <h3 className="text-lg font-bold text-blue-200">Demo Configuration</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Agent:</span>
                        <span className="text-white font-semibold">{agentConfig.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Theme:</span>
                        <span className="text-white capitalize">{agentConfig.theme}</span>
                      </div>
                      {/* ✅ NOUVEAU : Affichage Usage Limit (lecture seule) */}
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Usage Limit:</span>
                        <span className="text-white font-semibold">{agentConfig.usageLimit} responses</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Color:</span>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-600 shadow-sm" 
                            style={{ backgroundColor: agentConfig.color }}
                          />
                          <span className="text-white text-xs font-mono">{agentConfig.color}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Welcome:</span>
                        <span className={`text-sm font-medium ${agentConfig.showWelcome ? 'text-emerald-400' : 'text-gray-400'}`}>
                          {agentConfig.showWelcome ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Popup:</span>
                        <span className={`text-sm font-medium ${agentConfig.showPopup ? 'text-emerald-400' : 'text-gray-400'}`}>
                          {agentConfig.showPopup ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ❌ SUPPRIMÉ : Enhanced Usage Limit Section */}

                {/* Enhanced Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-700/50">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-3.5 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-xl font-semibold transition-all backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={loading || !agentConfig.agentId}
                    className="flex-1 px-4 py-3.5 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 transform hover:scale-105 relative overflow-hidden group"
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Rocket size={16} />
                        <span>Create Demo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              // Success Phase (INCHANGÉ sauf usageLimit)
              <div className="space-y-6">
                
                {/* Enhanced Success Banner (INCHANGÉ) */}
                <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <CheckCircle className="text-emerald-400" size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-emerald-200 mb-2">
                      Demo Created Successfully!
                    </h3>
                    <p className="text-gray-300">
                      Your demo is ready to share with clients
                    </p>
                  </div>
                </div>

                {/* Enhanced Share Link Section (INCHANGÉ) */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-3">
                      Share Link
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={createdDemo.link}
                        readOnly
                        className="flex-1 px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 rounded-xl text-white text-sm font-mono backdrop-blur-sm"
                      />
                      <button
                        onClick={handleCopy}
                        className="px-4 py-3.5 bg-blue-600/80 hover:bg-blue-500/80 text-white rounded-xl transition-all flex items-center gap-2 backdrop-blur-sm border border-blue-500/30 hover:border-blue-400/40 group"
                        title="Copy link"
                      >
                        <Copy size={16} className="group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>

                  {/* Enhanced Instructions - ✅ CHANGÉ : utilise agentConfig.usageLimit */}
                  <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-xl p-5 space-y-3">
                    <h4 className="text-sm font-bold text-blue-200 flex items-center gap-2">
                      💡 How to use your demo
                    </h4>
                    <div className="space-y-2">
                      {[
                        "Copy the link above",
                        "Share it with your clients or prospects",
                        "They can test your AI agent directly",
                        `Demo is limited to ${agentConfig.usageLimit} responses`
                      ].map((step, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-blue-400 font-bold text-sm mt-0.5">{index + 1}.</span>
                          <span className="text-gray-300 text-sm">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Enhanced Action Buttons (INCHANGÉ) */}
                <div className="flex gap-3 pt-6 border-t border-gray-700/50">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-3.5 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-xl font-semibold transition-all backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleOpenDemo}
                    className="flex-1 px-4 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:scale-105"
                  >
                    <ExternalLink size={16} />
                    <span>Open Demo</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}