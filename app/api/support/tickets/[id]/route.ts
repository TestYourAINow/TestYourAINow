// app/api/support/tickets/[id]/route.ts (UPDATED - Sans Priority)
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/db';
import { SupportTicket } from '@/models/SupportTicket';
import { TicketMessage } from '@/models/TicketMessage';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET(
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

    // Verify ticket belongs to user or user is admin
    const isAdmin = ['team@testyourainow.com', 'sango_ks@hotmail.com'].includes(session.user.email || '');
    
    const ticketQuery = isAdmin 
      ? { _id: new mongoose.Types.ObjectId(ticketId) }
      : { _id: new mongoose.Types.ObjectId(ticketId), userId: session.user.id };

    const ticket = await SupportTicket.findOne(ticketQuery);

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const messages = await TicketMessage.find({ ticketId: new mongoose.Types.ObjectId(ticketId) })
      .sort({ createdAt: 1 });

    // If admin, get user information
    let userInfo = null;
    if (isAdmin) {
      const user = await User.findById(ticket.userId);
      userInfo = {
        name: user?.username || user?.name || 'Unknown',
        email: user?.email || 'unknown@email.com'
      };
    }

    return NextResponse.json({
      ticket: {
        id: ticket._id.toString(),
        title: ticket.title,
        status: ticket.status,
        category: ticket.category,
        created: ticket.createdAt.toISOString(),
        updated: ticket.updatedAt.toISOString(),
        user: userInfo
      },
      messages: messages.map((msg: any) => ({
        id: msg._id.toString(),
        senderType: msg.senderType,
        senderName: msg.senderName,
        senderEmail: msg.senderEmail,
        message: msg.message,
        attachments: msg.attachments || [],
        createdAt: msg.createdAt.toISOString()
      }))
    });

  } catch (error) {
    console.error('Error loading ticket details:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// PUT - Update ticket status (ADMIN ONLY)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();
    const { id: ticketId } = await params;

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });
    }

    // Only admins can change status
    const isAdmin = ['team@testyourainow.com', 'sango_ks@hotmail.com'].includes(session.user.email || '');
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Validate status values
    const validStatuses = ['pending', 'open', 'closed'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;

    const ticket = await SupportTicket.findByIdAndUpdate(
      new mongoose.Types.ObjectId(ticketId),
      updateData,
      { new: true }
    );

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}