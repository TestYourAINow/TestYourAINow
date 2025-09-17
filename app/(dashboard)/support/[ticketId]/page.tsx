// app/(dashboard)/support/[ticketId]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, Send, Paperclip, Image, X, Clock, User, 
  Headphones, CheckCircle, AlertCircle, MessageCircle, 
  Upload, Trash2, Eye
} from 'lucide-react';
import { useSupport } from '@/hooks/useSupport';
import { toast } from 'sonner';

interface TicketMessage {
  id: string;
  senderType: 'user' | 'support';
  senderName: string;
  senderEmail?: string;
  message: string;
  attachments: {
    type: string;
    url: string;
    filename: string;
    size: number;
    path: string;
  }[];
  createdAt: string;
}

interface TicketDetails {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  created: string;
  updated: string;
  user?: {
    name: string;
    email: string;
  };
}

export default function TicketConversationPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.ticketId as string;
  
  const { fetchTicketDetails, addMessage, uploadScreenshot, deleteScreenshot, updateTicketStatus } = useSupport();
  
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les détails du ticket et messages
  const loadTicketData = async () => {
    setLoading(true);
    const data = await fetchTicketDetails(ticketId);
    
    if (data) {
      setTicket(data.ticket);
      setMessages(data.messages);
    } else {
      toast.error('Ticket non trouvé');
      router.push('/support');
    }
    
    setLoading(false);
  };

  // Polling pour les nouveaux messages (toutes les 30 secondes)
  useEffect(() => {
    loadTicketData();
    
    const interval = setInterval(() => {
      loadTicketData();
    }, 30000);

    return () => clearInterval(interval);
  }, [ticketId]);

  // Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Envoyer un message
  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    setSending(true);
    
    try {
      const message = await addMessage(ticketId, newMessage, attachments);
      
      if (message) {
        setMessages(prev => [...prev, message]);
        setNewMessage('');
        setAttachments([]);
        toast.success('Message envoyé');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  // Upload de fichier
  const handleFileUpload = async (file: File) => {
    setUploading(true);
    
    try {
      const attachment = await uploadScreenshot(file, ticketId);
      setAttachments(prev => [...prev, attachment]);
      toast.success('Fichier téléchargé');
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    } finally {
      setUploading(false);
    }
  };

  // Supprimer un attachment
  const removeAttachment = async (index: number) => {
    const attachment = attachments[index];
    
    try {
      await deleteScreenshot(attachment.path);
      setAttachments(prev => prev.filter((_, i) => i !== index));
      toast.success('Fichier supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Changer le statut du ticket
  const handleStatusChange = async (newStatus: string) => {
    const success = await updateTicketStatus(ticketId, newStatus);
    if (success) {
      setTicket(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success('Statut mis à jour');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-300 bg-blue-500/20 border border-blue-500/40';
      case 'pending': return 'text-yellow-300 bg-yellow-500/20 border border-yellow-500/40';
      case 'resolved': return 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/40';
      case 'closed': return 'text-gray-300 bg-gray-500/20 border border-gray-500/40';
      default: return 'text-gray-300 bg-gray-500/20 border border-gray-500/40';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Ticket non trouvé</h3>
            <button 
              onClick={() => router.push('/support')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold"
            >
              Retour au support
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/support')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Retour au support
          </button>
          
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{ticket.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>ID: #{ticket.id}</span>
                  <span>Catégorie: {ticket.category}</span>
                  <span>Créé le: {formatDate(ticket.created)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                  {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                </span>
                
                {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2 py-1"
                  >
                    <option value="open">Ouvert</option>
                    <option value="pending">En attente</option>
                    <option value="resolved">Résolu</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6 mb-6">
          <div className="space-y-6 max-h-96 overflow-y-auto custom-scrollbar">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-lg ${
                    message.senderType === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                      : 'bg-gray-800 text-gray-100'
                  } rounded-2xl p-4 shadow-lg`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {message.senderType === 'support' ? (
                      <Headphones size={16} className="text-blue-400" />
                    ) : (
                      <User size={16} className="text-gray-300" />
                    )}
                    <span className="font-semibold text-sm">{message.senderName}</span>
                    <span className="text-xs opacity-70">{formatDate(message.createdAt)}</span>
                  </div>
                  
                  <div className="whitespace-pre-line">{message.message}</div>
                  
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.attachments.map((attachment, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-black/20 rounded-lg">
                          <Image size={16} />
                          <a 
                            href={attachment.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm hover:underline flex-1"
                          >
                            {attachment.filename}
                          </a>
                          <Eye size={14} className="opacity-60" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Zone de réponse */}
        {ticket.status !== 'closed' && (
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
            <div className="space-y-4">
              {/* Attachments preview */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {attachments.map((attachment, index) => (
                    <div key={index} className="relative bg-gray-800 rounded-lg p-2 flex items-center gap-2">
                      <Image size={16} className="text-blue-400" />
                      <span className="text-sm text-gray-300">{attachment.filename}</span>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Message input */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre réponse..."
                    className="w-full p-4 bg-gray-800/50 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        handleSendMessage();
                      }
                    }}
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                  />
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="p-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 text-gray-400 hover:text-white rounded-xl transition-all disabled:opacity-50"
                    title="Joindre une image"
                  >
                    {uploading ? <Upload className="animate-pulse" size={20} /> : <Paperclip size={20} />}
                  </button>
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={(!newMessage.trim() && attachments.length === 0) || sending}
                    className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Envoyer (Ctrl+Enter)"
                  >
                    {sending ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : <Send size={20} />}
                  </button>
                </div>
              </div>
              
              <div className="text-xs text-gray-400">
                Appuyez sur Ctrl+Enter pour envoyer rapidement
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}