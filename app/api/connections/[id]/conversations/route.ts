import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Connection } from '@/models/Connection';
import { Conversation } from '@/models/Conversation'; // 🆕 MONGODB
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// 📊 Type pour une conversation résumée - MODIFIÉ
type ConversationSummary = {
  _id: string;
  conversationId: string;
  userId: string;
  // 🆕 NOUVELLES DONNÉES UTILISATEUR
  userFirstName?: string;
  userLastName?: string;
  userFullName?: string;
  userProfilePic?: string;
  userUsername?: string;
  lastMessage: string;
  lastMessageTime: number;
  messageCount: number;
  isUser: boolean;
  platform: string;
};

// 📊 Type pour un message individuel
type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isFiltered?: boolean;
};

// 🔍 GET - Liste des conversations depuis MongoDB - MODIFIÉ
export async function GET(req: NextRequest, context: any) {
  try {
    const params = await context.params;
    const connectionId = params.id;

    console.log(`🔍 [MONGODB] Fetching conversations for connection: ${connectionId}`);

    // 🔐 Authentification
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // 🔍 Récupérer la connection
    const connection = await Connection.findOne({
      _id: connectionId,
      userId: session.user.id,
    });

    if (!connection) {
      console.log(`❌ [MONGODB] Connection not found: ${connectionId}`);
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    console.log(`✅ [MONGODB] Connection found:`, {
      name: connection.name,
      type: connection.integrationType,
      webhookId: connection.webhookId,
      isActive: connection.isActive
    });

    // 🆕 MODIFICATION - Vérifier support conversations (webhook OU website-widget)
    if (!connection.webhookId && connection.integrationType !== 'website-widget') {
      console.log(`⚠️ [MONGODB] No conversation support for connection type: ${connection.integrationType}`);
      return NextResponse.json({ 
        conversations: [],
        message: 'This connection type does not support conversation history'
      });
    }

    // 🔍 Chercher toutes les conversations pour cette connection dans MongoDB
    const conversations = await Conversation.find({
      connectionId: connectionId,
      isDeleted: false // Exclure les conversations supprimées
    })
    .sort({ lastMessageAt: -1 }) // Plus récent en premier
    .lean(); // Pour performance

    console.log(`📋 [MONGODB] Found ${conversations.length} conversations for connection ${connectionId}`);

    // 📊 Transformer les données pour le frontend - MODIFIÉ
    const conversationSummaries: ConversationSummary[] = conversations.map((conv: any) => {
      // Dernier message (le plus récent)
      const lastMessage = conv.messages && conv.messages.length > 0 
        ? conv.messages[conv.messages.length - 1]
        : null;

      return {
        _id: conv._id.toString(),
        conversationId: conv.conversationId,
        userId: conv.userId,
        
        // 🆕 NOUVELLES DONNÉES UTILISATEUR
        userFirstName: conv.userFirstName,
        userLastName: conv.userLastName,
        userFullName: conv.userFullName,
        userProfilePic: conv.userProfilePic,
        userUsername: conv.userUsername,
        
        lastMessage: lastMessage 
          ? (lastMessage.content.length > 100 
             ? lastMessage.content.substring(0, 100) + '...' 
             : lastMessage.content)
          : 'No messages',
        lastMessageTime: lastMessage ? lastMessage.timestamp : conv.lastMessageAt.getTime(),
        messageCount: conv.messageCount || 0,
        isUser: lastMessage ? lastMessage.role === 'user' : false,
        platform: conv.platform
      };
    });

    console.log(`✅ [MONGODB] Processed ${conversationSummaries.length} conversation summaries with user data`);

    return NextResponse.json({
      success: true,
      conversations: conversationSummaries,
      connectionInfo: {
        name: connection.name,
        type: connection.integrationType,
        webhookId: connection.webhookId
      },
      source: 'mongodb' // 🆕 Pour debug
    });

  } catch (error: any) {
    console.error('❌ [MONGODB] Error fetching conversations:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch conversations',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}

// 📋 POST - Récupérer une conversation complète avec pagination - MODIFIÉ
export async function POST(req: NextRequest, context: any) {
  try {
    const params = await context.params;
    const connectionId = params.id;
    const body = await req.json();
    const { 
      conversationId, 
      page = 1, 
      limit = 50,
      loadMore = false,
      lastTimestamp 
    } = body;

    console.log(`🔍 [MONGODB] Fetching conversation details:`, {
      conversationId,
      page,
      limit,
      loadMore,
      lastTimestamp
    });

    // 🔐 Authentification
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // 🔍 Vérifier que la connection appartient à l'utilisateur
    const connection = await Connection.findOne({
      _id: connectionId,
      userId: session.user.id,
    });

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    // 📊 Récupérer la conversation complète
    const conversation: any = await Conversation.findOne({
      conversationId: conversationId,
      connectionId: connectionId,
      isDeleted: false
    }).lean();

    if (!conversation) {
      console.log(`❌ [MONGODB] Conversation not found: ${conversationId}`);
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    console.log(`✅ [MONGODB] Found conversation with ${conversation.messages?.length || 0} messages for user: ${conversation.userFullName || 'Anonymous'}`);

    // 🔄 Pagination des messages
    let messages = conversation.messages || [];
    
    if (loadMore && lastTimestamp) {
      // Charger plus de messages AVANT le lastTimestamp
      messages = messages
        .filter((msg: ConversationMessage) => msg.timestamp < lastTimestamp)
        .slice(-limit); // Prendre les X derniers avant ce timestamp
    } else {
      // Chargement initial - prendre les derniers messages
      const startIndex = Math.max(0, messages.length - (page * limit));
      messages = messages.slice(startIndex);
    }

    // 📊 Métadonnées pour pagination
    const hasMore = conversation.messages && conversation.messages.length > messages.length;
    const oldestMessageTimestamp = messages.length > 0 ? messages[0].timestamp : null;

    console.log(`📄 [MONGODB] Returning ${messages.length} messages (hasMore: ${hasMore}) for ${conversation.userFullName || 'Anonymous'}`);

    return NextResponse.json({
      success: true,
      conversation: {
        _id: conversation._id.toString(),
        conversationId: conversation.conversationId,
        userId: conversation.userId,
        platform: conversation.platform,
        agentName: conversation.agentName,
        
        // 🆕 NOUVELLES DONNÉES UTILISATEUR
        userFirstName: conversation.userFirstName,
        userLastName: conversation.userLastName,
        userFullName: conversation.userFullName,
        userProfilePic: conversation.userProfilePic,
        userUsername: conversation.userUsername,
        userGender: conversation.userGender,
        userLocale: conversation.userLocale,
        userTimezone: conversation.userTimezone,
        
        messages: messages,
        messageCount: conversation.messageCount || 0,
        totalMessages: conversation.messages?.length || 0,
        firstMessageAt: conversation.firstMessageAt,
        lastMessageAt: conversation.lastMessageAt
      },
      pagination: {
        page,
        limit,
        hasMore,
        oldestMessageTimestamp,
        totalMessages: conversation.messages?.length || 0
      },
      source: 'mongodb'
    });

  } catch (error: any) {
    console.error('❌ [MONGODB] Error fetching conversation details:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch conversation details',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}

// 🗑️ DELETE - HARD DELETE (suppression réelle) - INCHANGÉ
export async function DELETE(req: NextRequest, context: any) {
  try {
    const params = await context.params;
    const connectionId = params.id;
    const body = await req.json();
    const { conversationId } = body;

    console.log(`🗑️ [MONGODB] HARD DELETE Request Details:`);
    console.log(`   - connectionId: ${connectionId}`);
    console.log(`   - conversationId: ${conversationId}`);

    // 🔐 Authentification
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // 🔍 Vérifier que la connection appartient à l'utilisateur
    const connection = await Connection.findOne({
      _id: connectionId,
      userId: session.user.id,
    });

    if (!connection) {
      console.log(`❌ [MONGODB] Connection not found for user: ${session.user.id}`);
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    console.log(`✅ [MONGODB] Connection verified: ${connection.name} (${connection.integrationType})`);

    // 🔍 D'ABORD - Chercher la conversation pour debug
    const conversationBeforeDelete = await Conversation.findOne({
      conversationId: conversationId,
      connectionId: connectionId,
      isDeleted: false
    }).lean();

    if (!conversationBeforeDelete) {
      console.log(`❌ [MONGODB] Conversation NOT FOUND before delete:`);
      console.log(`   - Searching for conversationId: ${conversationId}`);
      console.log(`   - Searching for connectionId: ${connectionId}`);
      console.log(`   - Searching for isDeleted: false`);
      
      // 🔍 DIAGNOSTIC - Chercher toutes les conversations pour ce connectionId
      const allConversationsForConnection = await Conversation.find({
        connectionId: connectionId
      }).lean();
      
      console.log(`🔍 [DIAGNOSTIC] Found ${allConversationsForConnection.length} total conversations for connectionId ${connectionId}:`);
      if (Array.isArray(allConversationsForConnection)) {
        allConversationsForConnection.forEach((conv: any, index: number) => {
          console.log(`   ${index + 1}. conversationId: ${conv.conversationId}, isDeleted: ${conv.isDeleted}`);
        });
      }
      
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const conv = conversationBeforeDelete as any;
    console.log(`✅ [MONGODB] Conversation found before HARD delete:`);
    console.log(`   - _id: ${conv._id}`);
    console.log(`   - conversationId: ${conv.conversationId}`);
    console.log(`   - connectionId: ${conv.connectionId}`);
    console.log(`   - userId: ${conv.userId}`);
    console.log(`   - userFullName: ${conv.userFullName || 'Anonymous'}`);
    console.log(`   - messages count: ${conv.messages?.length || 0}`);

    // 🗑️ HARD DELETE de la conversation (suppression réelle)
    console.log(`🗑️ [MONGODB] Executing HARD DELETE (real deletion)...`);
    
    const deleteResult = await Conversation.deleteOne({
      conversationId: conversationId,
      connectionId: connectionId,
      isDeleted: false
    });

    console.log(`🗑️ [MONGODB] Delete result:`, deleteResult);

    if (deleteResult.deletedCount === 0) {
      console.log(`❌ [MONGODB] No conversation was deleted - deletedCount: 0`);
      
      // 🔍 Double vérification - la conversation existe-t-elle encore ?
      const stillExists = await Conversation.findOne({
        conversationId: conversationId,
        connectionId: connectionId
      }).lean();
      
      if (stillExists) {
        const existsConv = stillExists as any;
        console.log(`⚠️ [MONGODB] Conversation still exists with isDeleted: ${existsConv.isDeleted}`);
      } else {
        console.log(`🤔 [MONGODB] Conversation doesn't exist anymore - might have been deleted already`);
      }
      
      return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
    }

    console.log(`✅ [MONGODB] Conversation HARD DELETED successfully:`);
    console.log(`   - deletedCount: ${deleteResult.deletedCount}`);
    console.log(`   - acknowledged: ${deleteResult.acknowledged}`);

    // 🔍 VÉRIFICATION FINALE - Confirmer suppression totale
    const stillExistsAfterDelete = await Conversation.findOne({
      conversationId: conversationId,
      connectionId: connectionId
    }).lean();

    if (stillExistsAfterDelete) {
      console.log(`⚠️ [MONGODB] WARNING: Conversation still exists after hard delete!`);
    } else {
      console.log(`✅ [MONGODB] CONFIRMED: Conversation completely removed from database`);
    }

    // Compter les conversations restantes
    const remainingConversations = await Conversation.find({
      connectionId: connectionId,
      isDeleted: false
    }).lean();

    console.log(`🔍 [MONGODB] After deletion, ${remainingConversations.length} conversations remain for connectionId ${connectionId}`);

    return NextResponse.json({
      success: true,
      message: 'Conversation permanently deleted',
      conversationId: conversationId,
      deletedCount: deleteResult.deletedCount,
      remainingCount: remainingConversations.length
    });

  } catch (error: any) {
    console.error('❌ [MONGODB] Error deleting conversation:', error);
    console.error('❌ [MONGODB] Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Failed to delete conversation',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}