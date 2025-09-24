// app/api/cron/cleanup-tickets/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { SupportTicket } from '@/models/SupportTicket';
import { TicketMessage } from '@/models/TicketMessage';
import { createClient } from '@supabase/supabase-js';
import mongoose from 'mongoose';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Verify this is a cron request (Vercel adds this header)
    // In production, you might want to add additional auth
    console.log('🧹 Starting ticket cleanup cron job...');

    await connectToDatabase();

    // Find tickets closed for more than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const expiredTickets = await SupportTicket.find({
      status: 'closed',
      closedAt: { $lt: thirtyDaysAgo }
    });

    console.log(`📋 Found ${expiredTickets.length} expired tickets to delete`);

    let deletedTickets = 0;
    let deletedMessages = 0;
    let deletedFiles = 0;

    for (const ticket of expiredTickets) {
      try {
        // 1. Get all messages for this ticket to find attachments
        const messages = await TicketMessage.find({ ticketId: ticket._id });
        
        // 2. Delete all attached files from Supabase
        for (const message of messages) {
          if (message.attachments && message.attachments.length > 0) {
            for (const attachment of message.attachments) {
              if (attachment.path) {
                try {
                  const { error } = await supabase.storage
                    .from('support-screenshots')
                    .remove([attachment.path]);
                  
                  if (error) {
                    console.error(`❌ Failed to delete file ${attachment.path}:`, error);
                  } else {
                    deletedFiles++;
                    console.log(`🗑️ Deleted file: ${attachment.path}`);
                  }
                } catch (fileError) {
                  console.error(`❌ Error deleting file ${attachment.path}:`, fileError);
                }
              }
            }
          }
        }

        // 3. Delete all messages for this ticket
        const messageDeleteResult = await TicketMessage.deleteMany({ 
          ticketId: ticket._id 
        });
        deletedMessages += messageDeleteResult.deletedCount;

        // 4. Delete the ticket itself
        await SupportTicket.findByIdAndDelete(ticket._id);
        deletedTickets++;

        console.log(`✅ Deleted ticket ${ticket._id} (${ticket.title})`);

      } catch (ticketError) {
        console.error(`❌ Error deleting ticket ${ticket._id}:`, ticketError);
      }
    }

    const summary = {
      success: true,
      deletedTickets,
      deletedMessages,
      deletedFiles,
      processedAt: new Date().toISOString()
    };

    console.log('🎯 Cleanup completed:', summary);

    return NextResponse.json(summary);

  } catch (error) {
    console.error('❌ Cleanup cron job failed:', error);
    return NextResponse.json(
      { 
        error: 'Cleanup failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}

// Also allow POST for manual testing
export async function POST() {
  return GET();
}