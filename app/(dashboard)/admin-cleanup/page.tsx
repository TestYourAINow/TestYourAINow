// app/(dashboard)/admin-cleanup/page.tsx - CRÉER TEMPORAIREMENT

'use client';

import { useState } from 'react';

export default function AdminCleanupPage() {
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<any>(null);

  const handleCleanup = async () => {
    if (!confirm('⚠️ Nettoyer les données orphelines ? Cette action supprime définitivement les données inutiles.')) {
      return;
    }
    
    setIsCleaningUp(true);
    setCleanupResult(null);
    
    try {
      console.log('🧹 Starting cleanup...');
      
      const response = await fetch('/api/admin/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      console.log('Cleanup result:', result);
      
      if (result.success) {
        setCleanupResult(result.cleaned);
      } else {
        alert('❌ Erreur lors du nettoyage: ' + (result.error || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      alert('❌ Erreur lors du nettoyage');
    } finally {
      setIsCleaningUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-4">
            🧹 Database Cleanup
          </h1>
          <p className="text-gray-400 text-lg">
            Nettoie les données orphelines (versions, connaissances, configs sans agent)
          </p>
        </div>

        {/* Cleanup Section */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          
          {/* Warning */}
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                ⚠️
              </div>
              <div>
                <h3 className="font-semibold text-orange-200">Action irréversible</h3>
                <p className="text-orange-300/80 text-sm">
                  Cette action supprime définitivement les données orphelines. Assure-toi d'avoir une sauvegarde si nécessaire.
                </p>
              </div>
            </div>
          </div>

          {/* Cleanup Button */}
          <div className="text-center">
            <button
              onClick={handleCleanup}
              disabled={isCleaningUp}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:scale-100 disabled:opacity-50"
            >
              {isCleaningUp ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Nettoyage en cours...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  🧹
                  Nettoyer les données orphelines
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {cleanupResult && (
          <div className="mt-8 bg-emerald-900/30 border border-emerald-500/30 rounded-2xl p-6 backdrop-blur-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                ✅
              </div>
              <h2 className="text-2xl font-bold text-emerald-200">Nettoyage terminé !</h2>
              <p className="text-emerald-300/80">
                {cleanupResult.total} éléments supprimés avec succès
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-emerald-800/20 rounded-xl p-4">
                <h3 className="font-semibold text-emerald-200 mb-2">Versions orphelines</h3>
                <div className="text-2xl font-bold text-emerald-400">
                  {cleanupResult.orphanedVersions}
                </div>
                <p className="text-emerald-300/60 text-sm">AgentVersions sans agent</p>
              </div>
              
              <div className="bg-emerald-800/20 rounded-xl p-4">
                <h3 className="font-semibold text-emerald-200 mb-2">Connaissances orphelines</h3>
                <div className="text-2xl font-bold text-emerald-400">
                  {cleanupResult.orphanedKnowledge}
                </div>
                <p className="text-emerald-300/60 text-sm">AgentKnowledge sans agent</p>
              </div>
              
              <div className="bg-emerald-800/20 rounded-xl p-4">
                <h3 className="font-semibold text-emerald-200 mb-2">Configs orphelins</h3>
                <div className="text-2xl font-bold text-emerald-400">
                  {cleanupResult.orphanedConfigs}
                </div>
                <p className="text-emerald-300/60 text-sm">ChatbotConfigs sans agent</p>
              </div>
              
              <div className="bg-emerald-800/20 rounded-xl p-4">
                <h3 className="font-semibold text-emerald-200 mb-2">Doublons supprimés</h3>
                <div className="text-2xl font-bold text-emerald-400">
                  {cleanupResult.duplicateConfigs}
                </div>
                <p className="text-emerald-300/60 text-sm">ChatbotConfigs en double</p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-900/30 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-xl">
          <h3 className="font-semibold text-blue-200 mb-3">📋 Instructions</h3>
          <ol className="text-blue-300/80 space-y-2 text-sm">
            <li><strong>1.</strong> Clique sur le bouton pour nettoyer TES données orphelines</li>
            <li><strong>2.</strong> Vérifie les résultats - combien d'éléments ont été supprimés</li>
            <li><strong>3.</strong> Va dans MongoDB pour confirmer que tes collections sont propres</li>
            <li><strong>4.</strong> Supprime cette page une fois le nettoyage fait</li>
          </ol>
        </div>

        {/* Delete Instructions */}
        <div className="mt-6 text-center">
          <div className="bg-gray-800/50 border border-gray-600/30 rounded-xl p-4">
            <p className="text-gray-400 text-sm">
              💡 <strong>Après le nettoyage :</strong> Supprime le fichier <code className="bg-gray-700 px-2 py-1 rounded text-xs">app/(dashboard)/admin-cleanup/page.tsx</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}