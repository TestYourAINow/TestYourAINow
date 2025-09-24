// app/api/admin/support/tickets/route.ts (UPDATED with expiry info)
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/db';
import { SupportTicket } from '@/models/SupportTicket';
import { TicketMessage } from '@/models/TicketMessage';
import User from '@/models/User';

// GET - Retrieve all tickets for admin view (UPDATED with expiry calculations)
export async function GET() {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin permissions
    const adminEmails = ['team@testyourainow.com', 'sango_ks@hotmail.com'];
    if (!adminEmails.includes(session.user.email || '')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Retrieve all tickets with user information
    const tickets = await SupportTicket.find({})
      .sort({ createdAt: -1 });

    // Count messages for each ticket and get user info + expiry calculations
    const ticketsWithDetails = await Promise.all(
      tickets.map(async (ticket) => {
        const messageCount = await TicketMessage.countDocuments({ ticketId: ticket._id });
        const user = await User.findById(ticket.userId);
        
        // NEW: Calculate days until deletion if closed
        let daysUntilDeletion = null;
        if (ticket.status === 'closed' && ticket.closedAt) {
          const daysSinceClosed = Math.floor((Date.now() - ticket.closedAt.getTime()) / (1000 * 60 * 60 * 24));
          daysUntilDeletion = Math.max(0, 30 - daysSinceClosed);
        }
        
        return {
          id: ticket._id.toString(),
          title: ticket.title,
          status: ticket.status,
          category: ticket.category,
          created: ticket.createdAt.toISOString(),
          updated: ticket.updatedAt.toISOString(),
          closedAt: ticket.closedAt?.toISOString(), // NEW
          daysUntilDeletion, // NEW
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