// app/api/support/tickets/[id]/messages/route.ts (UPDATED - Fix SenderType Bug)
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/db';
import { SupportTicket } from '@/models/SupportTicket';
import { TicketMessage } from '@/models/TicketMessage';
import User from '@/models/User';
import mongoose from 'mongoose';

// GET - Récupérer les messages d'un ticket
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

    // Vérifier que le ticket appartient à l'utilisateur ou que c'est un admin
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

    return NextResponse.json({
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
    console.error('Error loading messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// POST - Ajouter un message à un ticket
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

    const { message, attachments } = await request.json();
    const { id: ticketId } = await params;

    if (!message || message.trim() === '') {
      return NextResponse.json(
        { error: 'Message is required' }, 
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });
    }

    // 🔧 FIX BUG: Détection admin plus claire
    const adminEmails = ['team@testyourainow.com', 'sango_ks@hotmail.com'];
    const isAdmin = adminEmails.includes(session.user.email || '');
    
    console.log('🐛 DEBUG - User email:', session.user.email);
    console.log('🐛 DEBUG - Is admin:', isAdmin);
    console.log('🐛 DEBUG - Admin emails:', adminEmails);

    const ticketQuery = isAdmin 
      ? { _id: new mongoose.Types.ObjectId(ticketId) }
      : { _id: new mongoose.Types.ObjectId(ticketId), userId: session.user.id };

    const ticket = await SupportTicket.findOne(ticketQuery);

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // 🔧 NOUVELLE LOGIQUE: User ne peut pas écrire si status pending ou closed
    if (!isAdmin) {
      if (ticket.status === 'pending') {
        return NextResponse.json({ 
          error: 'Cannot reply while ticket is pending admin response' 
        }, { status: 403 });
      }
      
      if (ticket.status === 'closed') {
        return NextResponse.json({ 
          error: 'Cannot reply to closed ticket' 
        }, { status: 403 });
      }
    }

    // 🔧 FIX: Déterminer le type de sender plus clairement
    const senderType = isAdmin ? 'support' : 'user';
    let senderName;
    
    if (isAdmin) {
      senderName = 'Support Team';
    } else {
      senderName = session.user.name || 'User'; // 🔧 FIX: Supprimé username qui n'existe pas
    }

    console.log('🐛 DEBUG - Sender type:', senderType);
    console.log('🐛 DEBUG - Sender name:', senderName);

    const newMessage = await TicketMessage.create({
      ticketId: new mongoose.Types.ObjectId(ticketId),
      senderType,
      senderName,
      senderEmail: session.user.email,
      message: message.trim(),
      attachments: attachments || []
    });

    // 🔧 UPDATE: Nouvelle logique de statuts
    const updateData: any = {};
    
    if (senderType === 'support') {
      // Quand le support répond, le ticket devient "open" (user peut maintenant répondre)
      if (ticket.status === 'pending') {
        updateData.status = 'open';
      }
    } else {
      // Quand l'user répond, ça reste "open" (pas de changement automatique)
      // L'admin devra manuellement fermer quand c'est terminé
    }

    if (Object.keys(updateData).length > 0) {
      await SupportTicket.findByIdAndUpdate(new mongoose.Types.ObjectId(ticketId), updateData);
    }

    return NextResponse.json({
      success: true,
      message: {
        id: newMessage._id.toString(),
        senderType: newMessage.senderType,
        senderName: newMessage.senderName,
        senderEmail: newMessage.senderEmail,
        message: newMessage.message,
        attachments: newMessage.attachments || [],
        createdAt: newMessage.createdAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error adding message:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}