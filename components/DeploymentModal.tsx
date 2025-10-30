// components\DeploymentModal.tsx

import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Copy, Check, Code, ExternalLink, Rocket, Zap, Shield } from 'lucide-react';

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgetId: string;
  widgetName: string;
}

interface DeployButtonProps {
  widgetId: string;
  onDeploy: () => void;
  disabled?: boolean;
}

export const DeployButton: React.FC<DeployButtonProps> = ({
  widgetId,
  onDeploy,
  disabled = false,
}) => {
  return (
    <button
      onClick={onDeploy}
      disabled={disabled || !widgetId}
      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      <div className="relative z-10 flex items-center gap-3">
        <Rocket className="w-5 h-5" />
        Deploy Widget
      </div>
    </button>
  );
};

export const DeploymentModal: React.FC<DeploymentModalProps> = ({
  isOpen,
  onClose,
  widgetId,
  widgetName,
}) => {
  const [copied, setCopied] = useState(false);

  // 🎯 SCRIPT D'INTÉGRATION CORRIGÉ
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://testyourainow.com';
  const embedCode = `<script>
(function() {
  if (window.AIChatWidget) return;
  var script = document.createElement('script');
  script.src = '${baseUrl}/widget-client.js';
  script.onload = function() {
    window.AIChatWidget.init({ widgetId: '${widgetId}' });
  };
  document.body.appendChild(script);
})();
</script>`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden overflow-y-auto custom-scrollbar">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/40 flex items-center justify-center shadow-lg">
                <Rocket className="text-blue-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  Deploy Your AI Widget
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {widgetName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200 group"
            >
              <X size={20} className="relative z-10" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            
            {/* 🚀 Instructions rapides */}
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="text-blue-400" size={20} />
                <h3 className="text-lg font-semibold text-blue-200">Ultra Simple Deployment</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-blue-300">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-sm font-bold">1</div>
                  <span className="text-sm">Copy the code below</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-sm font-bold">2</div>
                  <span className="text-sm">Paste before &lt;/body&gt;</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-sm font-bold">3</div>
                  <span className="text-sm">Widget loads instantly</span>
                </div>
              </div>
            </div>

            {/* 💎 Code Section Améliorée */}
            <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Code className="text-emerald-400" size={20} />
                  <h3 className="text-lg font-semibold text-emerald-200">One-Line Integration Code</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Shield size={14} />
                  <span>Secure • Responsive • Fast</span>
                </div>
              </div>
              
              <div className="relative">
                <pre className="bg-gray-900/80 border border-gray-700/50 rounded-xl p-4 text-sm text-gray-300 overflow-x-auto backdrop-blur-sm custom-scrollbar">
                  <code className="font-mono text-emerald-300">{embedCode}</code>
                </pre>
                <button
                  onClick={copyToClipboard}
                  className="absolute top-3 right-3 bg-gradient-to-r from-emerald-600/80 to-emerald-500/80 hover:from-emerald-500/80 hover:to-emerald-400/80 text-white px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 backdrop-blur-sm border border-emerald-500/50 hover:border-emerald-400/50 shadow-lg"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span className="text-xs font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span className="text-xs font-medium">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 🔗 Test Link */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-blue-200 mb-1">Test Your Widget</h4>
                  <p className="text-sm text-blue-300">Preview how it looks before deploying</p>
                </div>
                <a
                  href={`${baseUrl}/api/widget/${widgetId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 border border-blue-500/40"
                >
                  <ExternalLink size={16} />
                  <span className="text-sm font-medium">Preview</span>
                </a>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 p-6 pt-0">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3.5 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-xl font-semibold transition-all backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50"
            >
              Close
            </button>
            <button
              onClick={copyToClipboard}
              className="flex-1 px-4 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 transform hover:scale-105 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="relative z-10 flex items-center justify-center gap-2">
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Code Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Integration Code
                  </>
                )}
              </div>
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};