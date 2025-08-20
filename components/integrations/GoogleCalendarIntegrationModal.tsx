"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { toast } from "sonner";
import { Calendar, X, TestTube, Wand2, Save, Key, Shield, CheckCircle, Settings } from "lucide-react";
import { AgentIntegration } from "@/types/integrations";

interface GoogleCalendarIntegrationModalProps {
  onClose: () => void;
  onSave: (integration: AgentIntegration) => void;
  agentId: string;
  initialData?: AgentIntegration;
}

export default function GoogleCalendarIntegrationModal({
  onClose,
  onSave,
  agentId,
  initialData,
}: GoogleCalendarIntegrationModalProps) {
  const { data: session } = useSession();
  
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.type === "google_calendar" ? initialData.description || "" : ""
  );
  const [calendarId, setCalendarId] = useState(
    initialData?.type === "google_calendar" ? initialData.calendarId || "primary" : "primary"
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAddingInstructions, setIsAddingInstructions] = useState(false);
  const [testPassed, setTestPassed] = useState(false);
  const [hasBeenSaved, setHasBeenSaved] = useState(!!initialData);

  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [descError, setDescError] = useState("");

  // Vérifier si l'utilisateur est connecté avec Google
  const isConnected = !!(session?.user?.googleAccessToken);

  useEffect(() => {
    if (isConnected) {
      setTestPassed(true);
    }
  }, [isConnected]);

  const handleGoogleConnect = async () => {
    setIsConnecting(true);
    setError("");

    try {
      // Utiliser NextAuth pour se connecter avec Google
      const result = await signIn('google', { 
        callbackUrl: window.location.href,
        redirect: false 
      });

      if (result?.error) {
        setError("Erreur de connexion Google");
        toast.error("Erreur lors de la connexion Google");
      } else {
        toast.success("✅ Connexion Google réussie !");
      }
    } catch (err) {
      setError("Erreur lors de la connexion Google");
      toast.error("Erreur lors de la connexion Google");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTestConnection = async () => {
    if (!session?.user?.googleAccessToken) {
      toast.error("Connectez-vous d'abord à Google Calendar");
      return;
    }

    try {
      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary', {
        headers: {
          'Authorization': `Bearer ${session.user.googleAccessToken}`,
        }
      });

      if (res.ok) {
        setTestPassed(true);
        toast.success("✅ Connexion Google Calendar réussie !");
      } else {
        setTestPassed(false);
        toast.error("❌ Erreur de connexion. Reconnectez-vous.");
      }
    } catch (err) {
      setTestPassed(false);
      toast.error("❌ Test de connexion échoué");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setNameError("");
    setDescError("");

    let hasError = false;

    if (!name.trim()) {
      setNameError("Nom d'intégration requis");
      hasError = true;
    }

    if (!description.trim()) {
      setDescError("Description requise");
      hasError = true;
    }

    if (!isConnected || !session?.user?.googleAccessToken) {
      setError("Connexion Google Calendar requise");
      hasError = true;
    }

    if (hasError) {
      setIsSaving(false);
      return;
    }

    const endpoint = initialData
      ? `/api/agents/${agentId}/integrations/${encodeURIComponent(initialData.name)}`
      : `/api/agents/${agentId}/integrations`;

    try {
      const res = await fetch(endpoint, {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "google_calendar",
          name,
          description,
          accessToken: session?.user?.googleAccessToken,
          refreshToken: session?.user?.googleRefreshToken,
          calendarId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur de sauvegarde.");
        return;
      }

      onSave({ 
        type: "google_calendar", 
        name, 
        description, 
        accessToken: session?.user?.googleAccessToken,
        refreshToken: session?.user?.googleRefreshToken,
        calendarId,
        createdAt: new Date().toISOString() 
      });
      setHasBeenSaved(true);
      toast.success("Intégration Google Calendar sauvegardée !");
      onClose();
    } catch {
      toast.error("Erreur lors de la sauvegarde.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddInstructions = async () => {
    if (!hasBeenSaved) {
      toast.warning("Sauvegardez d'abord l'intégration.");
      return;
    }

    setIsAddingInstructions(true);

    try {
      const promptGenRes = await fetch("/api/generate-instructions-google-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (!promptGenRes.ok) {
        toast.error("Erreur génération d'instructions.");
        return;
      }

      const { instructions } = await promptGenRes.json();

      const updatePromptRes = await fetch(`/api/agents/${agentId}/prompt`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appendInstructions: instructions,
          replaceInstructionsFor: name,
        }),
      });

      if (!updatePromptRes.ok) {
        toast.error("Erreur mise à jour prompt.");
        return;
      }

      const updatedPromptData = await updatePromptRes.json();
      const updatedPrompt = updatedPromptData.prompt;

      const versionRes = await fetch(`/api/agents/${agentId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: updatedPrompt,
          openaiModel: "gpt-4o",
          temperature: 0.5,
          top_p: 1,
          integrations: [
            {
              type: "google_calendar",
              name,
              description,
              accessToken: session?.user?.googleAccessToken,
              refreshToken: session?.user?.googleRefreshToken,
              calendarId,
            },
          ],
        }),
      });

      if (versionRes.ok) {
        toast.success("Instructions ajoutées et version créée !");
      } else {
        toast.error("Erreur création version.");
      }

      onClose();
      onSave({ 
        type: "google_calendar", 
        name, 
        description, 
        accessToken: session?.user?.googleAccessToken,
        refreshToken: session?.user?.googleRefreshToken,
        calendarId,
        createdAt: new Date().toISOString() 
      });
    } catch {
      toast.error("Erreur inconnue.");
    } finally {
      setIsAddingInstructions(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Modal Container */}
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500/20 to-green-500/20 border-2 border-blue-500/40 flex items-center justify-center shadow-lg backdrop-blur-sm">
              <Calendar className="text-blue-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Google Calendar Integration
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">Créez des rendez-vous automatiquement dans Google Calendar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200 group"
          >
            <X size={20} className="relative z-10" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information Section */}
          <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shadow-lg">
                <Settings className="text-blue-400" size={18} />
              </div>
              <h3 className="text-lg font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">Détails de l'intégration</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Nom de l'intégration *</label>
                <input
                  className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm"
                  placeholder="Mon Calendrier Google"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {nameError && <p className="text-red-400 text-sm mt-1 font-medium">{nameError}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Description *</label>
                <textarea
                  className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm resize-none"
                  placeholder="L'IA pourra créer des rendez-vous automatiquement dans ce calendrier"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
                {descError && <p className="text-red-400 text-sm mt-1 font-medium">{descError}</p>}
              </div>
            </div>
          </div>

          {/* Google Connection Section */}
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-green-500/20 border border-green-500/40 flex items-center justify-center shadow-lg">
                <Key className="text-green-400" size={18} />
              </div>
              <h3 className="text-lg font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">Connexion Google</h3>
            </div>
            
            <div className="space-y-4">
              {!isConnected ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-xl bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="text-green-400" size={32} />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Connectez votre Google Calendar</h4>
                  <p className="text-gray-400 text-sm mb-4">Autorisez l'accès pour créer des événements automatiquement</p>
                  <button
                    onClick={handleGoogleConnect}
                    disabled={isConnecting}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-green-500/20 transform hover:scale-105 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <span className="relative z-10 flex items-center gap-2">
                      {isConnecting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Connexion...
                        </>
                      ) : (
                        <>
                          <Shield size={16} />
                          Se connecter avec Google
                        </>
                      )}
                    </span>
                  </button>
                </div>
              ) : (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="text-green-400" size={16} />
                    <span className="text-green-300 text-sm font-semibold">✅ Google Calendar connecté</span>
                  </div>
                  <p className="text-green-100/80 text-xs">L'IA peut maintenant créer des événements automatiquement</p>
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                  <X size={12} className="text-red-400" />
                </div>
                <p className="text-red-300 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-700/50">
            <button
              onClick={handleTestConnection}
              disabled={!isConnected}
              className="flex-1 px-4 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-600 disabled:opacity-75 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:scale-105 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                <TestTube size={16} />
                Tester la connexion
              </span>
            </button>

            <button
              onClick={handleAddInstructions}
              disabled={!testPassed || !hasBeenSaved || isAddingInstructions}
              className="flex-1 px-4 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/20 transform hover:scale-105 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isAddingInstructions ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Ajout...
                  </>
                ) : (
                  <>
                    <Wand2 size={16} />
                    Ajouter instructions
                  </>
                )}
              </span>
            </button>

            <button
              onClick={handleSave}
              disabled={!isConnected || isSaving}
              className="flex-1 px-4 py-3.5 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 transform hover:scale-105 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Sauvegarder
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}