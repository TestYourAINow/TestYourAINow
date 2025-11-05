// components/UsageLimitModal.tsx

'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, AlertTriangle, TrendingUp, BarChart3, Info, Trash2, Settings as SettingsIcon } from 'lucide-react';

interface UsageLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  connection: any;
  onSave: (settings: LimitSettings) => void;
}

export interface LimitSettings {
  enabled: boolean;
  messageLimit: number;
  periodDays: number;
  allowOverage: boolean;
  limitReachedMessage: string;
  showLimitMessage: boolean;
}

export default function UsageLimitModal({ isOpen, onClose, connection, onSave }: UsageLimitModalProps) {
  // 🆕 STATE POUR LES ONGLETS
  const [activeTab, setActiveTab] = useState<'analytics' | 'config'>('analytics');
  
  const [limitSettings, setLimitSettings] = useState<LimitSettings>({
    enabled: connection?.limitEnabled || false,
    messageLimit: connection?.messageLimit || 100,
    periodDays: connection?.periodDays || 30,
    allowOverage: connection?.allowOverage || false,
    limitReachedMessage: connection?.limitReachedMessage || 'Monthly message limit reached. Please contact support to upgrade your plan.',
    showLimitMessage: connection?.showLimitMessage !== undefined ? connection.showLimitMessage : true
  });

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingPeriodChange, setPendingPeriodChange] = useState<number | null>(null);
  
  // 🆕 STATES POUR LA SUPPRESSION D'HISTORIQUE
  const [deletingHistoryId, setDeletingHistoryId] = useState<string | null>(null);
  const [showDeleteHistoryDialog, setShowDeleteHistoryDialog] = useState(false);
  const [historyToDelete, setHistoryToDelete] = useState<any>(null);
  
  // 🆕 STATES POUR LE SAVE UX
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastExiting, setToastExiting] = useState(false);

  useEffect(() => {
    if (connection) {
      setLimitSettings({
        enabled: connection.limitEnabled || false,
        messageLimit: connection.messageLimit || 100,
        periodDays: connection.periodDays || 30,
        allowOverage: connection.allowOverage || false,
        limitReachedMessage: connection.limitReachedMessage || 'Monthly message limit reached. Please contact support to upgrade your plan.',
        showLimitMessage: connection.showLimitMessage !== undefined ? connection.showLimitMessage : true
      });
    }
  }, [connection]);

  const handlePeriodChange = (newPeriod: number) => {
    // Si période change ET qu'il y a déjà une période active
    if (connection?.periodStartDate && connection.periodDays !== newPeriod) {
      setPendingPeriodChange(newPeriod);
      setShowConfirmDialog(true);
    } else {
      setLimitSettings({ ...limitSettings, periodDays: newPeriod });
    }
  };

  const confirmPeriodChange = () => {
    if (pendingPeriodChange) {
      setLimitSettings({ ...limitSettings, periodDays: pendingPeriodChange });
    }
    setShowConfirmDialog(false);
    setPendingPeriodChange(null);
  };

  const cancelPeriodChange = () => {
    setShowConfirmDialog(false);
    setPendingPeriodChange(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      await onSave(limitSettings);
      
      // Success feedback
      setIsSaving(false);
      setSaveSuccess(true);
      setShowToast(true);
      setToastExiting(false);
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
      
      // Start slide-out animation after 2.7 seconds
      setTimeout(() => {
        setToastExiting(true);
      }, 2700);
      
      // Hide toast after animation completes (3 seconds total)
      setTimeout(() => {
        setShowToast(false);
        setToastExiting(false);
      }, 3000);
      
      // ❌ PAS DE SWITCH AUTO VERS ANALYTICS
      
    } catch (error) {
      console.error('Save error:', error);
      setIsSaving(false);
      alert('Error saving settings. Please try again.');
    }
  };

  // 🆕 FONCTION POUR SUPPRIMER UNE PÉRIODE DE L'HISTORIQUE
  const initiateDeleteHistory = (history: any) => {
    setHistoryToDelete(history);
    setShowDeleteHistoryDialog(true);
  };

  const confirmDeleteHistory = async () => {
    if (!historyToDelete || !connection?._id) return;

    setDeletingHistoryId(historyToDelete._id);
    
    try {
      const response = await fetch(`/api/connections/${connection._id}/usage-history`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          periodId: historyToDelete._id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete history period');
      }

      // Recharger la connection pour mettre à jour l'UI
      window.location.reload();
      
    } catch (error) {
      console.error('Error deleting history:', error);
      alert('Error deleting history period. Please try again.');
    } finally {
      setDeletingHistoryId(null);
      setShowDeleteHistoryDialog(false);
      setHistoryToDelete(null);
    }
  };

  const cancelDeleteHistory = () => {
    setShowDeleteHistoryDialog(false);
    setHistoryToDelete(null);
  };

  const getPeriodLabel = (days: number) => {
    switch(days) {
      case 30: return 'Monthly';
      case 90: return 'Quarterly';
      case 365: return 'Yearly';
      default: return `${days} days`;
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const usagePercentage = connection?.messageLimit 
    ? Math.min((connection.currentPeriodUsage / connection.messageLimit) * 100, 100)
    : 0;

  const isOverLimit = connection?.currentPeriodUsage >= connection?.messageLimit;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-700 bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                  <Clock className="text-blue-400" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Usage Limits & Analytics</h3>
                  <p className="text-sm text-gray-400">Monitor and configure message usage</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* 🆕 ONGLETS PILLS */}
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'
                }`}
              >
                <BarChart3 size={18} />
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('config')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === 'config'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'
                }`}
              >
                <SettingsIcon size={18} />
                Configuration
              </button>
            </div>
          </div>

          {/* Body - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* 📊 ONGLET ANALYTICS */}
            {activeTab === 'analytics' && (
              <>
                {/* Current Period Status - PLUS GROS */}
                {connection?.limitEnabled && connection?.messageLimit ? (
                  <div className="p-6 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-500/30 rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-base font-semibold text-blue-400">Current Period Status</span>
                      <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                        isOverLimit 
                          ? connection.allowOverage 
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {isOverLimit 
                          ? connection.allowOverage ? 'Overage Mode' : 'Limit Reached'
                          : 'Active'
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-baseline gap-3 mb-3">
                      <span className="text-5xl font-bold text-white">
                        {connection.currentPeriodUsage}
                      </span>
                      <span className="text-2xl text-gray-400">/ {connection.messageLimit}</span>
                      {connection.overageCount > 0 && (
                        <span className="text-base text-yellow-400 ml-2">
                          (+{connection.overageCount} overage)
                        </span>
                      )}
                    </div>
                    
                    <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                      <div 
                        className={`h-3 rounded-full transition-all ${
                          usagePercentage > 100 ? 'bg-yellow-500' :
                          usagePercentage > 80 ? 'bg-red-500' :
                          usagePercentage > 50 ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>Period: {getPeriodLabel(connection.periodDays)}</span>
                      <span>
                        {connection.periodEndDate
                          ? `Resets on ${formatDate(connection.periodEndDate)}`
                          : 'Starts on first use'
                        }
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700/30 text-center">
                    <div className="w-16 h-16 bg-gray-700/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Clock className="text-gray-400" size={32} />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">No Limits Configured</h4>
                    <p className="text-gray-400 text-sm">
                      Usage limits are currently disabled. Switch to Configuration to set up limits.
                    </p>
                  </div>
                )}

                {/* Usage History - TOUTES LES PÉRIODES */}
                {connection?.usageHistory && connection.usageHistory.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="text-blue-400" size={20} />
                      <h4 className="font-semibold text-white text-lg">Usage History</h4>
                      <span className="text-sm text-gray-500">({connection.usageHistory.length} periods)</span>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {connection.usageHistory.slice().reverse().map((history: any, i: number) => (
                        <div 
                          key={history._id || i} 
                          className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/30 hover:bg-gray-800/70 transition-colors group"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-gray-300">{history.period}</span>
                                {history.overageMessages > 0 && (
                                  <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">
                                    Overage
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-white">{history.messagesUsed}</span>
                                {history.overageMessages > 0 && (
                                  <span className="text-sm text-yellow-400">
                                    +{history.overageMessages}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* 🆕 BOUTON DELETE */}
                            <button
                              onClick={() => initiateDeleteHistory(history)}
                              disabled={deletingHistoryId === history._id}
                              className="opacity-0 group-hover:opacity-100 w-8 h-8 bg-red-500/20 hover:bg-red-500/30 disabled:opacity-50 text-red-400 rounded-lg flex items-center justify-center transition-all"
                              title="Delete this period"
                            >
                              {deletingHistoryId === history._id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{formatDate(history.startDate)} - {formatDate(history.endDate)}</span>
                            {history.note && (
                              <span className="italic">{history.note}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {connection?.usageHistory && connection.usageHistory.length === 0 && connection?.limitEnabled && (
                  <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700/30 text-center">
                    <div className="w-12 h-12 bg-gray-700/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <BarChart3 className="text-gray-400" size={24} />
                    </div>
                    <h4 className="text-base font-semibold text-white mb-2">No History Yet</h4>
                    <p className="text-gray-400 text-sm">
                      Usage history will appear here after the first period completes.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* ⚙️ ONGLET CONFIGURATION */}
            {activeTab === 'config' && (
              <>
                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/30">
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-1">Enable Usage Limits</h4>
                    <p className="text-sm text-gray-400">Restrict the number of messages per period</p>
                  </div>
                  <label htmlFor="enable-toggle" className="relative inline-block w-14 h-7 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={limitSettings.enabled}
                      onChange={(e) => setLimitSettings({...limitSettings, enabled: e.target.checked})}
                      className="sr-only"
                      id="enable-toggle"
                    />
                    <div className={`w-14 h-7 rounded-full transition-colors duration-200 ${limitSettings.enabled ? 'bg-blue-600' : 'bg-gray-700'}`}>
                      <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${limitSettings.enabled ? 'translate-x-7' : 'translate-x-0'}`}></span>
                    </div>
                  </label>
                </div>

                {limitSettings.enabled && (
                  <>
                    {/* Message Limit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Message Limit per Period
                      </label>
                      <input
                        type="number"
                        value={limitSettings.messageLimit || ''}
                        onChange={(e) => setLimitSettings({...limitSettings, messageLimit: parseInt(e.target.value) || 0})}
                        min="1"
                        placeholder="Ex: 100, 500, 1000..."
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <Info size={12} />
                        You can set any number. Common values: 100, 500, 1000, 5000
                      </p>
                    </div>

                    {/* Period Duration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Period Duration
                      </label>
                      <select
                        value={limitSettings.periodDays}
                        onChange={(e) => handlePeriodChange(parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                      >
                        <option value="30">Monthly (30 days)</option>
                        <option value="90">Quarterly (90 days)</option>
                        <option value="365">Yearly (365 days)</option>
                      </select>
                      {connection?.periodStartDate && (
                        <p className="text-xs text-yellow-500 mt-2 flex items-center gap-1">
                          <AlertTriangle size={12} />
                          Changing this will reset your current usage counter
                        </p>
                      )}
                    </div>

                    {/* Overage Mode */}
                    <div className="p-4 bg-gradient-to-br from-yellow-600/10 to-orange-600/10 border border-yellow-500/30 rounded-xl">
                      <div className="flex items-start gap-3 mb-3">
                        <TrendingUp className="text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
                        <div className="flex-1">
                          <h4 className="font-medium text-yellow-400 mb-1">Overage Mode</h4>
                          <p className="text-sm text-gray-400">
                            Allow messages to continue past the limit (tracked as overage)
                          </p>
                        </div>
                        <label htmlFor="overage-toggle" className="relative inline-block w-12 h-6 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={limitSettings.allowOverage}
                            onChange={(e) => setLimitSettings({...limitSettings, allowOverage: e.target.checked})}
                            className="sr-only"
                            id="overage-toggle"
                          />
                          <div className={`w-12 h-6 rounded-full transition-colors duration-200 ${limitSettings.allowOverage ? 'bg-yellow-600' : 'bg-gray-700'}`}>
                            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${limitSettings.allowOverage ? 'translate-x-6' : 'translate-x-0'}`}></span>
                          </div>
                        </label>
                      </div>
                      
                      <div className="pl-8 space-y-2 text-xs text-gray-400">
                        <p>✅ <strong className="text-yellow-400">Enabled:</strong> Messages continue, overage is tracked separately</p>
                        <p>❌ <strong className="text-yellow-400">Disabled:</strong> Bot stops responding when limit is reached</p>
                      </div>
                    </div>

                    {/* Limit Reached Settings (only if overage disabled) */}
                    {!limitSettings.allowOverage && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
                          <span className="text-sm text-gray-300">Show message when limit reached</span>
                          <label htmlFor="show-message-toggle" className="relative inline-block w-12 h-6 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={limitSettings.showLimitMessage}
                              onChange={(e) => setLimitSettings({...limitSettings, showLimitMessage: e.target.checked})}
                              className="sr-only"
                              id="show-message-toggle"
                            />
                            <div className={`w-12 h-6 rounded-full transition-colors duration-200 ${limitSettings.showLimitMessage ? 'bg-blue-600' : 'bg-gray-700'}`}>
                              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${limitSettings.showLimitMessage ? 'translate-x-6' : 'translate-x-0'}`}></span>
                            </div>
                          </label>
                        </div>

                        {limitSettings.showLimitMessage && (
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Limit Reached Message
                            </label>
                            <textarea
                              value={limitSettings.limitReachedMessage}
                              onChange={(e) => setLimitSettings({...limitSettings, limitReachedMessage: e.target.value})}
                              rows={3}
                              placeholder="Enter a custom message..."
                              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none resize-none"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                              This message will be shown to users when the limit is reached
                            </p>
                          </div>
                        )}

                        {!limitSettings.showLimitMessage && (
                          <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
                            <p className="text-xs text-gray-400">
                              ℹ️ No message will be displayed. The bot will simply stop responding.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* Footer - UNIQUEMENT VISIBLE DANS ONGLET CONFIG */}
          {activeTab === 'config' && (
            <div className="p-6 border-t border-gray-700 flex gap-3 bg-gray-900">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || saveSuccess}
                className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  saveSuccess
                    ? 'bg-green-600 text-white cursor-default'
                    : isSaving
                    ? 'bg-blue-500 text-white cursor-wait'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : saveSuccess ? (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Saved!
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog for Period Change */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border border-yellow-500/30 max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="text-yellow-400" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-white mb-2">Reset Usage Counter?</h4>
                <p className="text-sm text-gray-400">
                  Changing the period duration will reset your current usage counter 
                  ({connection?.currentPeriodUsage}/{connection?.messageLimit} used
                  {connection?.overageCount > 0 && `, +${connection.overageCount} overage`}).
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  The current period will be saved to history. Do you want to continue?
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={cancelPeriodChange}
                className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmPeriodChange}
                className="flex-1 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-medium transition-colors"
              >
                Reset & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 DELETE HISTORY CONFIRMATION DIALOG */}
      {showDeleteHistoryDialog && historyToDelete && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border border-red-500/30 max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Trash2 className="text-red-400" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-white mb-2">Delete History Period?</h4>
                <p className="text-sm text-gray-400">
                  Are you sure you want to delete the period <strong className="text-white">{historyToDelete.period}</strong>?
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  <strong className="text-red-400">This action cannot be undone.</strong> The data will be permanently removed.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={cancelDeleteHistory}
                disabled={deletingHistoryId !== null}
                className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteHistory}
                disabled={deletingHistoryId !== null}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {deletingHistoryId ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Period'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 TOAST NOTIFICATION - RENDERED VIA PORTAL */}
      {showToast && typeof window !== 'undefined' && createPortal(
        <div className={`fixed top-4 right-4 z-[9999] pointer-events-none ${toastExiting ? 'animate-slide-out' : 'animate-slide-in'}`}>
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl border border-green-500/30 flex items-center gap-3 pointer-events-auto">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-semibold">Settings saved successfully!</p>
              <p className="text-sm text-green-100">Your usage limits have been updated.</p>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slide-out {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-slide-out {
          animation: slide-out 0.3s ease-in;
        }
      `}</style>
    </>
  );
}