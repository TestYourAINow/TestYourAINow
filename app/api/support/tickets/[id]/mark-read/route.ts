// app/api/support/tickets/[id]/mark-read/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/db';
import { SupportTicket } from '@/models/SupportTicket';
import { TicketMessage } from '@/models/TicketMessage';
import mongoose from 'mongoose';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: ticketId } = await params;

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });
    }

    // Verify ticket belongs to user
    const ticket = await SupportTicket.findOne({
      _id: new mongoose.Types.ObjectId(ticketId),
      userId: session.user.id
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Mark all support messages in this ticket as read
    const updateResult = await TicketMessage.updateMany(
      {
        ticketId: new mongoose.Types.ObjectId(ticketId),
        senderType: 'support',
        readByUser: false
      },
      {
        $set: { readByUser: true }
      }
    );

    return NextResponse.json({
      success: true,
      markedAsRead: updateResult.modifiedCount
    });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}