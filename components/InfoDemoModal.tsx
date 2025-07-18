'use client';

import { Dialog } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { X, Copy, ExternalLink, Activity, Calendar, MessageSquare, User } from 'lucide-react';

interface DemoInfo {
  name: string;
  link: string;
  usageLimit: number;
  usedCount: number;
  createdAt: string;
  messages: { role: string; content: string }[];
  agentName: string;
  theme: string;
  color: string;
  chatTitle: string;
  subtitle: string;
}

interface Props {
  demoId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoDemoModal({ demoId, isOpen, onClose }: Props) {
  const [info, setInfo] = useState<DemoInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (demoId && isOpen) {
      setLoading(true);
      fetch(`/api/demo/${demoId}`)
        .then((res) => res.json())
        .then((data) => {
          setInfo(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [demoId, isOpen]);

  const handleCopy = () => {
    if (info?.link) {
      navigator.clipboard.writeText(info.link);
      alert("Lien copié !");
    }
  };

  const handleOpenDemo = () => {
    if (info?.link) {
      window.open(info.link, '_blank', 'noopener,noreferrer,width=800,height=600');
    }
  };

  const usagePercentage = info ? (info.usedCount / info.usageLimit) * 100 : 0;
  const getUsageColor = () => {
    if (usagePercentage < 50) return 'bg-green-500';
    if (usagePercentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl w-full max-w-2xl text-white overflow-hidden max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800/50">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-white truncate">
                {info?.name || 'Démonstration'}
              </h2>
              <p className="text-gray-300 text-sm mt-1">
                {loading ? 'Chargement...' : `Agent: ${info?.agentName || 'N/A'}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg ml-4"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <span className="ml-3 text-gray-400">Chargement des informations...</span>
              </div>
            ) : info ? (
              <div className="space-y-6">
                {/* Configuration Section */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <User className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold text-blue-200">Configuration</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Agent utilisé:</span>
                      <span className="text-white ml-2 font-medium">{info.agentName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Thème:</span>
                      <span className="text-white ml-2 capitalize">{info.theme}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Couleur principale:</span>
                      <div className="inline-flex items-center ml-2 gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-600" 
                          style={{ backgroundColor: info.color }}
                        />
                        <span className="text-white text-xs font-mono">{info.color}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Titre du chat:</span>
                      <span className="text-white ml-2">{info.chatTitle}</span>
                    </div>
                  </div>
                </div>

                {/* Share Section */}
                <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <ExternalLink className="text-green-400" size={20} />
                    <h3 className="text-lg font-semibold text-green-200">Lien de partage</h3>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={info.link}
                      readOnly
                      className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm font-mono"
                    />
                    <button
                      onClick={handleCopy}
                      className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                      title="Copier le lien"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={handleOpenDemo}
                      className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                      title="Ouvrir la démo"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>

                {/* Usage Statistics */}
                <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="text-purple-400" size={20} />
                    <h3 className="text-lg font-semibold text-purple-200">Utilisation</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Réponses utilisées:</span>
                      <span className="text-white font-medium">{info.usedCount} / {info.usageLimit}</span>
                    </div>
                    
                    <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getUsageColor()}`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      />
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      {usagePercentage < 100 
                        ? `${Math.round(100 - usagePercentage)}% restant`
                        : 'Limite atteinte'
                      }
                    </div>
                  </div>
                </div>

                {/* Creation Date */}
                <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="text-orange-400" size={20} />
                    <h3 className="text-lg font-semibold text-orange-200">Date de création</h3>
                  </div>
                  
                  <p className="text-white">
                    {new Date(info.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {/* Message History */}
                <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <MessageSquare className="text-cyan-400" size={20} />
                    <h3 className="text-lg font-semibold text-cyan-200">Historique des messages</h3>
                  </div>
                  
                  {info.messages?.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto space-y-3">
                      {info.messages.map((message, idx) => (
                        <div key={idx} className="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              message.role === 'user' 
                                ? 'bg-blue-500/20 text-blue-300' 
                                : 'bg-green-500/20 text-green-300'
                            }`}>
                              {message.role === 'user' ? 'Utilisateur' : 'Assistant'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed">{message.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic text-center py-4">
                      Aucun message sauvegardé pour le moment
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-700">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={handleOpenDemo}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={16} />
                    Ouvrir la Démo
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="text-red-400" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-red-200 mb-2">
                  Erreur de chargement
                </h3>
                <p className="text-gray-400">
                  Impossible de charger les informations de cette démo
                </p>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}