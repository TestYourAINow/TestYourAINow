// lib/responseCache.ts
// 📝 Cache partagé pour les réponses en attente entre les routes

export const pendingResponses = new Map<string, string>();

export function storeResponse(conversationId: string, response: string) {
  pendingResponses.set(conversationId, response);
  console.log(`💾 Stored response for ${conversationId}: "${response.substring(0, 100)}..."`);
  
  // Auto-cleanup après 10 minutes
  setTimeout(() => {
    pendingResponses.delete(conversationId);
    console.log(`🧹 Cleaned up response for ${conversationId}`);
  }, 10 * 60 * 1000);
}

export function getResponse(conversationId: string): string | undefined {
  const response = pendingResponses.get(conversationId);
  if (response) {
    pendingResponses.delete(conversationId); // Nettoyer après récupération
  }
  return response;
}

export function listPendingResponses(): string[] {
  return Array.from(pendingResponses.keys());
}