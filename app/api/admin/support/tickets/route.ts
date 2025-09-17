// app/api/admin/support/tickets/route.ts (UPDATED - Sans Priority)
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/db';
import { SupportTicket } from '@/models/SupportTicket';
import { TicketMessage } from '@/models/TicketMessage';
import User from '@/models/User';

// GET - Récupérer TOUS les tickets (admin seulement)
export async function GET() {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier les permissions admin
    const adminEmails = ['team@testyourainow.com', 'sango_ks@hotmail.com'];
    if (!adminEmails.includes(session.user.email || '')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Récupérer tous les tickets avec infos utilisateur
    const tickets = await SupportTicket.find({})
      .sort({ createdAt: -1 });

    // Compter les messages pour chaque ticket et récupérer les infos user
    const ticketsWithDetails = await Promise.all(
      tickets.map(async (ticket) => {
        const messageCount = await TicketMessage.countDocuments({ ticketId: ticket._id });
        const user = await User.findById(ticket.userId);
        
        return {
          id: ticket._id.toString(),
          title: ticket.title,
          status: ticket.status,
          category: ticket.category,
          created: ticket.createdAt.toISOString(),
          updated: ticket.updatedAt.toISOString(),
          messages: messageCount,
          user: {
            name: user?.username || 'Unknown User',
            email: user?.email || 'unknown@email.com'
          }
        };
      })
    );

    return NextResponse.json({ tickets: ticketsWithDetails });
  } catch (error) {
    console.error('Error loading admin tickets:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}