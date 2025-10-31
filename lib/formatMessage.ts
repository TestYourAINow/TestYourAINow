// lib/formatMessage.ts

/**
 * Convertit les URLs et le markdown en HTML cliquable
 * Version robuste sans regex complexes
 */
export function formatMessageContent(text: string): string {
  if (!text) return '';
  
  // 1️⃣ Convertir markdown links: [texte](url) → <a href="url">texte</a>
  // Construction dynamique de la regex pour éviter les problèmes d'échappement
  const markdownLinkRegex = new RegExp('\\[([^\\]]+)\\]\\(([^)]+)\\)', 'g');
  text = text.replace(
    markdownLinkRegex,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="chat-link">$1</a>'
  );
  
  // 2️⃣ Convertir URLs brutes en liens (version simplifiée)
  // Split par les balises <a> existantes pour ne pas re-transformer
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
  
  // 3️⃣ Convertir line breaks en <br>
  text = text.replace(/\n/g, '<br>');
  
  return text;
}