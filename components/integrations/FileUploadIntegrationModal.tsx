"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Upload, X, File, Trash2, Clock, HardDrive, AlertCircle, FileText, CheckCircle } from "lucide-react";
import { AgentIntegration } from "@/types/integrations";

interface FileUploadIntegrationModalProps {
  agentId: string;
  onClose: () => void;
  initialData?: AgentIntegration;
  onRefresh?: () => void;
}

export default function FileUploadIntegrationModal({
  agentId,
  onClose,
  initialData,
  onRefresh,
}: FileUploadIntegrationModalProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [files, setFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (initialData?.type === "files" && Array.isArray(initialData.files)) {
      setFiles(
        initialData.files.map(f => ({ 
          ...f, 
          isCloud: true, 
          uploadedAt: f.uploadedAt ?? new Date().toISOString(),
        }))
      );
    }
  }, [initialData]);

  const pendingFiles = files.filter((f) => !f.isCloud);
  const savedFiles = files.filter((f) => f.isCloud);
  const pendingCount = pendingFiles.length;

  const forbiddenExtensions = [
    ".exe", ".bat", ".sh", ".php", ".py", ".pyc", ".js",
    ".mp4", ".mov", ".avi", ".mkv", ".webm",
    ".mp3", ".wav", ".ogg", ".flac", ".aac", ".m4a",
  ];

  const isFileForbidden = (fileName: string) =>
    forbiddenExtensions.some((ext) => fileName.toLowerCase().endsWith(ext));

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const total = files.length + acceptedFiles.length;
      if (total > 5) {
        toast.error("Max 5 files allowed.");
        return;
      }

      const validFiles = acceptedFiles.filter((file) => {
        if (isFileForbidden(file.name)) {
          toast.error(`Fichier interdit : ${file.name}`);
          return false;
        }
        return true;
      });

      setFiles((prev) => [...prev, ...validFiles]);
    },
    [files]
  );

  const { getRootProps, getInputProps, open } = useDropzone({ 
    onDrop, 
    onDragEnter: () => setIsDragging(true), 
    onDragLeave: () => setIsDragging(false), 
    onDropAccepted: () => setIsDragging(false), 
    onDropRejected: () => { 
      toast.error("Unsupported file type. Allowed: TXT, PDF, DOCX, MD, HTML, JSON, CSV."); 
      setIsDragging(false); 
    }, 
    noClick: true, 
    noKeyboard: true, 
    multiple: true, 
    maxSize: 50 * 1024 * 1024, 
    accept: { 
      "text/plain": [".txt"], 
      "application/pdf": [".pdf"], 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"], 
      "text/markdown": [".md"], 
      "text/html": [".html", ".htm"], 
      "application/json": [".json"], 
      "text/csv": [".csv"], 
    }, 
  });

  const handleFileRemove = async (index: number) => {
    const file = files[index];
    const cleanAgentId = agentId.split("/")[0];

    if (file.isCloud && file.path) {
      const res = await fetch(`/api/agents/${cleanAgentId}/upload`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths: [file.path] }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Suppression échouée");
        return;
      }
      if (onRefresh) onRefresh();
    }

    setFiles((prev) => prev.filter((_, i) => i !== index));
    toast.success("Fichier supprimé.");
  };

  const handleUpload = async () => {
    if (!name.trim()) {
      toast.error("Nom d'intégration requis.");
      return;
    }

    setIsUploading(true);

    try {
      const cleanAgentId = agentId.split("/")[0];
      let hasWarnings = false;
      let successCount = 0;

      for (const file of pendingFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", name);

        console.log("➡️ Uploading to:", `/api/agents/${cleanAgentId}/upload`);

        const res = await fetch(`/api/agents/${cleanAgentId}/upload`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Échec de l'upload");
        }

        if (data.warning) {
          toast.warning(`⚠️ ${file.name}: ${data.warning}`, {
            duration: 6000,
          });
          hasWarnings = true;
        } else {
          successCount++;
        }
      }

      if (successCount > 0 && !hasWarnings) {
        toast.success(`✅ ${successCount} fichier(s) uploadé(s) et prêt(s) pour l'IA !`);
      } else if (successCount > 0 && hasWarnings) {
        toast.success(`✅ ${successCount} fichier(s) uploadé(s) avec succès !`);
        toast.info("ℹ️ Certains fichiers ne pourront pas être lus par l'IA (voir warnings ci-dessus)");
      } else if (hasWarnings && successCount === 0) {
        toast.warning("⚠️ Tous les fichiers ont été uploadés mais l'IA ne pourra pas les lire");
      }

      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Erreur lors de l'upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Modal Container */}
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-500/40 flex items-center justify-center shadow-lg backdrop-blur-sm">
              <Upload className="text-orange-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                File Upload Integration
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">Upload documents to enhance your agent's knowledge</p>
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
          {/* Integration Name Section */}
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shadow-lg">
                <FileText className="text-orange-400" size={18} />
              </div>
              <h3 className="text-lg font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">Integration Details</h3>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Integration Name *</label>
              <input
                className="w-full px-4 py-3.5 bg-gray-900/80 border border-gray-700/50 text-white rounded-xl outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 transition-all placeholder-gray-400 font-medium backdrop-blur-sm"
                placeholder="Enter integration name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shadow-lg">
                <Upload className="text-blue-400" size={18} />
              </div>
              <h3 className="text-lg font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">Upload Documents</h3>
            </div>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 backdrop-blur-sm relative overflow-hidden group ${
                isDragging 
                  ? "border-blue-500/60 bg-gradient-to-r from-blue-500/10 to-cyan-500/10" 
                  : "border-gray-600/60 hover:border-gray-500/60 bg-gray-900/30"
              }`}
            >
              <input {...getInputProps()} />
              
              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              <div className="flex flex-col items-center gap-4 relative z-10">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  isDragging 
                    ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/40 scale-110" 
                    : "bg-gray-800/50 border border-gray-600/50 group-hover:scale-105"
                }`}>
                  <Upload className={`w-8 h-8 transition-colors duration-300 ${
                    isDragging ? "text-blue-400" : "text-gray-400 group-hover:text-gray-300"
                  }`} />
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">
                    {isDragging ? "Drop files here" : "Drop one or more files"}
                  </p>
                  <p className="text-sm text-gray-400 mb-3">or</p>
                  <button
                    type="button"
                    onClick={open}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transform hover:scale-105 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <span className="relative z-10">Browse Files</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="text-blue-400" size={16} />
                <span className="text-blue-200 text-sm font-semibold">Supported Formats</span>
              </div>
              <p className="text-blue-100/80 text-xs leading-relaxed">
                TXT, PDF, DOCX, MD, HTML, JSON, CSV (max 50MB per file)
              </p>
            </div>

            <div className="flex justify-between items-center mt-4 text-sm">
              <span className="text-gray-400 font-medium">Files uploaded:</span>
              <span className={`font-bold ${files.length >= 5 ? 'text-red-400' : 'text-white'}`}>
                {files.length}/5
              </span>
            </div>
          </div>

          {/* Pending Files Section */}
          {pendingFiles.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center shadow-lg">
                  <Clock className="text-yellow-400" size={18} />
                </div>
                <h3 className="text-lg font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  Pending Upload ({pendingFiles.length})
                </h3>
              </div>
              
              <div className="space-y-3">
                {pendingFiles.map((file, index) => (
                  <div
                    key={`pending-${index}`}
                    className="flex justify-between items-center bg-gray-900/50 border border-gray-700/50 px-4 py-3 rounded-xl backdrop-blur-sm group hover:bg-gray-900/70 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center">
                        <File className="text-yellow-400" size={16} />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{file.name}</p>
                        <p className="text-xs text-gray-400">
                          {(file.size / 1024).toFixed(1)} KB • Ready to upload
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFileRemove(files.indexOf(file))}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 group-hover:scale-110"
                      title="Remove file"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saved Files Section */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-lg">
                <HardDrive className="text-emerald-400" size={18} />
              </div>
              <h3 className="text-lg font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Files in Knowledge Base ({savedFiles.length})
              </h3>
            </div>
            
            {savedFiles.length === 0 ? (
              <div className="border-2 border-dashed border-gray-600/50 p-8 rounded-xl text-center bg-gray-900/30 backdrop-blur-sm">
                <HardDrive className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400 text-sm font-medium">No files uploaded yet</p>
                <p className="text-gray-500 text-xs mt-1">Upload documents to enhance your agent's knowledge</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedFiles.map((file, index) => (
                  <div
                    key={`saved-${index}`}
                    className="flex justify-between items-center bg-gray-900/50 border border-gray-700/50 px-4 py-3 rounded-xl backdrop-blur-sm group hover:bg-gray-900/70 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                        <CheckCircle className="text-emerald-400" size={16} />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{file.name}</p>
                        <p className="text-xs text-gray-400">
                          {(file.size / 1024).toFixed(1)} KB • Uploaded{" "}
                          {new Date(file.uploadedAt).toLocaleString("fr-CA", { 
                            year: "numeric", 
                            month: "2-digit", 
                            day: "2-digit", 
                            hour: "2-digit", 
                            minute: "2-digit", 
                          })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFileRemove(files.indexOf(file))}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 group-hover:scale-110"
                      title="Remove file"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-700/50">
            <button 
              onClick={onClose} 
              className="flex-1 px-4 py-3.5 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-xl font-semibold transition-all backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={pendingFiles.length === 0 || !name.trim() || isUploading}
              className="flex-1 px-4 py-3.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:from-gray-600 disabled:to-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-orange-500/20 transform hover:scale-105 relative overflow-hidden group"
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload {pendingCount} File{pendingCount !== 1 ? "s" : ""}
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