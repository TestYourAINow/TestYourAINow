import React, { useState } from 'react';
import { X, Copy, Check, Code, ExternalLink } from 'lucide-react';

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
      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
    >
      <ExternalLink className="w-5 h-5" />
      Déployer le Widget
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://votre-domaine.com';

  // ✅ VERSION SÉCURISÉE : utilise DOMContentLoaded pour garantir que body existe
  const embedCode = `<!-- Ajoutez ceci avant </body> -->
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
      console.error('Erreur lors de la copie:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-600 w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <div>
            <h2 className="text-xl font-semibold text-white">Déployer le Widget</h2>
            <p className="text-sm text-gray-400 mt-1">
              {widgetName} • ID: {widgetId.slice(-8)}...
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4">
            <h3 className="text-blue-200 font-medium mb-2 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Comment déployer votre widget
            </h3>
            <ol className="text-sm text-blue-300 space-y-1 ml-6 list-decimal">
              <li>Copiez le code HTML ci-dessous</li>
              <li>Collez-le avant la balise &lt;/body&gt; de votre site</li>
              <li>Le widget se chargera automatiquement</li>
            </ol>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Code HTML à intégrer
            </label>
            <div className="relative">
              <pre className="bg-gray-900 border border-gray-600 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">
                <code>{embedCode}</code>
              </pre>
              <button
                onClick={copyToClipboard}
                className="absolute top-3 right-3 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="text-xs">Copié!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="text-xs">Copier</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Aide */}
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
            <h4 className="text-gray-300 font-medium mb-2">💡 Besoin d'aide ?</h4>
            <p className="text-sm text-gray-400">
              Ce code fonctionne sur WordPress, Shopify, Webflow, sites statiques, etc.
              Placez-le avant la balise &lt;/body&gt; pour qu'il fonctionne sans erreur.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-600 p-6 bg-gray-900/30">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
            >
              Fermer
            </button>
            <button
              onClick={copyToClipboard}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copié !
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copier le Code
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
