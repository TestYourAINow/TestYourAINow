// app/(dashboard)/admin/support/page.tsx (UPDATED - Admin-Friendly UI)
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  MessageCircle, Search, Clock, User, Mail, 
  ChevronRight, BarChart3, AlertCircle,
  CheckCircle, Calendar, Archive, Shield,
  Headphones, Bell, Filter
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminTicketMessage {
  id: string;
  senderType: 'user' | 'support';
  message: string;
  createdAt: string;
}

interface AdminTicket {
  id: string;
  title: string;
  status: 'pending' | 'open' | 'closed';
  category: string;
  created: string;
  updated: string;
  closedAt?: string;
  daysUntilDeletion?: number;
  messages: number;
  lastMessage?: AdminTicketMessage; // NEW: Pour afficher le dernier message
  user: {
    name: string;
    email: string;
  };
}

export default function AdminSupportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Verify admin permissions
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/login');
      return;
    }

    const adminEmails = ['team@testyourainow.com', 'sango_ks@hotmail.com'];
    if (!adminEmails.includes(session.user.email || '')) {
      router.push('/dashboard');
      toast.error('Access denied - Administrator privileges required');
      return;
    }

    fetchAllTickets();
  }, [session, status]);

  // Fetch all tickets for admin view
  const fetchAllTickets = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/admin/support/tickets');
      
      if (!response.ok) {
        throw new Error('Failed to load tickets');
      }
      
      const data = await response.json();
      
      // Fetch last message for each ticket
      const ticketsWithMessages = await Promise.all(
        data.tickets.map(async (ticket: AdminTicket) => {
          try {
            const messagesRes = await fetch(`/api/support/tickets/${ticket.id}/messages`);
            if (messagesRes.ok) {
              const messagesData = await messagesRes.json();
              const messages = messagesData.messages || [];
              const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
              return { ...ticket, lastMessage };
            }
          } catch (err) {
            console.error('Error fetching messages:', err);
          }
          return ticket;
        })
      );
      
      setTickets(ticketsWithMessages);
    } catch (error) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  // Navigate to admin conversation view
  const handleTicketClick = (ticketId: string) => {
    router.push(`/admin/support/${ticketId}`);
  };

  // NEW: Identifier les tickets qui nécessitent une réponse
  const needsResponseTickets = tickets.filter(ticket => {
    // Ticket needs response if:
    // 1. Status is pending OR open
    // 2. Last message is from user
    return (
      (ticket.status === 'pending' || ticket.status === 'open') &&
      ticket.lastMessage?.senderType === 'user'
    );
  }).sort((a, b) => {
    // Trier par date de dernier message (plus récent en premier)
    const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  // Filter tickets by search and status
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    // Trier par date de mise à jour (plus récent en premier)
    return new Date(b.updated).getTime() - new Date(a.updated).getTime();
  });

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
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // NEW: Format relative time (ex: "5 min ago", "2 hours ago")
  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Calculate ticket statistics
  const stats = {
    total: tickets.length,
    needsResponse: needsResponseTickets.length,
    pending: tickets.filter(t => t.status === 'pending').length,
    open: tickets.filter(t => t.status === 'open').length,
    closed: tickets.filter(t => t.status === 'closed').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Admin Header */}
        <div className="mb-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-600/20">
                <Shield className="text-white" size={28} />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-400 rounded-full flex items-center justify-center">
                <Headphones className="text-white" size={12} />
              </div>
            </div>
            
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-2">
                Support Admin Dashboard
              </h1>
              <p className="text-gray-400 text-lg">
                Manage all user support tickets and conversations
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {/* NEW: Needs Response - Card prioritaire */}
          <div className="bg-gradient-to-br from-red-600/20 to-orange-600/20 backdrop-blur-xl border border-red-500/40 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl"></div>
            <div className="flex items-center gap-3 relative z-10">
              <Bell className="text-red-400" size={24} />
              <div>
                <p className="text-3xl font-bold text-red-400">{stats.needsResponse}</p>
                <p className="text-gray-300 text-sm font-semibold">Needs Response</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <Archive className="text-blue-400" size={24} />
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-gray-400 text-sm">Total</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-orange-400" size={24} />
              <div>
                <p className="text-2xl font-bold text-orange-400">{stats.pending}</p>
                <p className="text-gray-400 text-sm">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <MessageCircle className="text-blue-400" size={24} />
              <div>
                <p className="text-2xl font-bold text-blue-400">{stats.open}</p>
                <p className="text-gray-400 text-sm">Open</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-gray-400" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-400">{stats.closed}</p>
                <p className="text-gray-400 text-sm">Closed</p>
              </div>
            </div>
          </div>
        </div>

        {/* NEW: Needs Response Section - Prioritaire en haut */}
        {needsResponseTickets.length > 0 && (
          <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 backdrop-blur-xl border border-red-500/40 rounded-2xl shadow-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <Bell className="text-red-400 animate-pulse" size={24} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-red-300">
                  🚨 Needs Response ({needsResponseTickets.length})
                </h2>
                <p className="text-sm text-gray-400">Tickets waiting for your reply</p>
              </div>
            </div>

            <div className="space-y-3">
              {needsResponseTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => handleTicketClick(ticket.id)}
                  className="bg-gray-900/60 backdrop-blur-sm border border-red-500/30 rounded-xl p-4 hover:bg-gray-800/60 hover:border-red-400/50 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-red-300 transition-colors">
                          {ticket.title}
                        </h3>
                        <span className="text-xs text-gray-400 font-mono">#{ticket.id}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-300 mb-2">
                        <div className="flex items-center gap-2">
                          <User size={14} />
                          <span>{ticket.user.name}</span>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </span>
                      </div>

                      {/* NEW: Last message preview */}
                      {ticket.lastMessage && (
                        <div className="bg-gray-800/40 border border-gray-700/30 rounded-lg p-3 mt-2">
                          <div className="flex items-center gap-2 mb-1">
                            <User size={12} className="text-blue-400" />
                            <span className="text-xs font-semibold text-blue-300">
                              {ticket.user.name} replied {getRelativeTime(ticket.lastMessage.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 line-clamp-2">
                            {ticket.lastMessage.message}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <ChevronRight className="text-red-400 group-hover:text-red-300 transition-colors ml-4" size={20} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            {/* Search Input */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by title, email, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={18} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-gray-800/50 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* All Tickets List */}
        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
              All Tickets ({filteredTickets.length})
            </h2>
          </div>

          <div className="space-y-4">
            {filteredTickets.map((ticket) => {
              // Expiry detection for admin view
              const isNearExpiry = ticket.status === 'closed' && ticket.daysUntilDeletion !== undefined && ticket.daysUntilDeletion <= 7;
              const isUrgentExpiry = isNearExpiry && ticket.daysUntilDeletion !== undefined && ticket.daysUntilDeletion <= 3;
              
              // NEW: Highlight if needs response
              const needsResponse = ticket.lastMessage?.senderType === 'user' && (ticket.status === 'pending' || ticket.status === 'open');
              
              return (
                <div
                  key={ticket.id}
                  onClick={() => handleTicketClick(ticket.id)}
                  className={`backdrop-blur-sm border rounded-xl p-5 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer group relative ${
                    isUrgentExpiry 
                      ? 'bg-red-800/20 border-red-500/50 hover:border-red-400/60' 
                      : isNearExpiry 
                        ? 'bg-orange-800/20 border-orange-500/50 hover:border-orange-400/60'
                        : needsResponse
                          ? 'bg-red-900/10 border-red-500/20 hover:border-red-400/40'
                          : 'bg-gray-800/50 border-gray-700/50 hover:border-blue-500/30'
                  }`}
                >
                  {/* Expiry warning */}
                  {isNearExpiry && (
                    <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold ${
                      isUrgentExpiry ? 'bg-red-500/20 text-red-300' : 'bg-orange-500/20 text-orange-300'
                    }`}>
                      🗑️ {ticket.daysUntilDeletion === 0 ? 'Deletes today' : `${ticket.daysUntilDeletion}d until deletion`}
                    </div>
                  )}

                  {/* NEW: Needs response indicator */}
                  {needsResponse && !isNearExpiry && (
                    <div className="absolute top-3 left-3 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                          {ticket.title}
                        </h3>
                        <span className="text-xs text-gray-400 font-mono">#{ticket.id}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <User size={14} />
                          <span>{ticket.user.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Mail size={14} />
                          <span>{ticket.user.email}</span>
                        </div>
                        <span className="text-xs text-gray-400">{ticket.category}</span>
                      </div>

                      {/* NEW: Last activity indicator */}
                      {ticket.lastMessage && (
                        <div className="text-xs text-gray-400 flex items-center gap-2">
                          <Clock size={12} />
                          <span>
                            {ticket.lastMessage.senderType === 'user' ? '👤 User' : '🎧 Support'} replied {getRelativeTime(ticket.lastMessage.createdAt)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </span>
                      <ChevronRight className="text-gray-400 group-hover:text-blue-400 transition-colors" size={20} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>Created {formatDate(ticket.created)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle size={12} />
                        <span>{ticket.messages} messages</span>
                      </div>
                      {ticket.status === 'closed' && ticket.closedAt && (
                        <div className="flex items-center gap-1">
                          <Archive size={12} />
                          <span>Closed {formatDate(ticket.closedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTickets.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Archive className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">No tickets found</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                No tickets match your current search and filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}