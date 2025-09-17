// app/admin/support/[ticketId]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  ArrowLeft, Send, User, Headphones, Clock, Mail,
  AlertCircle, CheckCircle, Edit, Shield, Image, Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminTicketMessage {
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

interface AdminTicketDetails {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  created: string;
  updated: string;
  user: {
    name: string;
    email: string;
  };
}

export default function AdminTicketConversationPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const ticketId = params.ticketId as string;
  
  const [ticket, setTicket] = useState<AdminTicketDetails | null>(null);
  const [messages, setMessages] = useState<AdminTicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Vérifier permissions admin
  useEffect(() => {
    if (!session?.user) return;
    
    const adminEmails = ['team@testyourainow.com', 'sango_ks@hotmail.com'];
    if (!adminEmails.includes(session.user.email || '')) {
      router.push('/dashboard');
      toast.error('Accès refusé');
      return;
    }

    loadTicketData();
  }, [session, ticketId]);

  // Charger les données du ticket
  const loadTicketData = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement');
      }
      
      const data = await response.json();
      setTicket(data.ticket);
      setMessages(data.messages);
    } catch (error) {
      toast.error('Ticket non trouvé');
      router.push('/admin/support');
    } finally {
      setLoading(false);
    }
  };

  // Polling toutes les 30s
  useEffect(() => {
    const interval = setInterval(loadTicketData, 30000);
    return () => clearInterval(interval);
  }, [ticketId]);

  // Scroll automatique
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Envoyer message admin
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage })
      });

      if (!response.ok) throw new Error('Erreur envoi');
      
      const result = await response.json();
      setMessages(prev => [...prev, result.message]);
      setNewMessage('');
      toast.success('Réponse envoyée');
      
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  // Changer statut/priorité
  const updateTicketInfo = async (updates: { status?: string; priority?: string }) => {
    setUpdating(true);
    
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Erreur de mise à jour');
      
      setTicket(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Ticket mis à jour');
    } catch (error) {
      toast.error('Erreur de mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-300 bg-red-500/20 border border-red-500/40';
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
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">
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
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Ticket non trouvé</h3>
            <button 
              onClick={() => router.push('/admin/support')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold"
            >
              Retour au dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Header Admin */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/support')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Retour au dashboard admin
          </button>
          
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="text-red-400" size={24} />
                  <h1 className="text-2xl font-bold text-white">{ticket.title}</h1>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="font-semibold">ID:</span>
                      <span className="font-mono">#{ticket.id}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <User size={16} />
                      <span>{ticket.user.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail size={16} />
                      <span>{ticket.user.email}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="font-semibold">Catégorie:</span>
                      <span>{ticket.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock size={16} />
                      <span>Créé le {formatDate(ticket.created)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Edit size={16} />
                      <span>Mis à jour le {formatDate(ticket.updated)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 min-w-48">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Statut:</span>
                  <select
                    value={ticket.status}
                    onChange={(e) => updateTicketInfo({ status: e.target.value })}
                    disabled={updating}
                    className={`text-xs font-semibold rounded-full px-3 py-1 border ${getStatusColor(ticket.status)} bg-transparent outline-none`}
                  >
                    <option value="open" className="bg-gray-800 text-white">Ouvert</option>
                    <option value="pending" className="bg-gray-800 text-white">En attente</option>
                    <option value="resolved" className="bg-gray-800 text-white">Résolu</option>
                    <option value="closed" className="bg-gray-800 text-white">Fermé</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Priorité:</span>
                  <select
                    value={ticket.priority}
                    onChange={(e) => updateTicketInfo({ priority: e.target.value })}
                    disabled={updating}
                    className="text-xs font-semibold rounded px-2 py-1 bg-gray-800 text-white border border-gray-700 outline-none"
                  >
                    <option value="low">Faible</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Élevée</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Headphones size={20} className="text-blue-400" />
            Conversation Support
          </h2>
          
          <div className="space-y-6 max-h-96 overflow-y-auto custom-scrollbar">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderType === 'support' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-lg ${
                    message.senderType === 'support'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                      : 'bg-gray-800 text-gray-100'
                  } rounded-2xl p-4 shadow-lg`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {message.senderType === 'support' ? (
                      <Headphones size={16} className="text-white" />
                    ) : (
                      <User size={16} className="text-gray-300" />
                    )}
                    <span className="font-semibold text-sm">{message.senderName}</span>
                    <span className="text-xs opacity-70">{formatDate(message.createdAt)}</span>
                    {message.senderType === 'support' && (
                      <Shield size={12} className="text-white opacity-60" />
                    )}
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

        {/* Zone de réponse Admin */}
        {ticket.status !== 'closed' && (
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield size={20} className="text-red-400" />
              Répondre en tant qu'admin
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre réponse..."
                    className="w-full p-4 bg-gray-800/50 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                    rows={4}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        handleSendMessage();
                      }
                    }}
                  />
                </div>
                
                <div className="flex flex-col justify-end">
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="p-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    title="Envoyer réponse support (Ctrl+Enter)"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                    ) : (
                      <Send size={24} />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  Appuyez sur Ctrl+Enter pour envoyer rapidement
                </div>
                
                <div className="flex items-center gap-2 text-xs">
                  <Shield size={12} className="text-red-400" />
                  <span className="text-gray-400">Mode Administrateur</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions rapides admin */}
        <div className="mt-6 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-300">Actions rapides:</h4>
            <div className="flex gap-2">
              {ticket.status === 'open' && (
                <button
                  onClick={() => updateTicketInfo({ status: 'pending' })}
                  disabled={updating}
                  className="px-3 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded hover:bg-yellow-500/30 transition-colors disabled:opacity-50"
                >
                  Marquer en attente
                </button>
              )}
              
              {(ticket.status === 'open' || ticket.status === 'pending') && (
                <button
                  onClick={() => updateTicketInfo({ status: 'resolved' })}
                  disabled={updating}
                  className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                >
                  Marquer comme résolu
                </button>
              )}
              
              {ticket.status === 'resolved' && (
                <button
                  onClick={() => updateTicketInfo({ status: 'closed' })}
                  disabled={updating}
                  className="px-3 py-1 bg-gray-500/20 text-gray-300 text-xs rounded hover:bg-gray-500/30 transition-colors disabled:opacity-50"
                >
                  Fermer le ticket
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}