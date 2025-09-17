// app/api/support/tickets/[id]/messages/route.ts (VERSION CORRIGÉE)
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/db';
import { SupportTicket } from '@/models/SupportTicket';
import { TicketMessage } from '@/models/TicketMessage';
import User from '@/models/User';
import mongoose from 'mongoose'; // 🔧 AJOUT CRUCIAL

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

    // 🔧 UTILISER ObjectId pour les messages
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
  { params }: { params: Promise<{ id: string }> } // 🔧 CORRECTION: Promise<{ id: string }>
) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, attachments } = await request.json();
    const { id: ticketId } = await params; // 🔧 CORRECTION: await params

    if (!message || message.trim() === '') {
      return NextResponse.json(
        { error: 'Message is required' }, 
        { status: 400 }
      );
    }

    // 🔧 VÉRIFIER QUE L'ID EST VALIDE
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });
    }

    // Vérifier que le ticket existe et appartient à l'utilisateur ou que c'est un admin
    const isAdmin = ['team@testyourainow.com', 'sango_ks@hotmail.com'].includes(session.user.email || '');
    
    // 🔧 UTILISER new mongoose.Types.ObjectId()
    const ticketQuery = isAdmin 
      ? { _id: new mongoose.Types.ObjectId(ticketId) }
      : { _id: new mongoose.Types.ObjectId(ticketId), userId: session.user.id };

    const ticket = await SupportTicket.findOne(ticketQuery);

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Déterminer le type de sender
    const senderType = isAdmin ? 'support' : 'user';
    let senderName = session.user.name || 'User';
    
    if (isAdmin) {
      senderName = 'Support Team';
    }

    // 🔧 CRÉER LE MESSAGE AVEC ObjectId
    const newMessage = await TicketMessage.create({
      ticketId: new mongoose.Types.ObjectId(ticketId),
      senderType,
      senderName,
      senderEmail: session.user.email,
      message: message.trim(),
      attachments: attachments || []
    });

    // Mettre à jour le ticket (updatedAt et potentiellement le statut)
    const updateData: any = {};
    
    if (senderType === 'support') {
      // Quand le support répond, on peut mettre le statut à "pending" 
      if (ticket.status === 'open') {
        updateData.status = 'pending';
      }
    } else {
      // Quand l'user répond, on remet le statut à "open" 
      if (ticket.status === 'pending') {
        updateData.status = 'open';
      }
    }

    await SupportTicket.findByIdAndUpdate(new mongoose.Types.ObjectId(ticketId), updateData);

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