import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Globe, Plus, Settings } from 'lucide-react';

interface Domain {
  _id: string;
  domain: string;
  status: 'pending' | 'verified' | 'failed';
  verifiedAt: Date | null;
}

interface DomainSelectorProps {
  selectedDomain: string;
  onDomainChange: (domain: string) => void;
  onAddDomain: () => void;
  onManageAll: () => void;
  refresh?: number; // Pour forcer le refresh depuis parent
}

export default function DomainSelector({ 
  selectedDomain, 
  onDomainChange, 
  onAddDomain, 
  onManageAll,
  refresh = 0 
}: DomainSelectorProps) {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Load domains on mount and when refresh changes
  useEffect(() => {
    loadDomains();
  }, [refresh]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Update dropdown position when opening OR scrolling
  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width
        });
      }
    };

    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
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

  const verifiedDomains = domains.filter(d => d.status === 'verified');
  const pendingDomains = domains.filter(d => d.status === 'pending');
  const failedDomains = domains.filter(d => d.status === 'failed');

  const getDisplayText = () => {
    if (selectedDomain && selectedDomain !== '') {
      return selectedDomain;
    }
    return 'No custom domain';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-900/20 text-green-400 border border-green-600/30">
            Verified
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-900/20 text-red-400 border border-red-600/30">
            Failed
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-900/20 text-yellow-400 border border-yellow-600/30">
            Pending
          </span>
        );
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-3">
        SELECT DOMAIN
      </label>
      
      <div className="relative">
        {/* Dropdown Button */}
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all backdrop-blur-sm font-medium flex items-center justify-between hover:bg-gray-800/80"
        >
          <span className={selectedDomain && selectedDomain !== '' ? 'text-white' : 'text-gray-400'}>
            {getDisplayText()}
          </span>
          <ChevronDown 
            size={16} 
            className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {/* Dropdown Menu - Using Portal */}
        {isOpen && typeof window !== 'undefined' && createPortal(
          <div 
            ref={dropdownRef}
            className="fixed bg-gray-900 border border-gray-700/50 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              zIndex: 9999
            }}
          >
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              
              {/* No custom domain option */}
              <button
                onClick={() => {
                  onDomainChange('');
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-800/50 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-500" />
                  <span className="text-gray-300 group-hover:text-white">No custom domain</span>
                </div>
                {(selectedDomain === '' || !selectedDomain) && (
                  <Check size={16} className="text-blue-400" />
                )}
              </button>

              {loading ? (
                <div className="px-4 py-8 text-center">
                  <div className="w-6 h-6 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto" />
                  <p className="text-gray-400 text-sm mt-2">Loading domains...</p>
                </div>
              ) : (
                <>
                  {/* Verified Domains */}
                  {verifiedDomains.length > 0 && (
                    <>
                      <div className="px-4 py-2 border-t border-gray-700/30">
                        <span className="text-xs text-green-400 font-medium uppercase tracking-wider">Verified</span>
                      </div>
                      {verifiedDomains.map((domain) => (
                        <button
                          key={domain._id}
                          onClick={() => {
                            onDomainChange(domain.domain);
                            setIsOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-800/50 transition-colors flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-400" />
                            <span className="text-white">{domain.domain}</span>
                            {getStatusBadge(domain.status)}
                          </div>
                          {selectedDomain === domain.domain && (
                            <Check size={16} className="text-blue-400" />
                          )}
                        </button>
                      ))}
                    </>
                  )}

                  {/* Pending Domains */}
                  {pendingDomains.length > 0 && (
                    <>
                      <div className="px-4 py-2 border-t border-gray-700/30">
                        <span className="text-xs text-yellow-400 font-medium uppercase tracking-wider">Pending Verification</span>
                      </div>
                      {pendingDomains.map((domain) => (
                        <button
                          key={domain._id}
                          onClick={() => {
                            onDomainChange(domain.domain);
                            setIsOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-800/50 transition-colors flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-yellow-400" />
                            <span className="text-gray-200">{domain.domain}</span>
                            {getStatusBadge(domain.status)}
                          </div>
                          {selectedDomain === domain.domain && (
                            <Check size={16} className="text-blue-400" />
                          )}
                        </button>
                      ))}
                    </>
                  )}

                  {/* Failed Domains */}
                  {failedDomains.length > 0 && (
                    <>
                      <div className="px-4 py-2 border-t border-gray-700/30">
                        <span className="text-xs text-red-400 font-medium uppercase tracking-wider">Failed</span>
                      </div>
                      {failedDomains.map((domain) => (
                        <button
                          key={domain._id}
                          onClick={() => {
                            onDomainChange(domain.domain);
                            setIsOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-800/50 transition-colors flex items-center justify-between group opacity-75"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-400" />
                            <span className="text-gray-300">{domain.domain}</span>
                            {getStatusBadge(domain.status)}
                          </div>
                          {selectedDomain === domain.domain && (
                            <Check size={16} className="text-blue-400" />
                          )}
                        </button>
                      ))}
                    </>
                  )}

                  {/* Empty State */}
                  {domains.length === 0 && (
                    <div className="px-4 py-6 text-center border-t border-gray-700/30">
                      <Globe className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">No domains added yet</p>
                    </div>
                  )}
                </>
              )}

              {/* Actions */}
              <div className="border-t border-gray-700/30 p-2 bg-gray-800/30">
                <button
                  onClick={() => {
                    onAddDomain();
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium mb-1"
                >
                  <Plus size={16} />
                  Add Custom Domain
                </button>
                
                {domains.length > 0 && (
                  <button
                    onClick={() => {
                      onManageAll();
                      setIsOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-gray-400 hover:text-gray-300 hover:bg-gray-700/30 rounded-lg transition-colors flex items-center gap-2 text-sm"
                  >
                    <Settings size={16} />
                    Manage All Domains
                    {domains.length > 0 && (
                      <span className="ml-auto bg-gray-600/50 text-gray-300 text-xs px-2 py-0.5 rounded-full">
                        {domains.length}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}