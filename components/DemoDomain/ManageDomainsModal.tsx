import React, { useState, useEffect } from 'react';
import { X, Settings, Trash2, Globe, ExternalLink, AlertTriangle } from 'lucide-react';

interface Domain {
  _id: string;
  domain: string;
  status: 'pending' | 'verified' | 'failed';
  verifiedAt: Date | null;
  createdAt: Date;
  errorMessage: string | null;
}

interface ManageDomainsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigureDNS: (domain: string) => void;
  onDomainsChange: () => void;
}

export default function ManageDomainsModal({ 
  isOpen, 
  onClose, 
  onConfigureDNS,
  onDomainsChange 
}: ManageDomainsModalProps) {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingDomain, setDeletingDomain] = useState<string | null>(null);

  // Load domains when modal opens
  useEffect(() => {
    if (isOpen) {
      loadDomains();
    }
  }, [isOpen]);

  const loadDomains = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/domains');
      if (response.ok) {
        const data = await response.json();
        setDomains(data.domains || []);
      }
    } catch (error) {
      console.error('Error loading domains:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDomain = async (domain: string) => {
    if (!confirm(`Are you sure you want to delete "${domain}"?`)) return;

    setDeletingDomain(domain);
    try {
      const response = await fetch(`/api/user/domains/${encodeURIComponent(domain)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setDomains(prev => prev.filter(d => d.domain !== domain));
        onDomainsChange(); // Notify parent to refresh
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete domain');
      }
    } catch (error) {
      alert('Failed to delete domain. Please try again.');
    } finally {
      setDeletingDomain(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full border";
    
    switch (status) {
      case 'verified':
        return `${baseClasses} bg-green-900/20 text-green-400 border-green-600/30`;
      case 'failed':
        return `${baseClasses} bg-red-900/20 text-red-400 border-red-600/30`;
      default:
        return `${baseClasses} bg-yellow-900/20 text-yellow-400 border-yellow-600/30`;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                <Settings className="text-blue-400" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Manage Domains</h2>
                <p className="text-sm text-gray-400">View and manage all your custom domains</p>
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
        <div className="p-6 max-h-96 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
            </div>
          ) : domains.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-600/50">
                <Globe className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No domains added yet</h3>
              <p className="text-gray-400">Add your first custom domain to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {domains.map((domain) => (
                <div
                  key={domain._id}
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-xl p-4 hover:bg-gray-700/50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Globe className="w-4 h-4 text-blue-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-medium truncate">{domain.domain}</h4>
                          <span className={getStatusBadge(domain.status)}>
                            {getStatusText(domain.status)}
                          </span>
                        </div>
                        
                        {domain.status === 'failed' && domain.errorMessage && (
                          <div className="flex items-center gap-1 mt-1">
                            <AlertTriangle className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                            <p className="text-xs text-yellow-300 truncate">{domain.errorMessage}</p>
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-400">
                          Added {new Date(domain.createdAt).toLocaleDateString()}
                          {domain.verifiedAt && (
                            <span className="ml-2">
                              • Verified {new Date(domain.verifiedAt).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {/* DNS Button */}
                      <button
                        onClick={() => onConfigureDNS(domain.domain)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm font-medium transition-colors border border-blue-600/30"
                        title="Configure DNS"
                      >
                        <ExternalLink size={14} />
                        DNS
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteDomain(domain.domain)}
                        disabled={deletingDomain === domain.domain}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete domain"
                      >
                        {deletingDomain === domain.domain ? (
                          <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700/50 bg-gray-800/30">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {domains.length} domain{domains.length !== 1 ? 's' : ''} total
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}