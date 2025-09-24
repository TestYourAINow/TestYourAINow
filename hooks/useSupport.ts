// hooks/useSupport.ts (UPDATED with unread logic)
import { useState, useEffect } from 'react';

interface SupportTicket {
  id: string;
  title: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  created: string;
  lastUpdate: string;
  closedAt?: string; // NEW: When ticket was closed
  daysUntilDeletion?: number; // NEW: Days until automatic deletion
  messages: number;
  unreadCount?: number; // NEW: Unread support messages count
}

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
  priority: string;
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

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  category: string;
  priority: string;
  message: string;
  attachments: {
    type: string;
    url: string;
    filename: string;
    size: number;
    path: string;
  }[];
}

interface UnreadCounts {
  totalUnread: number;
  unreadCounts: { [ticketId: string]: number };
}

export function useSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({ totalUnread: 0, unreadCounts: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user tickets
  const fetchTickets = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/support/tickets');

      if (!response.ok) {
        throw new Error('Error loading tickets');
      }

      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Fetch unread counts
  const fetchUnreadCounts = async () => {
    try {
      const response = await fetch('/api/support/tickets/unread-counts');

      if (response.ok) {
        const data = await response.json();
        setUnreadCounts(data);

        // Update tickets with unread counts
        setTickets(prevTickets =>
          prevTickets.map(ticket => ({
            ...ticket,
            unreadCount: data.unreadCounts[ticket.id] > 0 ? data.unreadCounts[ticket.id] : undefined
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching unread counts:', err);
    }
  };

  // NEW: Mark ticket messages as read
  const markTicketAsRead = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}/mark-read`, {
        method: 'POST'
      });

      if (response.ok) {
        // Refresh unread counts after marking as read
        await fetchUnreadCounts();
      }
    } catch (err) {
      console.error('Error marking ticket as read:', err);
    }
  };

  // Create new ticket
  const createTicket = async (formData: ContactFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Error creating ticket');

      const result = await response.json();

      // Refresh ticket list
      await fetchTickets();
      await fetchUnreadCounts();

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update ticket status
  const updateTicketStatus = async (ticketId: string, status: string, priority?: string) => {
    setError(null);

    try {
      const response = await fetch(`/api/support/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, priority }),
      });

      if (!response.ok) {
        throw new Error('Error updating ticket');
      }

      await fetchTickets();
      await fetchUnreadCounts();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return false;
    }
  };

  // Fetch ticket details with messages
  const fetchTicketDetails = async (ticketId: string): Promise<{ ticket: TicketDetails; messages: TicketMessage[] } | null> => {
    setError(null);

    try {
      const response = await fetch(`/api/support/tickets/${ticketId}`);

      if (!response.ok) {
        throw new Error('Error loading ticket details');
      }

      const data = await response.json();

      // Auto-mark as read when fetching details
      await markTicketAsRead(ticketId);

      // NOUVEAU: Déclencher refresh sidebar immédiat
      window.dispatchEvent(new Event('refreshNotifications'));

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    }
  };

  // Add message to ticket
  const addMessage = async (ticketId: string, message: string, attachments: any[] = []): Promise<TicketMessage | null> => {
    setError(null);

    try {
      const response = await fetch(`/api/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, attachments }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error sending message');
      }

      const result = await response.json();

      // Refresh ticket list and unread counts
      await fetchTickets();
      await fetchUnreadCounts();

      return result.message;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Upload screenshot
  const uploadScreenshot = async (file: File, ticketId: string) => {
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('ticketId', ticketId);

      const response = await fetch('/api/support/upload-screenshot', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error uploading screenshot');
      }

      const result = await response.json();
      return {
        type: 'image',
        url: result.url,
        filename: result.filename,
        size: result.size,
        path: result.path
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Delete screenshot
  const deleteScreenshot = async (path: string) => {
    setError(null);

    try {
      const response = await fetch('/api/support/upload-screenshot', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path }),
      });

      if (!response.ok) {
        throw new Error('Error deleting screenshot');
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return false;
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchTickets();
    fetchUnreadCounts();
  }, []);

  // À ajouter AVANT le return final dans useSupport()
  useEffect(() => {
    const handleFocus = () => {
      fetchUnreadCounts();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUnreadCounts();
      }
    };

    const handleNotificationRefresh = () => {
      fetchUnreadCounts();
    };

    // Events
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('refreshNotifications', handleNotificationRefresh);

    // Polling 30 secondes
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchUnreadCounts();
      }
    }, 30000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('refreshNotifications', handleNotificationRefresh);
      clearInterval(interval);
    };
  }, []);

  return {
    tickets,
    unreadCounts, // NEW
    loading,
    error,
    createTicket,
    updateTicketStatus,
    fetchTicketDetails,
    addMessage,
    uploadScreenshot,
    deleteScreenshot,
    markTicketAsRead, // NEW
    refetchTickets: fetchTickets,
    refetchUnreadCounts: fetchUnreadCounts, // NEW
    clearError: () => setError(null)
  };
}