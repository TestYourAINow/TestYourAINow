import { Redis } from '@upstash/redis';

// 🚀 Redis Pro Cache - Partagé entre TOUS les serveurs
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 💾 Stocker une réponse IA (expire après 10 minutes)
export async function storeAIResponse(conversationId: string, response: string): Promise<void> {
  try {
    console.log(`🚀 [REDIS] Storing response for ${conversationId}: "${response.substring(0, 100)}..."`);
    
    // Stocker avec expiration de 1 heure (3600 secondes)
    await redis.set(`ai_response:${conversationId}`, response, { ex: 3600 });
    
    console.log(`✅ [REDIS] Response stored successfully for ${conversationId}`);
  } catch (error) {
    console.error(`❌ [REDIS] Error storing response for ${conversationId}:`, error);
    // Fallback silencieux - le système continue même si Redis échoue
  }
}

// 🔍 Récupérer une réponse IA
export async function getAIResponse(conversationId: string): Promise<string | null> {
  try {
    console.log(`🔍 [REDIS] Fetching response for ${conversationId}`);
    
    const response = await redis.get(`ai_response:${conversationId}`);
    
    if (response) {
      console.log(`✅ [REDIS] Response found for ${conversationId}: "${String(response).substring(0, 100)}..."`);
      
      // Supprimer après récupération (one-time use)
      await redis.del(`ai_response:${conversationId}`);
      console.log(`🗑️ [REDIS] Response deleted for ${conversationId}`);
      
      return String(response);
    } else {
      console.log(`⏳ [REDIS] No response found for ${conversationId}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ [REDIS] Error fetching response for ${conversationId}:`, error);
    return null;
  }
}

// 📋 Lister toutes les réponses en attente (pour debug)
export async function listPendingAIResponses(): Promise<string[]> {
  try {
    const keys = await redis.keys('ai_response:*');
    
    // ✅ FIX: Vérifier si c'est un array
    if (!keys || !Array.isArray(keys)) {
      console.log(`📋 [REDIS] No pending responses or invalid format`);
      return [];
    }
    
    console.log(`📋 [REDIS] Found ${keys.length} pending responses`);
    return keys.map(key => String(key).replace('ai_response:', ''));
  } catch (error) {
    console.error(`❌ [REDIS] Error listing responses:`, error);
    return [];
  }
}

// 🚀 Stocker l'historique des conversations (pour mémoire future)
export async function storeConversationHistory(conversationId: string, message: { role: string; content: string; timestamp: number }): Promise<void> {
  try {
    console.log(`💬 [REDIS] Adding message to conversation ${conversationId}`);
    
    // Ajouter le message à la liste (expire après 1 heure)
    const messageString = JSON.stringify(message);
    await redis.lpush(`conversation:${conversationId}`, messageString);
    await redis.expire(`conversation:${conversationId}`, 3600); // 1 heure
    
    // Garder seulement les 20 derniers messages (éviter spam)
    await redis.ltrim(`conversation:${conversationId}`, 0, 19);
    
    console.log(`✅ [REDIS] Message added to conversation ${conversationId}`);
  } catch (error) {
    console.error(`❌ [REDIS] Error storing conversation history for ${conversationId}:`, error);
  }
}

// 📚 Récupérer l'historique des conversations
export async function getConversationHistory(conversationId: string): Promise<{ role: string; content: string; timestamp: number }[]> {
  try {
    console.log(`📚 [REDIS] Fetching conversation history for ${conversationId}`);
    
    const messages = await redis.lrange(`conversation:${conversationId}`, 0, -1);
    console.log(`🔍 [REDIS] Raw messages from Redis:`, messages);
    
    // ✅ FIX: Vérifier si c'est bien un array
    if (!messages || !Array.isArray(messages)) {
      console.log(`⚠️ [REDIS] No messages or invalid format for ${conversationId}`);
      return [];
    }
    
    // ✅ FIX: Vérifier si le array est vide
    if (messages.length === 0) {
      console.log(`📭 [REDIS] No messages found for ${conversationId}`);
      return [];
    }
    
    // 🔧 Parser les messages
    const parsedMessages = messages.map((msg, index) => {
      // Si c'est déjà un objet, pas besoin de parser
      if (typeof msg === 'object' && msg !== null) {
        console.log(`📝 [REDIS] Message ${index} already parsed:`, msg);
        return msg as { role: string; content: string; timestamp: number };
      }
      
      // Si c'est une string, alors parser
      try {
        const parsed = JSON.parse(String(msg));
        console.log(`📝 [REDIS] Parsed message ${index}:`, parsed);
        return parsed;
      } catch (parseError) {
        console.error(`❌ [REDIS] Parse error for message ${index}:`, parseError, 'Raw:', msg);
        return null;
      }
    }).filter(Boolean).reverse(); // Inverse pour avoir chronologique
    
    console.log(`✅ [REDIS] Final parsed messages (${parsedMessages.length}):`, parsedMessages);
    return parsedMessages as { role: string; content: string; timestamp: number }[];
  } catch (error) {
    console.error(`❌ [REDIS] Error fetching conversation history for ${conversationId}:`, error);
    return [];
  }
}

// 🧹 Nettoyer une conversation complète
export async function clearConversation(conversationId: string): Promise<void> {
  try {
    await redis.del(`ai_response:${conversationId}`);
    await redis.del(`conversation:${conversationId}`);
    console.log(`🧹 [REDIS] Conversation ${conversationId} cleared`);
  } catch (error) {
    console.error(`❌ [REDIS] Error clearing conversation ${conversationId}:`, error);
  }
}

// 🔥 Test de connexion Redis
export async function testRedisConnection(): Promise<boolean> {
  try {
    await redis.ping();
    console.log('✅ [REDIS] Connection successful');
    return true;
  } catch (error) {
    console.error('❌ [REDIS] Connection failed:', error);
    return false;
  }
}