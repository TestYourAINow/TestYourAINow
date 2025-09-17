// app/api/support/tickets/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/db';
import { SupportTicket } from '@/models/SupportTicket';
import { TicketMessage } from '@/models/TicketMessage';
import User from '@/models/User';

// GET - Récupérer les tickets de l'utilisateur
export async function GET() {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tickets = await SupportTicket.find({ userId: session.user.id })
      .sort({ createdAt: -1 });

    // Compter les messages pour chaque ticket
    const ticketsWithMessageCount = await Promise.all(
      tickets.map(async (ticket) => {
        const messageCount = await TicketMessage.countDocuments({ ticketId: ticket._id });
        return {
          id: ticket._id.toString(),
          title: ticket.title,
          status: ticket.status,
          priority: ticket.priority,
          category: ticket.category,
          created: ticket.createdAt.toISOString().split('T')[0],
          lastUpdate: ticket.updatedAt.toISOString().split('T')[0],
          messages: messageCount
        };
      })
    );

    return NextResponse.json({ tickets: ticketsWithMessageCount });
  } catch (error) {
    console.error('Error loading tickets:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau ticket
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, subject, category, message, attachments } = await request.json();

    // Validation
    if (!subject || !category || !message) {
      return NextResponse.json(
        { error: 'Required fields missing' }, 
        { status: 400 }
      );
    }

    // Créer le ticket
    const ticket = await SupportTicket.create({
      userId: session.user.id,
      title: subject,
      category,
      priority: 'medium',
      status: 'open'
    });

    // Créer le message initial
    await TicketMessage.create({
      ticketId: ticket._id,
      senderType: 'user',
      senderName: name || session.user.name || 'User',
      senderEmail: email || session.user.email,
      message,
      attachments: attachments || []
    });

    return NextResponse.json({ 
      success: true, 
      ticketId: ticket._id.toString(),
      message: 'Ticket created successfully' 
    });

  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}