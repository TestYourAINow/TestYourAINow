// lib/formatMessage.ts

/**
 * Convertit les URLs et le markdown en HTML cliquable
 */
export function formatMessageContent(text: string): string {
  if (!text) return '';
  
  // 1️⃣ Convertir markdown links: [texte](url) → <a href="url">texte</a>
  text = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="chat-link">$1</a>'
  );
  
  // 2️⃣ Convertir URLs brutes en liens (mais pas celles déjà dans <a>)
  text = text.replace(
    /(?<!href=["'])(?<!src=["'])(https?:\/\/[^\s<]+[^<.,:;"'\]\s])/gi,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="chat-link">$1</a>'
  );
  
  // 3️⃣ Convertir line breaks en <br>
  text = text.replace(/\n/g, '<br>');
  
  return text;
}