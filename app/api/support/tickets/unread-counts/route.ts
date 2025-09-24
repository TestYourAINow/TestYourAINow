// app/api/support/tickets/unread-counts/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/db';
import { SupportTicket } from '@/models/SupportTicket';
import { TicketMessage } from '@/models/TicketMessage';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all user's tickets
    const userTickets = await SupportTicket.find({ 
      userId: session.user.id 
    }).select('_id');

    const ticketIds = userTickets.map(ticket => ticket._id);

    // Count unread support messages for each ticket
    const unreadCounts: { [ticketId: string]: number } = {};
    
    for (const ticketId of ticketIds) {
      const unreadCount = await TicketMessage.countDocuments({
        ticketId: new mongoose.Types.ObjectId(ticketId),
        senderType: 'support',
        readByUser: false
      });
      
      if (unreadCount > 0) {
        unreadCounts[ticketId.toString()] = unreadCount;
      }
    }

    // Total unread count across all tickets
    const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

    return NextResponse.json({
      success: true,
      totalUnread,
      unreadCounts // Per-ticket breakdown
    });

  } catch (error) {
    console.error('Error fetching unread counts:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}