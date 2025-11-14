// lib/formatMessage.ts

/**
 * Convertit les URLs et le markdown en HTML cliquable
 * Version avec support du formatage markdown (gras, italique, etc.)
 */
export function formatMessageContent(text: string): string {
  if (!text) return '';
  
  // 1️⃣ Convertir markdown links: [texte](url) → <a href="url">texte</a>
  const markdownLinkRegex = new RegExp('\\[([^\\]]+)\\]\\(([^)]+)\\)', 'g');
  text = text.replace(
    markdownLinkRegex,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="chat-link">$1</a>'
  );
  
  // 2️⃣ Convertir le gras: **texte** → <strong>texte</strong>
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // 3️⃣ Convertir l'italique: *texte* ou _texte_ → <em>texte</em>
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  text = text.replace(/_(.+?)_/g, '<em>$1</em>');
  
  // 4️⃣ Convertir le code inline: `code` → <code>code</code>
  text = text.replace(/`(.+?)`/g, '<code style="background: rgba(0,0,0,0.1); padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>');
  
  // 5️⃣ Convertir URLs brutes en liens (version simplifiée)
  const parts = text.split(/(<a[^>]*>.*?<\/a>)/g);
  
  text = parts.map(part => {
    // Si c'est déjà un lien HTML, on ne touche pas
    if (part.startsWith('<a')) {
      return part;
    }
    
    // Sinon, transformer les URLs
    return part.replace(
      /(https?:\/\/[^\s<>"']+)/gi,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="chat-link">$1</a>'
    );
  }).join('');
  
  // 6️⃣ Convertir line breaks en <br>
  text = text.replace(/\n/g, '<br>');
  
  return text;
}