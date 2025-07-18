"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function ApiKeyPage() {
  const { data: session } = useSession();
  const [apiKey, setApiKey] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Récupère l'info sur l'API key au chargement
  useEffect(() => {
    fetchApiKeyInfo();
  }, []);

  const fetchApiKeyInfo = async () => {
    try {
      const response = await fetch("/api/user/api-key");
      const data = await response.json();
      
      if (response.ok) {
        setHasApiKey(data.hasApiKey);
        setMaskedKey(data.maskedKey || "");
      }
    } catch (err) {
      console.error("Error fetching API key info:", err);
    }
  };

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/user/api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(hasApiKey ? "API key updated successfully!" : "API key saved successfully!");
        setApiKey("");
        fetchApiKeyInfo(); // Refresh l'info
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return <div>Please login to access this page.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">OpenAI API Key Settings</h1>
      
      {/* Status actuel */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="font-semibold mb-2">Current Status:</h2>
        {hasApiKey ? (
          <div className="text-green-600">
            ✅ API Key configured: {maskedKey}
          </div>
        ) : (
          <div className="text-red-600">
            ❌ No API key configured
          </div>
        )}
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSaveApiKey} className="space-y-4">
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
            {hasApiKey ? "Update OpenAI API Key" : "OpenAI API Key"}
          </label>
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={hasApiKey ? "Enter new API key to replace current one" : "sk-..."}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-sm text-gray-600 mt-1">
            {hasApiKey ? "Enter a new API key to replace your current one. " : ""}
            You can get your API key from{" "}
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              OpenAI Dashboard
            </a>
          </p>
          {hasApiKey && (
            <p className="text-sm text-amber-600 mt-1">
              ⚠️ Note: You cannot remove your API key, only replace it with a new one.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : hasApiKey ? "Update API Key" : "Save API Key"}
        </button>
      </form>

      {/* Messages */}
      {message && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg">
          {message}
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}