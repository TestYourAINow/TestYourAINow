// hooks/useSupport.ts
import { useState, useEffect } from 'react';

interface SupportTicket {
  id: string;
  title: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  created: string;
  lastUpdate: string;
  messages: number;
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

export function useSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
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

      if (!response.ok) {
        throw new Error('Error creating ticket');
      }

      const result = await response.json();
      
      // Refresh ticket list
      await fetchTickets();
      
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
        throw new Error('Error sending message');
      }
      
      const result = await response.json();
      
      // Refresh ticket list to update counter
      await fetchTickets();
      
      return result.message;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
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

  useEffect(() => {
    fetchTickets();
  }, []);

  return {
    tickets,
    loading,
    error,
    createTicket,
    updateTicketStatus,
    fetchTicketDetails,
    addMessage,
    uploadScreenshot,
    deleteScreenshot,
    refetchTickets: fetchTickets,
    clearError: () => setError(null)
  };
}