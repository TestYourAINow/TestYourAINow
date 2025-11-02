// components/ShareAccessModal.tsx - PREMIUM VERSION 🔥

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Copy, Check, Link2, Shield, Eye, EyeOff, Shuffle, Info, Zap } from 'lucide-react';

interface ShareAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectionId: string;
  connectionName: string;
}

export const ShareAccessModal: React.FC<ShareAccessModalProps> = ({
  isOpen,
  onClose,
  connectionId,
  connectionName,
}) => {
  // States
  const [shareToken, setShareToken] = useState<string>('');
  const [shareEnabled, setShareEnabled] = useState<boolean>(false);
  const [sharePermissions, setSharePermissions] = useState<'read-only' | 'editable'>('read-only');
  const [sharePinEnabled, setSharePinEnabled] = useState<boolean>(false);
  const [sharePinCode, setSharePinCode] = useState<string[]>(['', '', '', '', '', '']);
  
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Refs pour les inputs PIN
  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Générer l'URL de partage
  const shareUrl = shareToken 
    ? `${window.location.origin}/shared/connection/${shareToken}`
    : '';

  // Compter les chiffres saisis
  const pinDigitsCount = sharePinCode.filter(d => d !== '').length;
  const isPinComplete = pinDigitsCount === 6;

  // Charger la configuration actuelle
  useEffect(() => {
    if (isOpen && connectionId) {
      fetchShareConfig();
    }
  }, [isOpen, connectionId]);

  const fetchShareConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/connections/${connectionId}/share`);
      const data = await response.json();

      if (data.success) {
        const config = data.shareConfig;
        setShareToken(config.shareToken || '');
        setShareEnabled(config.shareEnabled || false);
        setSharePermissions(config.sharePermissions || 'read-only');
        setSharePinEnabled(config.sharePinEnabled || false);
        
        // Convertir le PIN string en array
        const pinString = config.sharePinCode || '';
        const pinArray = pinString.split('').concat(['', '', '', '', '', '']).slice(0, 6);
        setSharePinCode(pinArray);
      }
    } catch (error) {
      console.error('Error fetching share config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer la saisie d'un chiffre dans le PIN
  const handlePinChange = (index: number, value: string) => {
    // Accepter seulement les chiffres
    if (!/^\d*$/.test(value)) return;

    const newPin = [...sharePinCode];
    newPin[index] = value.slice(-1); // Prendre seulement le dernier caractère
    setSharePinCode(newPin);

    // Auto-focus sur le prochain input
    if (value && index < 5) {
      pinInputRefs.current[index + 1]?.focus();
    }
  };

  // Gérer le backspace
  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !sharePinCode[index] && index > 0) {
      pinInputRefs.current[index - 1]?.focus();
    }
  };

  // Gérer le paste
  const handlePinPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      const newPin = pastedData.split('');
      setSharePinCode(newPin);
      pinInputRefs.current[5]?.focus();
    }
  };

  // Générer un PIN aléatoire de 6 chiffres
  const generateRandomPin = () => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    setSharePinCode(pin.split(''));
    pinInputRefs.current[0]?.focus();
  };

  // Copier l'URL
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy error:', err);
    }
  };

  // Sauvegarder la configuration
  const saveSettings = async () => {
    // Validation : PIN doit être complet si activé
    if (sharePinEnabled && !isPinComplete) {
      alert('PIN code must be exactly 6 digits');
      return;
    }

    setIsSaving(true);
    try {
      const pinString = sharePinCode.join('');
      
      const response = await fetch(`/api/connections/${connectionId}/share`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shareEnabled,
          sharePermissions,
          sharePinEnabled,
          sharePinCode: sharePinEnabled ? pinString : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Share settings saved successfully');
        
        // Fermer le modal automatiquement après 500ms
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        throw new Error(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving share settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden overflow-y-auto custom-scrollbar">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/40 flex items-center justify-center shadow-lg">
                  <Link2 className="text-cyan-400" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Share Connection Access
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {connectionName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400">Loading configuration...</p>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                
                {/* Share Link */}
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-5">
                  <label className="block text-sm font-medium text-cyan-200 mb-3">
                    Share Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 px-4 py-3 bg-gray-900/80 border border-gray-700/50 text-gray-300 rounded-xl outline-none font-mono text-sm"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-3 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 rounded-xl transition-all flex items-center gap-2 text-cyan-300"
                    >
                      {copied ? (
                        <>
                          <Check size={16} />
                          <span className="text-sm font-medium hidden sm:inline">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          <span className="text-sm font-medium hidden sm:inline">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Enable Sharing */}
                <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-200">
                        Enable sharing
                      </label>
                      <p className="text-xs text-gray-400 mt-1">
                        Allow access via the share link
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shareEnabled}
                        onChange={(e) => setShareEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                    </label>
                  </div>
                </div>

                {/* Permissions */}
                <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
                  <label className="block text-sm font-medium text-gray-200 mb-3">
                    Permissions
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-900/70 transition-all border border-gray-700/30">
                      <input
                        type="radio"
                        checked={sharePermissions === 'read-only'}
                        onChange={() => setSharePermissions('read-only')}
                        className="w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 focus:ring-cyan-500"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-200">Read-only</span>
                        <p className="text-xs text-gray-400 mt-0.5">View configuration only, cannot modify</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-900/70 transition-all border border-gray-700/30">
                      <input
                        type="radio"
                        checked={sharePermissions === 'editable'}
                        onChange={() => setSharePermissions('editable')}
                        className="w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 focus:ring-cyan-500"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-200">Editable</span>
                        <p className="text-xs text-gray-400 mt-0.5">Full access to view and modify all settings</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* PIN Security */}
                <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <label className="text-sm font-medium text-gray-200 flex items-center gap-2">
                          Require PIN code
                          <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">6 digits</span>
                        </label>
                        <p className="text-xs text-gray-400 mt-1">
                          Add an extra layer of security with a numeric code
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sharePinEnabled}
                          onChange={(e) => setSharePinEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                      </label>
                    </div>

                    {sharePinEnabled && (
                      <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
                        {/* PIN Input Container avec design premium */}
                        <div className="relative">
                          <div className="flex items-center justify-between mb-3">
                            <label className="text-xs font-medium text-gray-300">
                              Enter 6-digit PIN
                            </label>
                            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                              isPinComplete 
                                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                                : 'bg-gray-700/50 border border-gray-600/40 text-gray-400'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${isPinComplete ? 'bg-cyan-400' : 'bg-gray-500'} animate-pulse`}></div>
                              {pinDigitsCount}/6
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {/* Input principal avec effet glassmorphism */}
                            <div className="relative flex-1 group">
                              <div className="absolute inset-0 bg-cyan-500/10 rounded-xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                              <input
                                type={showPin ? 'text' : 'password'}
                                value={sharePinCode.join('')}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                  const newPin = value.split('').concat(['', '', '', '', '', '']).slice(0, 6);
                                  setSharePinCode(newPin);
                                }}
                                placeholder="• • • • • •"
                                maxLength={6}
                                className="relative w-full px-4 py-3 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 font-mono text-lg tracking-[0.5em] text-center pr-12 placeholder:text-gray-600 placeholder:tracking-[0.5em]"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPin(!showPin)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                              >
                                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                            
                            {/* Bouton Generate */}
                            <button
                              onClick={generateRandomPin}
                              className="px-4 py-3 bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600/50 rounded-xl transition-all flex items-center gap-2 text-gray-300"
                              title="Generate random PIN"
                            >
                              <Shuffle size={18} />
                            </button>
                          </div>
                        </div>

                        {/* Barre de progression visuelle */}
                        <div className="relative h-1.5 bg-gray-900/50 rounded-full overflow-hidden border border-gray-700/30">
                          <div 
                            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out ${
                              isPinComplete 
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-500' 
                                : 'bg-gradient-to-r from-gray-600 to-gray-500'
                            }`}
                            style={{ width: `${(pinDigitsCount / 6) * 100}%` }}
                          ></div>
                        </div>

                        {/* Status Badge avec animation */}
                        <div className={`flex items-center gap-2 text-xs p-3 rounded-lg transition-all duration-300 ${
                          isPinComplete 
                            ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300'
                            : 'bg-gray-800/50 border border-gray-700/30 text-gray-400'
                        }`}>
                          {isPinComplete ? (
                            <>
                              <Check size={14} />
                              <span>PIN is complete and ready to save</span>
                            </>
                          ) : (
                            <>
                              <Zap size={14} />
                              <span>Please enter all 6 digits before saving</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                </div>

                {/* Security Notice - Minimalist floating */}
                {sharePinEnabled && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 px-3 py-2 bg-gray-800/40 border border-gray-700/30 rounded-lg">
                    <Info size={14} className="text-gray-500 flex-shrink-0" />
                    <span>Anyone with this link and PIN can access this connection</span>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 px-4 py-3.5 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-xl font-semibold transition-all backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveSettings}
                disabled={isSaving || isLoading || (sharePinEnabled && !isPinComplete)}
                className="flex-1 px-4 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-cyan-500/20 transform hover:scale-105 disabled:scale-100 disabled:opacity-50 relative overflow-hidden group"
              >
                {isSaving ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <span className="relative z-10">Save Settings</span>
                  </>
                )}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};