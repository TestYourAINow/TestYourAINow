"use client";

import { useState } from "react";
import { Dialog } from '@headlessui/react';
import { Upload, AlertCircle, CheckCircle, Globe, X, Link as LinkIcon } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImport: (content: string) => void;
}

export default function ImportWebsiteModal({ isOpen, onClose, onImport }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState("");

  // Validation d'URL simple
  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Auto-correction de l'URL
  const normalizeUrl = (input: string) => {
    let url = input.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    return url;
  };

  const handleImport = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);
    setPreview("");

    try {
      const normalizedUrl = normalizeUrl(url);
      
      if (!isValidUrl(normalizedUrl)) {
        throw new Error("Please enter a valid website URL");
      }

      const res = await fetch("/api/import-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to import website content");
      }

      if (!data.content || data.content.length < 50) {
        throw new Error("The website doesn't contain enough content to import");
      }

      setSuccess(true);
      setPreview(data.content.slice(0, 200) + "...");
      
      // Attendre un peu pour montrer le succès
      setTimeout(() => {
        onImport(data.content);
        handleClose();
      }, 1500);

    } catch (err: any) {
      console.error("Import error:", err);
      setError(err.message || "Something went wrong while importing the website");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUrl("");
    setError("");
    setSuccess(false);
    setPreview("");
    setLoading(false);
    onClose();
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setError("");
    setSuccess(false);
    setPreview("");
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-lg text-white overflow-hidden">
          
          {/* Enhanced Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border-2 border-blue-500/40 flex items-center justify-center shadow-lg">
                <Upload className="text-blue-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  Import from Website
                </h2>
                <p className="text-gray-400 text-sm mt-0.5">Extract content from any website automatically</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all duration-200 group"
            >
              <X size={20} className="relative z-10" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            
            {/* Enhanced URL Input Section */}
            <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Globe className="text-blue-400" size={20} />
                <h3 className="text-lg font-bold text-blue-200">Website URL</h3>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  value={url}
                  onChange={handleUrlChange}
                  placeholder="https://yourcompany.com"
                  className="w-full bg-gray-900/80 text-white border border-gray-700/50 rounded-xl px-4 py-3.5 pr-12 outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium backdrop-blur-sm placeholder-gray-400"
                  disabled={loading}
                />
                <LinkIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
              
              {url && !isValidUrl(normalizeUrl(url)) && (
                <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <AlertCircle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-yellow-300 font-medium">URL will be auto-corrected to:</p>
                    <p className="text-xs text-yellow-200 font-mono mt-1">{normalizeUrl(url)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Status Messages */}
            {loading && (
              <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <div>
                    <p className="text-sm font-semibold text-blue-200">Importing website content...</p>
                    <p className="text-xs text-blue-300 mt-1">This may take up to 60 seconds</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-400 mt-0.5 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm font-semibold text-red-200">Import failed</p>
                    <p className="text-sm text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && preview && (
              <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-emerald-400 mt-0.5 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-emerald-200">Content imported successfully!</p>
                    <div className="mt-3 p-3 bg-gray-800/60 rounded-lg text-xs text-gray-300 max-h-20 overflow-y-auto border border-gray-600/50 backdrop-blur-sm">
                      {preview}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-700/50">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3.5 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-xl font-semibold transition-all backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={loading || !url.trim() || success}
                className="flex-1 px-4 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:scale-105 relative overflow-hidden"
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : success ? (
                  <>
                    <CheckCircle size={16} />
                    <span>Imported!</span>
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    <span>Import Content</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}