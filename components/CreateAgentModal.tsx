"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Briefcase, Globe, Settings, X } from "lucide-react";

export default function CreateAgentModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [language, setLanguage] = useState("");
  const [template, setTemplate] = useState("");
  const [error, setError] = useState("");

  const handleCreate = () => {
    if (!name || !industry || !language || !template) {
      setError("Please fill all fields.");
      return;
    }

    // Pour l'instant on redirige simplement avec les données dans l'URL (plus tard : state global ou DB)
    const query = new URLSearchParams({
      name,
      industry,
      language,
      template,
    }).toString();

    router.push(`/agents/new?${query}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* FOND ASSOMBRI + BLUR */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* MODAL avec style premium */}
      <div
        className="relative z-50 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl w-full max-w-md text-white overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - fixe */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Settings className="text-blue-400" size={24} />
            <h2 className="text-xl font-semibold text-white">Create your agent</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* Configuration de base */}
          <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <User className="text-blue-400" size={20} />
              <h3 className="text-lg font-semibold text-blue-200">Configuration de base</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom de l'IA
                </label>
                <input
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150 placeholder-gray-400"
                  placeholder="AI name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Secteur d'activité
                </label>
                <input
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150 placeholder-gray-400"
                  placeholder="Industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Langue
                </label>
                <input
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white rounded-lg outline-none focus:border-white focus:border-2 transition-colors duration-150 placeholder-gray-400"
                  placeholder="Language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Choix du template */}
          <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="text-blue-400" size={20} />
              <h3 className="text-lg font-semibold text-blue-200">Type d'agent</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {[
                { key: "sales", label: "Sales AI", desc: "Agent commercial optimisé" },
                { key: "support", label: "Support AI", desc: "Assistant client et support" },
                { key: "blank", label: "Start Blank", desc: "Commencer avec un agent vierge" }
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setTemplate(option.key)}
                  className={`text-left px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                    template === option.key
                      ? "bg-blue-600 text-white border-blue-400 shadow-lg"
                      : "bg-gray-800 text-gray-300 border-gray-600 hover:border-blue-400 hover:bg-gray-700"
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm opacity-75">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-sm text-red-300 flex items-center gap-2">
                <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">!</span>
                {error}
              </p>
            </div>
          )}

          {/* Action Button - remis dans le contenu scrollable */}
          <div className="pt-4">
            <button
              onClick={handleCreate}
              disabled={!name || !industry || !language || !template}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-700 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            >
              <Settings className="w-5 h-5" />
              Continue
            </button>
          </div>

          {/* Informations */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="text-blue-400" size={18} />
              <h4 className="text-sm font-semibold text-blue-200">Informations</h4>
            </div>
            
            <div className="space-y-2 text-xs text-blue-300">
              <div className="flex justify-between">
                <span>Template sélectionné:</span>
                <span className="text-white font-medium">
                  {template === "sales" ? "Sales AI" : 
                   template === "support" ? "Support AI" : 
                   template === "blank" ? "Start Blank" : "Aucun"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Champs remplis:</span>
                <span className="text-white">
                  {[name, industry, language, template].filter(Boolean).length}/4
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}