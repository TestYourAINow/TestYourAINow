// app/api/support/tickets/[id]/route.ts (VERSION CORRIGÉE)
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/db';
import { SupportTicket } from '@/models/SupportTicket';
import { TicketMessage } from '@/models/TicketMessage';
import User from '@/models/User';
import mongoose from 'mongoose'; // 🔧 AJOUT CRUCIAL

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

    // 🔧 VÉRIFIER QUE L'ID EST VALIDE
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });
    }

    // Vérifier que le ticket appartient à l'utilisateur ou que c'est un admin
    const isAdmin = ['team@testyourainow.com', 'sango_ks@hotmail.com'].includes(session.user.email || '');
    
    // 🔧 UTILISER new mongoose.Types.ObjectId()
    const ticketQuery = isAdmin 
      ? { _id: new mongoose.Types.ObjectId(ticketId) }
      : { _id: new mongoose.Types.ObjectId(ticketId), userId: session.user.id };

    const ticket = await SupportTicket.findOne(ticketQuery);

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // 🔧 UTILISER ObjectId pour les messages aussi
    const messages = await TicketMessage.find({ ticketId: new mongoose.Types.ObjectId(ticketId) })
      .sort({ createdAt: 1 });

    // Si admin, récupérer les infos de l'utilisateur
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
        priority: ticket.priority,
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

// PUT - Mettre à jour le statut du ticket
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, priority } = await request.json();
    const ticketId = params.id;

    // 🔧 VÉRIFIER QUE L'ID EST VALIDE
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });
    }

    // Vérifier les permissions (admin ou propriétaire)
    const isAdmin = ['team@testyourainow.com', 'sango_ks@hotmail.com'].includes(session.user.email || '');
    
    // 🔧 UTILISER new mongoose.Types.ObjectId()
    const ticketQuery = isAdmin 
      ? { _id: new mongoose.Types.ObjectId(ticketId) }
      : { _id: new mongoose.Types.ObjectId(ticketId), userId: session.user.id };

    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;

    const ticket = await SupportTicket.findOneAndUpdate(
      ticketQuery,
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