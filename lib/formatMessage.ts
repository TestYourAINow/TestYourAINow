// lib/formatMessage.ts

/**
 * Convertit les URLs et le markdown en HTML cliquable
 * Version compatible tous navigateurs (sans lookbehind)
 */
export function formatMessageContent(text: string): string {
  if (!text) return '';
  
  // 1️⃣ Convertir markdown links: [texte](url) → <a href="url">texte</a>
  text = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="chat-link">$1</a>'
  );
  
  // 2️⃣ Convertir URLs brutes en liens (version simple et compatible)
  // On split par les balises HTML existantes pour ne pas toucher aux liens déjà créés
  const parts = text.split(/(<a[^>]*>.*?<\/a>)/g);
  
  text = parts.map((part, index) => {
    // Si c'est un lien HTML déjà créé, on ne touche pas
    if (part.startsWith('<a')) {
      return part;
    }
    
    // Sinon, on convertit les URLs brutes
    return part.replace(
      /(https?:\/\/[^\s<]+[^<.,:;"'\]\s])/gi,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="chat-link">$1</a>'
    );
  }).join('');
  
  // 3️⃣ Convertir line breaks en <br>
  text = text.replace(/\n/g, '<br>');
  
  return text;
}