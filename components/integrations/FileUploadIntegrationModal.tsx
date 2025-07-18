"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Upload, X, File, Trash2, Clock, HardDrive, AlertCircle } from "lucide-react";
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

        // ✅ NOUVELLE LOGIQUE : Vérifier les warnings
        if (data.warning) {
          toast.warning(`⚠️ ${file.name}: ${data.warning}`, {
            duration: 6000, // Plus long pour lire le message
          });
          hasWarnings = true;
        } else {
          successCount++;
        }
      }

      // Messages de fin selon le résultat
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className="relative z-10 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-2xl shadow-2xl w-full max-w-2xl text-white overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800/50">
          <div className="flex items-center gap-3">
            <Upload className="text-orange-400" size={24} />
            <div>
              <h2 className="text-2xl font-bold text-white">
                File Upload Integration
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Upload up to 5 documents to enhance your agent's knowledge
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Integration Name Section */}
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <File className="text-orange-400" size={20} />
              <h3 className="text-lg font-semibold text-orange-200">Integration Details</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Integration Name *</label>
              <input
                className="w-full px-4 py-3 border-2 border-gray-500 bg-gray-600 text-white rounded-lg outline-none focus:border-orange-500 transition-colors duration-150 placeholder-gray-400"
                placeholder="Enter integration name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <Upload className="text-blue-400" size={20} />
              <h3 className="text-lg font-semibold text-blue-200">Upload Documents</h3>
            </div>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                isDragging 
                  ? "border-blue-500 bg-blue-500/10" 
                  : "border-gray-500 hover:border-gray-400"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div className={`p-4 rounded-full ${
                  isDragging ? "bg-blue-500/20" : "bg-gray-600/50"
                }`}>
                  <Upload className={`w-8 h-8 ${
                    isDragging ? "text-blue-400" : "text-gray-400"
                  }`} />
                </div>
                <div>
                  <p className="text-white font-medium mb-1">
                    {isDragging ? "Drop files here" : "Drop one or more files"}
                  </p>
                  <p className="text-sm text-gray-400 mb-3">or</p>
                  <button
                    type="button"
                    onClick={open}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Browse Files
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="text-blue-400" size={16} />
                <span className="text-blue-200 text-sm font-medium">Supported Formats</span>
              </div>
              <p className="text-blue-100/80 text-xs">
                TXT, PDF, DOCX, MD, HTML, JSON, CSV (max 50MB per file)
              </p>
            </div>

            <div className="flex justify-between items-center mt-4 text-sm">
              <span className="text-gray-400">Files uploaded:</span>
              <span className={`font-medium ${files.length >= 5 ? 'text-red-400' : 'text-white'}`}>
                {files.length}/5
              </span>
            </div>
          </div>

          {/* Pending Files Section */}
          {pendingFiles.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="text-yellow-400" size={20} />
                <h3 className="text-lg font-semibold text-yellow-200">
                  Pending Upload ({pendingFiles.length})
                </h3>
              </div>
              
              <div className="space-y-3">
                {pendingFiles.map((file, index) => (
                  <div
                    key={`pending-${index}`}
                    className="flex justify-between items-center bg-gray-800/50 border border-gray-600 px-4 py-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <File className="text-yellow-400" size={16} />
                      <div>
                        <p className="text-white font-medium">{file.name}</p>
                        <p className="text-xs text-gray-400">
                          {(file.size / 1024).toFixed(1)} KB • Ready to upload
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFileRemove(files.indexOf(file))}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
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
          <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <HardDrive className="text-green-400" size={20} />
              <h3 className="text-lg font-semibold text-green-200">
                Files in Knowledge Base ({savedFiles.length})
              </h3>
            </div>
            
            {savedFiles.length === 0 ? (
              <div className="border border-dashed border-gray-600 p-6 rounded-lg text-center">
                <HardDrive className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No files uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedFiles.map((file, index) => (
                  <div
                    key={`saved-${index}`}
                    className="flex justify-between items-center bg-gray-800/50 border border-gray-600 px-4 py-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <File className="text-green-400" size={16} />
                      <div>
                        <p className="text-white font-medium">{file.name}</p>
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
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
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
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button 
              onClick={onClose} 
              className="flex-1 px-6 py-3 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={pendingFiles.length === 0 || !name.trim() || isUploading}
              className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium"
            >
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
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}