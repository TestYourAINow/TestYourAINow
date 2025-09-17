// app/(dashboard)/admin/support/page.tsx (UPDATED - Sans Priority + Actions Rapides)
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  MessageCircle, Search, Clock, User, Mail, 
  ChevronRight, BarChart3, AlertCircle,
  CheckCircle, Calendar, Archive, Shield,
  Headphones, Users
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminTicket {
  id: string;
  title: string;
  status: 'pending' | 'open' | 'closed'; // 🔧 Seulement 3 statuts
  category: string;
  created: string;
  updated: string;
  messages: number;
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
  const [statusFilter, setStatusFilter] = useState('pending'); // 🔧 Défaut à pending

  // Vérifier les permissions admin
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/login');
      return;
    }

    const adminEmails = ['team@testyourainow.com', 'sango_ks@hotmail.com'];
    if (!adminEmails.includes(session.user.email || '')) {
      router.push('/dashboard');
      toast.error('Accès refusé - Droits administrateur requis');
      return;
    }

    fetchAllTickets();
  }, [session, status]);

  // Récupérer tous les tickets (version admin)
  const fetchAllTickets = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/admin/support/tickets');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des tickets');
      }
      
      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des tickets');
    } finally {
      setLoading(false);
    }
  };

  // Naviguer vers la conversation admin
  const handleTicketClick = (ticketId: string) => {
    router.push(`/admin/support/${ticketId}`);
  };

  // 🔧 SUPPRIMÉ: quickStatusChange (plus d'actions rapides)

  // 🔧 FILTRES SIMPLIFIÉS: Seulement 3 statuts
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-300 bg-orange-500/20 border border-orange-500/40';
      case 'open': return 'text-blue-300 bg-blue-500/20 border border-blue-500/40';
      case 'closed': return 'text-gray-300 bg-gray-500/20 border border-gray-500/40';
      default: return 'text-gray-300 bg-gray-500/20 border border-gray-500/40';
    }
  };

  // 🔧 SUPPRIMÉ: getPriorityColor (plus de priorité)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 🔧 STATISTIQUES MISES À JOUR: 3 statuts seulement
  const stats = {
    total: tickets.length,
    pending: tickets.filter(t => t.status === 'pending').length,
    open: tickets.filter(t => t.status === 'open').length,
    closed: tickets.filter(t => t.status === 'closed').length
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
        {/* Header Admin */}
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
                Gérez tous les tickets de support des utilisateurs
              </p>
            </div>
          </div>
        </div>

        {/* 🔧 STATISTIQUES MISES À JOUR: 4 cartes pour 3 statuts + total */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <Archive className="text-blue-400" size={24} />
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-gray-400 text-sm">Total Tickets</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-orange-400" size={24} />
              <div>
                <p className="text-2xl font-bold text-orange-400">{stats.pending}</p>
                <p className="text-gray-400 text-sm">En Attente</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <MessageCircle className="text-blue-400" size={24} />
              <div>
                <p className="text-2xl font-bold text-blue-400">{stats.open}</p>
                <p className="text-gray-400 text-sm">Ouverts</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-gray-400" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-400">{stats.closed}</p>
                <p className="text-gray-400 text-sm">Fermés</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et Recherche */}
        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            {/* Recherche */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher par titre, email, ou ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400"
                />
              </div>
            </div>

            {/* 🔧 FILTRES SIMPLIFIÉS: Seulement statuts */}
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-gray-800/50 border border-gray-700/50 text-white rounded-xl outline-none focus:border-blue-500/60"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="open">Ouverts</option>
                <option value="closed">Fermés</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des Tickets */}
        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
              Tickets Support ({filteredTickets.length})
            </h2>
          </div>

          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => handleTicketClick(ticket.id)}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-5 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer group hover:border-blue-500/30"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                        {ticket.title}
                      </h3>
                      <span className="text-xs text-gray-400 font-mono">#{ticket.id}</span>
                      {/* 🔧 SUPPRIMÉ: Priority badge */}
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
                      <span>Créé le {formatDate(ticket.created)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>Mis à jour le {formatDate(ticket.updated)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle size={12} />
                      <span>{ticket.messages} messages</span>
                    </div>
                  </div>

                  {/* 🔧 SUPPRIMÉ: Actions rapides */}
                </div>
              </div>
            ))}
          </div>

          {filteredTickets.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Archive className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Aucun ticket trouvé</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Aucun ticket ne correspond à vos critères de recherche actuels.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}