"use client";

import { useState } from "react";
import { Dialog } from '@headlessui/react';
import { Upload, AlertCircle, CheckCircle, Globe, FileText, X } from "lucide-react";

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
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl w-full max-w-lg text-white overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Upload className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Import from Website</h2>
                <p className="text-gray-300 text-sm">Extract content from any website automatically</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            
            {/* URL Input Section */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="text-blue-400" size={20} />
                <h3 className="text-lg font-semibold text-blue-200">Website URL</h3>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  value={url}
                  onChange={handleUrlChange}
                  placeholder="https://yourcompany.com"
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 pr-12 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  disabled={loading}
                />
                <Globe className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
              
              {url && !isValidUrl(normalizeUrl(url)) && (
                <p className="text-xs text-yellow-300 mt-2 flex items-center gap-1">
                  <AlertCircle size={12} />
                  URL will be auto-corrected to: {normalizeUrl(url)}
                </p>
              )}
            </div>

            {/* Status Messages */}
            {loading && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <div>
                    <p className="text-sm font-medium text-blue-200">Importing website...</p>
                    <p className="text-xs text-blue-300">This may take up to 60 seconds</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-400 mt-0.5" size={16} />
                  <div>
                    <p className="text-sm font-medium text-red-200">Import failed</p>
                    <p className="text-xs text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && preview && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-400 mt-0.5" size={16} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-200">Content imported successfully!</p>
                    <div className="mt-2 p-3 bg-gray-800 rounded-lg text-xs text-gray-300 max-h-20 overflow-y-auto border border-gray-600">
                      {preview}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tips Section */}
            <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="text-orange-400" size={20} />
                <h3 className="text-lg font-semibold text-orange-200">Tips for better results</h3>
              </div>
              
              <div className="text-sm text-gray-300 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">•</span>
                  <span>Use the main page or about page of the website</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">•</span>
                  <span>Avoid pages with mostly images or videos</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">•</span>
                  <span>Some websites may block automated access</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-700">
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={loading || !url.trim() || success}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Importing...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle size={16} />
                    Imported!
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Import Content
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