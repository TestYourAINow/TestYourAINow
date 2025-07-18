'use client';

import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { X, Settings, Copy, ExternalLink } from 'lucide-react';

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
  };
}

export default function CreateDemoModal({ isOpen, onClose, onCreateSuccess, agentConfig }: Props) {
  const [usageLimit, setUsageLimit] = useState(150);
  const [loading, setLoading] = useState(false);
  const [createdDemo, setCreatedDemo] = useState<{ id: string; link: string } | null>(null);

  const handleCreate = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...agentConfig,
          usageLimit,
        }),
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

  const handleCopy = () => {
    if (createdDemo?.link) {
      navigator.clipboard.writeText(createdDemo.link);
      alert('Lien copié !');
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

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl w-full max-w-2xl text-white overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800/50">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {createdDemo ? 'Demo Créée !' : 'Créer une Démo'}
              </h2>
              <p className="text-gray-300 text-sm mt-1">
                {createdDemo 
                  ? `${agentConfig.name} • ID: ${createdDemo.id.slice(-8)}...`
                  : 'Configure ta démo avant de la partager'
                }
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            {!createdDemo ? (
              // Configuration Phase
              <>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Settings className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold text-blue-200">Configuration de la démo</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Agent:</span>
                      <span className="text-white ml-2 font-medium">{agentConfig.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Thème:</span>
                      <span className="text-white ml-2 capitalize">{agentConfig.theme}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Couleur:</span>
                      <div className="inline-flex items-center ml-2 gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-600" 
                          style={{ backgroundColor: agentConfig.color }}
                        />
                        <span className="text-white text-xs font-mono">{agentConfig.color}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Message bienvenue:</span>
                      <span className="text-white ml-2">{agentConfig.showWelcome ? 'Activé' : 'Désactivé'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Limite d'utilisation
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          min={1}
                          max={150}
                          value={usageLimit}
                          onChange={(e) => setUsageLimit(Number(e.target.value))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="150"
                        />
                        <span className="absolute right-3 top-3 text-gray-400 text-sm">réponses max</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => setUsageLimit(Math.min(usageLimit + 1, 150))}
                          className="w-8 h-6 bg-gray-600 hover:bg-gray-500 border border-gray-500 rounded text-white text-xs flex items-center justify-center transition-colors"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => setUsageLimit(Math.max(usageLimit - 1, 1))}
                          className="w-8 h-6 bg-gray-600 hover:bg-gray-500 border border-gray-500 rounded text-white text-xs flex items-center justify-center transition-colors"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Limite le nombre de réponses que l'IA peut donner (max 150)
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-700">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-6 py-3 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={loading || !agentConfig.agentId}
                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Création...
                      </>
                    ) : (
                      <>
                        <Settings size={16} />
                        Créer la Démo
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              // Success Phase
              <>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 mb-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Settings className="text-green-400" size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-green-200 mb-2">
                      Démo créée avec succès !
                    </h3>
                    <p className="text-gray-300">
                      Ta démo est prête à être partagée avec tes clients
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Lien de partage
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={createdDemo.link}
                        readOnly
                        className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm font-mono"
                      />
                      <button
                        onClick={handleCopy}
                        className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        title="Copier le lien"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-200 mb-2">
                      💡 Comment utiliser ta démo
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>1. Copie le lien ci-dessus</li>
                      <li>2. Partage-le avec tes clients ou prospects</li>
                      <li>3. Ils pourront tester ton agent IA directement</li>
                      <li>4. La démo est limitée à {usageLimit} réponses</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-700">
                  <button
                    onClick={handleClose}
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
              </>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}