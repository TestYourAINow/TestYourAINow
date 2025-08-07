import React, { useState } from 'react';
import { X, Settings, Copy, RefreshCcw, CheckCircle } from 'lucide-react';

interface ConfigureDNSModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: string;
  onVerifySuccess: () => void;
}

export default function ConfigureDNSModal({ 
  isOpen, 
  onClose, 
  domain,
  onVerifySuccess 
}: ConfigureDNSModalProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const subdomain = domain ? domain.split('.')[0] : '';
  const proxyTarget = 'proxy.testyourainow.com';

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleVerifyDomain = async () => {
    if (!domain) return;
    
    setIsVerifying(true);
    setVerificationResult(null);
    setErrorMessage('');

    try {
      const response = await fetch(`/api/user/domains/${encodeURIComponent(domain)}`, {
        method: 'PUT'
      });

      const data = await response.json();

      if (response.ok && data.domain?.status === 'verified') {
        setVerificationResult('success');
        setTimeout(() => {
          onVerifySuccess();
          onClose();
        }, 1500);
      } else {
        setVerificationResult('error');
        setErrorMessage(data.domain?.errorMessage || data.error || 'Domain verification failed');
      }
    } catch (error) {
      setVerificationResult('error');
      setErrorMessage('Failed to verify domain. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen || !domain) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-green-600/10 to-blue-600/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600/20 rounded-xl flex items-center justify-center">
                <Settings className="text-green-400" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Configure DNS Records</h2>
                <p className="text-sm text-gray-400">Add this CNAME record for {domain}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* CNAME Record Configuration */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <h3 className="text-white font-semibold">CNAME Record Configuration</h3>
            </div>

            {/* Type */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Type</label>
              <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3">
                <span className="text-blue-400 font-mono text-sm">CNAME</span>
              </div>
            </div>

            {/* Name */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Name</label>
              <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="text-blue-400 font-mono text-sm">{domain}</span>
                <button
                  onClick={() => copyToClipboard(domain)}
                  className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

            {/* Value */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Value</label>
              <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="text-blue-400 font-mono text-sm">{proxyTarget}</span>
                <button
                  onClick={() => copyToClipboard(proxyTarget)}
                  className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Important DNS Configuration Settings */}
          <div className="bg-gray-800/30 border border-gray-600/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              <h4 className="text-white font-semibold text-sm">Important DNS Configuration Settings:</h4>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-orange-400 font-medium">• Proxy Status:</span>
                <div>
                  <span className="text-red-400 font-medium">OFF</span>
                  <p className="text-gray-400 text-xs mt-0.5">
                    If using Cloudflare, ensure the proxy (orange cloud) is disabled
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="text-blue-400 font-medium">• TTL:</span>
                <div>
                  <span className="text-blue-300">Auto</span>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Leave TTL on Auto or set to a low value (60-300 seconds)
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="text-purple-400 font-medium">• Wait Time:</span>
                <div>
                  <span className="text-purple-300">5-30 minutes</span>
                  <p className="text-gray-400 text-xs mt-0.5">
                    DNS changes need time to propagate globally
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Result */}
          {verificationResult && (
            <div className={`border rounded-xl p-4 ${
              verificationResult === 'success' 
                ? 'bg-green-900/20 border-green-600/30' 
                : 'bg-red-900/20 border-red-600/30'
            }`}>
              <div className="flex items-center gap-2">
                {verificationResult === 'success' ? (
                  <>
                    <CheckCircle className="text-green-400" size={16} />
                    <span className="text-green-300 font-medium text-sm">Domain verified successfully!</span>
                  </>
                ) : (
                  <>
                    <X className="text-red-400" size={16} />
                    <span className="text-red-300 font-medium text-sm">Verification failed</span>
                  </>
                )}
              </div>
              {errorMessage && (
                <p className="text-red-200/80 text-xs mt-1">{errorMessage}</p>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isVerifying}
              className="flex-1 px-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 disabled:opacity-50 text-gray-300 rounded-xl font-medium transition-colors"
            >
              Done
            </button>
            <button
              onClick={handleVerifyDomain}
              disabled={isVerifying}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-500 hover:to-green-500 disabled:opacity-50 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <RefreshCcw size={16} />
                  Verify Domain
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}