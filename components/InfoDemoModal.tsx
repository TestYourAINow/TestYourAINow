'use client';

import { Dialog } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { X, Copy, ExternalLink, Activity, Calendar, User, Bot, Palette, Type, Globe } from 'lucide-react';

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
  const [copySuccess, setCopySuccess] = useState(false);

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
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleOpenDemo = () => {
    if (info?.link) {
      window.open(info.link, '_blank', 'noopener,noreferrer,width=800,height=600');
    }
  };

  const usagePercentage = info ? (info.usedCount / info.usageLimit) * 100 : 0;
  const getUsageColor = () => {
    if (usagePercentage < 50) return 'from-emerald-500 to-green-500';
    if (usagePercentage < 80) return 'from-orange-500 to-yellow-500';
    return 'from-red-500 to-red-400';
  };

  const getUsageBgColor = () => {
    if (usagePercentage < 50) return 'bg-emerald-500/20';
    if (usagePercentage < 80) return 'bg-orange-500/20';
    return 'bg-red-500/20';
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-2xl text-white overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border-2 border-blue-500/40 flex items-center justify-center shadow-lg">
                <Bot className="text-blue-400" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent truncate">
                  {info?.name || 'Demo Information'}
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {loading ? 'Loading...' : `Agent: ${info?.agentName || 'N/A'}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200 group ml-4"
            >
              <X size={20} className="relative z-10" />
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  <span className="text-gray-400 font-medium">Loading information...</span>
                </div>
              </div>
            ) : info ? (
              <div className="space-y-6">
                
                {/* Configuration Section */}
                <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <User className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold text-blue-200">Configuration</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-gray-700/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="text-gray-400" size={16} />
                        <span className="text-sm text-gray-400 font-medium">Agent used</span>
                      </div>
                      <span className="text-white font-semibold">{info.agentName}</span>
                    </div>
                    
                    <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-gray-700/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Palette className="text-gray-400" size={16} />
                        <span className="text-sm text-gray-400 font-medium">Theme</span>
                      </div>
                      <span className="text-white font-semibold capitalize">{info.theme}</span>
                    </div>
                    
                    <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-gray-700/30">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-4 rounded-full border border-gray-600" style={{ backgroundColor: info.color }} />
                        <span className="text-sm text-gray-400 font-medium">Primary color</span>
                      </div>
                      <span className="text-white font-mono text-sm">{info.color}</span>
                    </div>
                    
                    <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 border border-gray-700/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Type className="text-gray-400" size={16} />
                        <span className="text-sm text-gray-400 font-medium">Chat title</span>
                      </div>
                      <span className="text-white font-semibold truncate">{info.chatTitle}</span>
                    </div>
                  </div>
                </div>

                {/* Share Section */}
                <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Globe className="text-emerald-400" size={20} />
                    <h3 className="text-lg font-semibold text-emerald-200">Share Link</h3>
                  </div>
                  
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={info.link}
                      readOnly
                      className="flex-1 px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-mono text-sm backdrop-blur-sm"
                    />
                    <button
                      onClick={handleCopy}
                      className="px-4 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:scale-105 relative overflow-hidden group"
                      title="Copy link"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      <div className="relative z-10 flex items-center gap-2">
                        <Copy size={16} />
                        {copySuccess ? 'Copied!' : 'Copy'}
                      </div>
                    </button>
                    <button
                      onClick={handleOpenDemo}
                      className="px-4 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:scale-105 relative overflow-hidden group"
                      title="Open demo"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      <div className="relative z-10 flex items-center gap-2">
                        <ExternalLink size={16} />
                        Open
                      </div>
                    </button>
                  </div>
                </div>

                {/* Usage Statistics */}
                <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="text-purple-400" size={20} />
                    <h3 className="text-lg font-semibold text-purple-200">Usage Statistics</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 font-medium">Responses used</span>
                      <span className="text-white font-bold text-lg">{info.usedCount} / {info.usageLimit}</span>
                    </div>
                    
                    <div className="w-full bg-gray-800/60 rounded-full h-4 overflow-hidden backdrop-blur-sm border border-gray-700/50">
                      <div
                        className={`h-full transition-all duration-500 bg-gradient-to-r ${getUsageColor()} shadow-lg`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      />
                    </div>
                    
                    <div className="text-sm text-gray-400 font-medium">
                      {usagePercentage < 100 
                        ? `${Math.round(100 - usagePercentage)}% remaining`
                        : 'Limit reached'
                      }
                    </div>
                  </div>
                </div>

                {/* Creation Date */}
                <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="text-orange-400" size={20} />
                    <h3 className="text-lg font-semibold text-orange-200">Creation Date</h3>
                  </div>
                  
                  <p className="text-white font-semibold text-lg">
                    {new Date(info.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-700/50">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3.5 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-xl font-semibold transition-all backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleOpenDemo}
                    className="flex-1 px-4 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:scale-105 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <div className="relative z-10 flex items-center justify-center gap-2">
                      <ExternalLink size={16} />
                      Open Demo
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-red-500/20 border-2 border-red-500/40 rounded-full flex items-center justify-center mx-auto mb-6">
                  <X className="text-red-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-red-200 mb-3">
                  Loading Error
                </h3>
                <p className="text-gray-400 max-w-sm mx-auto leading-relaxed">
                  Unable to load demo information. Please try again.
                </p>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}