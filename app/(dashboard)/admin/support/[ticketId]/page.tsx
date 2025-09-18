'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  ArrowLeft, Send, User, Headphones, Clock, Mail,
  AlertCircle, CheckCircle, Edit, Shield, Image, Eye, RefreshCw
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
  const [refreshing, setRefreshing] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Admin permission check
  useEffect(() => {
    if (!session?.user) return;
    
    const adminEmails = ['team@testyourainow.com', 'sango_ks@hotmail.com'];
    if (!adminEmails.includes(session.user.email || '')) {
      router.push('/dashboard');
      toast.error('Access denied');
      return;
    }

    loadTicketData();
  }, [session, ticketId]);

  // Manual refresh functionality
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTicketData();
    setRefreshing(false);
    toast.success('Conversation updated');
  };

  // Load ticket data
  const loadTicketData = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load ticket');
      }
      
      const data = await response.json();
      setTicket(data.ticket);
      setMessages(data.messages);
    } catch (error) {
      toast.error('Ticket not found');
      router.push('/admin/support');
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send admin message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage })
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const result = await response.json();
      setMessages(prev => [...prev, result.message]);
      setNewMessage('');
      toast.success('Response sent');
      
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Update ticket status
  const updateTicketStatus = async (newStatus: string) => {
    setUpdating(true);
    
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update ticket');
      
      setTicket(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
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
            <h3 className="text-xl font-bold text-white mb-2">Ticket not found</h3>
            <button 
              onClick={() => router.push('/admin/support')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold"
            >
              Back to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Admin Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/support')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to admin dashboard
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
                      <span className="font-semibold">Category:</span>
                      <span>{ticket.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock size={16} />
                      <span>Created {formatDate(ticket.created)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Edit size={16} />
                      <span>Updated {formatDate(ticket.updated)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Status controls and refresh */}
              <div className="flex flex-col gap-3 min-w-48">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Status:</span>
                  <select
                    value={ticket.status}
                    onChange={(e) => updateTicketStatus(e.target.value)}
                    disabled={updating}
                    className={`text-xs font-semibold rounded-full px-3 py-1 border ${getStatusColor(ticket.status)} bg-transparent outline-none`}
                  >
                    <option value="pending" className="bg-gray-800 text-white">Pending</option>
                    <option value="open" className="bg-gray-800 text-white">Open</option>
                    <option value="closed" className="bg-gray-800 text-white">Closed</option>
                  </select>
                </div>
                
                {/* Manual refresh button */}
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center justify-center gap-2 p-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 text-gray-400 hover:text-white rounded-lg transition-all disabled:opacity-50"
                  title="Refresh conversation"
                >
                  <RefreshCw className={`${refreshing ? 'animate-spin' : ''}`} size={14} />
                  <span className="text-xs">Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Headphones size={20} className="text-blue-400" />
            Support Conversation
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

        {/* Admin response area */}
        {ticket.status !== 'closed' && (
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield size={20} className="text-red-400" />
              Reply as administrator
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your response..."
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
                    title="Send support response (Ctrl+Enter)"
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
                  Press Ctrl+Enter to send quickly
                </div>
                
                <div className="flex items-center gap-2 text-xs">
                  <Shield size={12} className="text-red-400" />
                  <span className="text-gray-400">Administrator Mode</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="mt-6 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-300">Quick actions:</h4>
            <div className="flex gap-2">
              {ticket.status === 'pending' && (
                <button
                  onClick={() => updateTicketStatus('open')}
                  disabled={updating}
                  className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                >
                  Open ticket
                </button>
              )}
              
              {ticket.status === 'open' && (
                <button
                  onClick={() => updateTicketStatus('closed')}
                  disabled={updating}
                  className="px-3 py-1 bg-gray-500/20 text-gray-300 text-xs rounded hover:bg-gray-500/30 transition-colors disabled:opacity-50"
                >
                  Close ticket
                </button>
              )}

              {ticket.status === 'closed' && (
                <button
                  onClick={() => updateTicketStatus('open')}
                  disabled={updating}
                  className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                >
                  Reopen ticket
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}