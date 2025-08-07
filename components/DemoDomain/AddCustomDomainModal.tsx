import React, { useState } from 'react';
import { X, Globe, Plus } from 'lucide-react';

interface AddCustomDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (domain: string) => void;
}

export default function AddCustomDomainModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: AddCustomDomainModalProps) {
  const [domain, setDomain] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;

    setIsAdding(true);
    setError('');

    try {
      const response = await fetch('/api/user/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess(domain.trim());
        setDomain('');
        onClose();
      } else {
        setError(data.error || 'Failed to add domain');
      }
    } catch (error) {
      setError('Failed to add domain. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setDomain('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-blue-600/10 to-cyan-600/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                <Globe className="text-blue-400" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Add Custom Domain</h2>
                <p className="text-sm text-gray-400">Add a custom subdomain to use for your demos</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Subdomain
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="demo.example.com"
              className="w-full px-4 py-3.5 bg-gray-800/50 border border-gray-600/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm placeholder-gray-400 font-mono"
              disabled={isAdding}
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-2">
              Enter a subdomain only (e.g., demo.example.com, app.yourdomain.com)
            </p>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-600/30 rounded-xl p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isAdding}
              className="flex-1 px-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 disabled:opacity-50 text-gray-300 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!domain.trim() || isAdding}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-600 disabled:opacity-50 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isAdding ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Add Domain
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}