// app/(dashboard)/support/[ticketId]/page.tsx (UPDATED - Sans Polling + Logique + Sans Attachments)
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, Send, X, Clock, User, 
  Headphones, CheckCircle, AlertCircle, MessageCircle, 
  Eye, RefreshCw
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
  
  const { fetchTicketDetails, addMessage, uploadScreenshot, deleteScreenshot } = useSupport();
  
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // 🔧 NOUVEAU: Pour refresh manuel
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🔧 FONCTION DE REFRESH MANUEL (remplace le polling)
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTicketData();
    setRefreshing(false);
    toast.success('Conversation mise à jour');
  };

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

  // 🔧 SUPPRIMÉ: Le polling automatique
  useEffect(() => {
    loadTicketData();
    // Plus d'interval ici !
  }, [ticketId]);

  // Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🔧 NOUVELLE LOGIQUE: Vérifier si l'user peut écrire
  const canUserWrite = () => {
    if (!ticket) return false;
    
    // User ne peut pas écrire si ticket est pending ou closed
    if (ticket.status === 'pending') return false;
    if (ticket.status === 'closed') return false;
    
    // User peut écrire seulement si ticket est open
    return ticket.status === 'open';
  };

  // Message d'état pour l'user
  const getStatusMessage = () => {
    if (!ticket) return '';
    
    switch (ticket.status) {
      case 'pending':
        return '⏳ Votre ticket est en attente de réponse de notre équipe support. Vous pourrez répondre une fois qu\'un agent aura pris en charge votre demande.';
      case 'closed':
        return '🔒 Cette conversation a été fermée par notre équipe support. Si vous avez encore des questions, créez un nouveau ticket.';
      case 'open':
        return '✅ Vous pouvez maintenant échanger avec notre équipe support.';
      default:
        return '';
    }
  };

  // 🔧 MODIFIÉ: Envoyer un message (sans attachments)
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!canUserWrite()) return;

    setSending(true);
    
    try {
      const message = await addMessage(ticketId, newMessage);
      
      if (message) {
        setMessages(prev => [...prev, message]);
        setNewMessage('');
        toast.success('Message envoyé');
      }
    } catch (error: any) {
      // 🔧 GESTION D'ERREURS SPÉCIFIQUES
      if (error.message.includes('pending') || error.message.includes('closed')) {
        toast.error('Impossible de répondre dans l\'état actuel du ticket');
        // Recharger les données pour mettre à jour le statut
        await loadTicketData();
      } else {
        toast.error('Erreur lors de l\'envoi du message');
      }
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-300 bg-orange-500/20 border border-orange-500/40';
      case 'open': return 'text-blue-300 bg-blue-500/20 border border-blue-500/40';
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
                
                {/* 🔧 BOUTON REFRESH MANUEL (remplace le polling) */}
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 text-gray-400 hover:text-white rounded-lg transition-all disabled:opacity-50"
                  title="Actualiser la conversation"
                >
                  <RefreshCw className={`${refreshing ? 'animate-spin' : ''}`} size={16} />
                </button>
              </div>
            </div>

            {/* 🔧 MESSAGE D'ÉTAT POUR L'USER */}
            {getStatusMessage() && (
              <div className={`p-4 rounded-xl border text-sm ${
                ticket.status === 'pending' 
                  ? 'bg-orange-500/10 border-orange-500/20 text-orange-300'
                  : ticket.status === 'closed'
                  ? 'bg-gray-500/10 border-gray-500/20 text-gray-300'
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-300'
              }`}>
                {getStatusMessage()}
              </div>
            )}
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
                          <Eye size={16} />
                          {/* 🔧 IMAGES NON-CLIQUABLES SI TICKET CLOSED */}
                          {ticket.status === 'closed' ? (
                            <span className="text-sm text-gray-400 flex-1 opacity-60">
                              {attachment.filename} (Archivé)
                            </span>
                          ) : (
                            <a 
                              href={attachment.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm hover:underline flex-1"
                            >
                              {attachment.filename}
                            </a>
                          )}
                          {ticket.status !== 'closed' && <Eye size={14} className="opacity-60" />}
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

        {/* 🔧 Zone de réponse - CONDITIONNELLE (SANS ATTACHMENTS) */}
        {canUserWrite() ? (
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
            <div className="space-y-4">
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
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
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
        ) : (
          /* 🔧 MESSAGE QUAND USER NE PEUT PAS ÉCRIRE */
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
            <div className="text-center py-8">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                ticket.status === 'pending' 
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {ticket.status === 'pending' ? (
                  <Clock size={24} />
                ) : (
                  <CheckCircle size={24} />
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">
                {ticket.status === 'pending' ? 'En attente de réponse' : 'Conversation fermée'}
              </h3>
              
              <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
                {getStatusMessage()}
              </p>

              {ticket.status === 'closed' && (
                <button 
                  onClick={() => router.push('/support?tab=contact')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-semibold transition-all"
                >
                  Créer un nouveau ticket
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}