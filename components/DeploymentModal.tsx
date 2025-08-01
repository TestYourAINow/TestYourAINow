import React, { useState } from 'react';
import { X, Copy, Check, Code, ExternalLink, Rocket, Globe, HelpCircle } from 'lucide-react';

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

  if (!isOpen) return null;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://testyourainow.com';

  const embedCode = `<!-- Add this before </body> -->
<script type="text/javascript">
  window.addEventListener('DOMContentLoaded', function() {
    var s = document.createElement('script');
    s.src = "${baseUrl}/widget-client.js";
    s.async = true;
    s.onload = function() {
      window.AIChatWidget.init({ widgetId: "${widgetId}" });
    };
    document.body.appendChild(s);
  });
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border-2 border-blue-500/40 flex items-center justify-center shadow-lg">
              <Rocket className="text-blue-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Deploy Widget
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {widgetName} • ID: {widgetId.slice(-8)}...
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
          
          {/* Instructions Section */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <Code className="text-blue-400" size={20} />
              <h3 className="text-lg font-semibold text-blue-200">How to Deploy Your Widget</h3>
            </div>
            <ol className="text-blue-300 space-y-2 ml-6 list-decimal">
              <li className="leading-relaxed">Copy the HTML code below</li>
              <li className="leading-relaxed">Paste it before the &lt;/body&gt; tag of your website</li>
              <li className="leading-relaxed">The widget will load automatically</li>
            </ol>
          </div>

          {/* Code Section */}
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="text-emerald-400" size={20} />
              <h3 className="text-lg font-semibold text-emerald-200">HTML Embed Code</h3>
            </div>
            
            <div className="relative">
              <pre className="bg-gray-900/80 border border-gray-700/50 rounded-xl p-4 text-sm text-gray-300 overflow-x-auto backdrop-blur-sm custom-scrollbar">
                <code className="font-mono">{embedCode}</code>
              </pre>
              <button
                onClick={copyToClipboard}
                className="absolute top-3 right-3 bg-gradient-to-r from-gray-700/80 to-gray-600/80 hover:from-gray-600/80 hover:to-gray-500/80 text-white p-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 backdrop-blur-sm border border-gray-600/50 hover:border-gray-500/50"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-400">Copied!</span>
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

          {/* Help Section */}
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <HelpCircle className="text-orange-400" size={20} />
              <h4 className="text-lg font-semibold text-orange-200">Need Help?</h4>
            </div>
            <p className="text-gray-300 leading-relaxed">
              This code works on <strong className="text-white">WordPress</strong>, <strong className="text-white">Shopify</strong>, <strong className="text-white">Webflow</strong>, static sites, and more. 
              Place it before the &lt;/body&gt; tag for proper functionality.
            </p>
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
            className="flex-1 px-4 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:scale-105 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <div className="relative z-10 flex items-center justify-center gap-2">
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Code
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};