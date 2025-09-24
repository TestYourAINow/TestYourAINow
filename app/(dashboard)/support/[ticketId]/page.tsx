'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Send, X, Clock, User,
  Headphones, CheckCircle, AlertCircle, MessageCircle,
  Eye, RefreshCw, Calendar, Archive
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
  readByUser: boolean; // NEW
  createdAt: string;
}

interface TicketDetails {
  id: string;
  title: string;
  status: string;
  category: string;
  created: string;
  updated: string;
  closedAt?: string; // NEW
  daysUntilDeletion?: number; // NEW
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
  const [refreshing, setRefreshing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Manual refresh functionality
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTicketData();
    setRefreshing(false);
    toast.success('Conversation updated');
  };

  // Load ticket details and messages
  const loadTicketData = async () => {
    setLoading(true);
    const data = await fetchTicketDetails(ticketId);

    if (data) {
      setTicket(data.ticket);
      setMessages(data.messages);
    } else {
      toast.error('Ticket not found');
      // NEW: Navigate to tickets tab instead of support main
      router.push('/support?tab=tickets');
    }

    setLoading(false);
  };

  useEffect(() => {
    loadTicketData();
  }, [ticketId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if user can write messages
  const canUserWrite = () => {
    if (!ticket) return false;

    // User cannot write if ticket is pending or closed
    if (ticket.status === 'pending') return false;
    if (ticket.status === 'closed') return false;

    // User can only write when ticket is open
    return ticket.status === 'open';
  };

  // Get status message for user
  const getStatusMessage = () => {
    if (!ticket) return '';

    switch (ticket.status) {
      case 'pending':
        return '⏳ Your ticket is awaiting response from our support team. You will be able to reply once an agent has taken charge of your request.';
      case 'closed':
        return '🔒 This conversation has been closed by our support team. If you have additional questions, please create a new ticket.';
      case 'open':
        return '✅ You can now communicate with our support team.';
      default:
        return '';
    }
  };

  // Send user message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!canUserWrite()) return;

    setSending(true);

    try {
      const message = await addMessage(ticketId, newMessage);

      if (message) {
        setMessages(prev => [...prev, message]);
        setNewMessage('');
        toast.success('Message sent');
      }
    } catch (error: any) {
      // Handle specific error scenarios
      if (error.message.includes('pending') || error.message.includes('closed')) {
        toast.error('Unable to reply in current ticket state');
        // Reload data to update status
        await loadTicketData();
      } else {
        toast.error('Failed to send message');
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
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // NEW: Get expiry warning component
  const getExpiryWarning = () => {
    // Fix: Vérifications strictes pour éviter "null"
    if (!ticket ||
      ticket.status !== 'closed' ||
      !ticket.daysUntilDeletion ||
      ticket.daysUntilDeletion === null ||
      ticket.daysUntilDeletion === undefined) {
      return null;
    }

    const days = ticket.daysUntilDeletion;

    if (days > 7) return null; // Only show warning in last week

    const urgencyLevel = days <= 3 ? 'high' : 'medium';
    const bgColor = urgencyLevel === 'high' ? 'bg-red-500/20 border-red-500/40' : 'bg-orange-500/20 border-orange-500/40';
    const textColor = urgencyLevel === 'high' ? 'text-red-300' : 'text-orange-300';
    const icon = urgencyLevel === 'high' ? AlertCircle : Clock;
    const IconComponent = icon;

    return (
      <div className={`p-4 rounded-xl border ${bgColor} mb-4`}>
        <div className="flex items-start gap-3">
          <IconComponent className={textColor} size={20} />
          <div>
            <h4 className={`font-semibold ${textColor} mb-1`}>
              {urgencyLevel === 'high' ? 'Urgent: Ticket Deletion Warning' : 'Ticket Deletion Notice'}
            </h4>
            <p className="text-sm text-gray-300">
              This closed ticket will be permanently deleted in <strong>{days} day{days !== 1 ? 's' : ''}</strong>.
              All messages and attachments will be removed and cannot be recovered.
            </p>
            {days <= 3 && (
              <p className="text-xs text-gray-400 mt-2">
                📋 Save any important information now before it's deleted.
              </p>
            )}
          </div>
        </div>
      </div>
    );
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
            <h3 className="text-xl font-bold text-white mb-2">Ticket not found</h3>
            <button
              onClick={() => router.push('/support?tab=tickets')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold"
            >
              Back to tickets
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
            onClick={() => router.push('/support?tab=tickets')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to tickets
          </button>

          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{ticket.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>ID: #{ticket.id}</span>
                  <span>Category: {ticket.category}</span>
                  <span>Created: {formatDate(ticket.created)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                  {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                </span>

                {/* Manual refresh button */}
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 text-gray-400 hover:text-white rounded-lg transition-all disabled:opacity-50"
                  title="Refresh conversation"
                >
                  <RefreshCw className={`${refreshing ? 'animate-spin' : ''}`} size={16} />
                </button>
              </div>
            </div>

{/* Expiry info simple pour tickets fermés */}
{ticket.status === 'closed' && ticket.daysUntilDeletion !== null && ticket.daysUntilDeletion !== undefined && (
  <div className="mb-4 text-xs text-gray-400 flex items-center gap-2">
    <Archive size={12} />
    <span>
      {ticket.daysUntilDeletion > 0 
        ? `This ticket will be deleted in ${ticket.daysUntilDeletion} day${ticket.daysUntilDeletion !== 1 ? 's' : ''}` 
        : 'This ticket will be deleted today'}
    </span>
  </div>
)}

            {/* NEW: Expiry warning */}
            {getExpiryWarning()}

            {/* Status message for user */}
            {getStatusMessage() && (
              <div className={`p-4 rounded-xl border text-sm ${ticket.status === 'pending'
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
                  className={`max-w-lg ${message.senderType === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                      : 'bg-gray-800 text-gray-100'
                    } rounded-2xl p-4 shadow-lg relative`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {message.senderType === 'support' ? (
                      <Headphones size={16} className="text-blue-400" />
                    ) : (
                      <User size={16} className="text-gray-300" />
                    )}
                    <span className="font-semibold text-sm">{message.senderName}</span>
                    <span className="text-xs opacity-70">{formatDate(message.createdAt)}</span>
                    {/* NEW: Unread indicator for support messages */}
                    {message.senderType === 'support' && !message.readByUser && (
                      <span className="bg-blue-500 rounded-full h-2 w-2 flex-shrink-0">
                        
                      </span>
                    )}
                  </div>

                  <div className="whitespace-pre-line">{message.message}</div>

                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.attachments.map((attachment, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-black/20 rounded-lg">
                          <Eye size={16} />
                          {/* Non-clickable images if ticket is closed */}
                          {ticket.status === 'closed' ? (
                            <span className="text-sm text-gray-400 flex-1 opacity-60">
                              {attachment.filename} (Archived)
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

        {/* Response area - conditional */}
        {canUserWrite() ? (
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
            <div className="space-y-4">
              {/* Message input */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your response..."
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
                    title="Send message (Ctrl+Enter)"
                  >
                    {sending ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : <Send size={20} />}
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-400">
                Press Ctrl+Enter to send quickly
              </div>
            </div>
          </div>
        ) : (
          /* Message when user cannot write */
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
            <div className="text-center py-8">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${ticket.status === 'pending'
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
                {ticket.status === 'pending' ? 'Awaiting response' : 'Conversation closed'}
              </h3>

              <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
                {getStatusMessage()}
              </p>

              {ticket.status === 'closed' && (
                <button
                  onClick={() => router.push('/support?tab=contact')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-semibold transition-all"
                >
                  Create new ticket
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}