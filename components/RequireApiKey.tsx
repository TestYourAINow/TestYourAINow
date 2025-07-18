"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Key } from "lucide-react";

interface RequireApiKeyProps {
  children: React.ReactNode;
}

export default function RequireApiKey({ children }: RequireApiKeyProps) {
  const { data: session, status } = useSession();
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const checkApiKey = async () => {
    if (status === "loading" || !session) return;

    try {
      const response = await fetch("/api/user/api-key");
      const data = await response.json();
      
      if (response.ok) {
        setHasApiKey(data.hasApiKey);
      } else {
        setHasApiKey(false);
      }
    } catch (error) {
      console.error("Error checking API key:", error);
      setHasApiKey(false);
    } finally {
      setLoading(false);
    }
  };

  // Check initial au chargement
  useEffect(() => {
    checkApiKey();
  }, [session, status]);

  // Auto-refresh quand l'utilisateur revient sur la page (Option 2)
  useEffect(() => {
    const handleFocus = () => {
      if (hasApiKey === false && session) {
        setLoading(true);
        checkApiKey();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [hasApiKey, session]);

  // Si pas connecté, affiche le contenu (on gère ça ailleurs)
  if (!session && !loading) {
    return <>{children}</>;
  }

  // Si pas d'API key, affiche le modal OBLIGATOIRE
  if (session && hasApiKey === false) {
    return (
      <>
        {/* Contenu en arrière-plan avec overlay foncé */}
        <div className="filter blur-sm pointer-events-none">
          {children}
        </div>
        
        {/* Modal OBLIGATOIRE - pas de bouton X */}
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            {/* Header du modal */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Key className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">
                API Key Required
              </h2>
            </div>

            {/* Contenu du modal */}
            <div className="space-y-4">
              <p className="text-gray-300">
                To use AI features, you need to add your OpenAI API key first. 
                This ensures your usage is billed to your own OpenAI account.
              </p>
              
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-yellow-300 text-sm">
                  ⚠️ <strong>Required to continue</strong><br />
                  You cannot access AI features without configuring your API key.
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  💡 <strong>Why do I need this?</strong><br />
                  Your API key ensures you have full control over your AI usage and costs.
                </p>
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-col gap-3 pt-2">
                <Link 
                  href="/api-key"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 text-center"
                >
                  Configure API Key Now
                </Link>
                
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-400 mb-2">Don't have an API key yet?</p>
                  <a 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm underline hover:no-underline"
                  >
                    Get one from OpenAI Dashboard →
                  </a>
                </div>

                {/* Indication auto-refresh */}
                <div className="text-center pt-2 border-t border-gray-600">
                  <p className="text-xs text-gray-500">
                    💡 After adding your key, return to this page and it will automatically refresh
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  // A une API key - affiche le contenu normal
  return <>{children}</>;
}