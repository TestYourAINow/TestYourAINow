import mammoth from "mammoth";
import { parse as parseCSV } from "csv-parse/sync";
import { convert } from "html-to-text";
import fs from "fs";
import path from "path";
import os from "os";
import pdf from "pdf-parse";

export async function extractTextFromBuffer(fileName: string, buffer: Buffer): Promise<string> {
  const lower = fileName.toLowerCase();

  try {
    // PDF
    if (lower.endsWith(".pdf")) {
      try {
        const data = await pdf(buffer);
        // Vérifier si le PDF a vraiment du texte
        if (!data.text || data.text.trim().length === 0) {
          return "EXTRACTION_WARNING: PDF uploadé mais aucun texte trouvé. Il s'agit probablement d'un PDF scanné ou d'images.";
        }
        return data.text;
      } catch (directError) {
        try {
          const tempDir = path.join(os.tmpdir(), "testmyai-temp");
          
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }

          const tempFilePath = path.join(tempDir, `temp-${Date.now()}.pdf`);
          fs.writeFileSync(tempFilePath, buffer);

          try {
            const data = await pdf(fs.readFileSync(tempFilePath));
            if (!data.text || data.text.trim().length === 0) {
              return "EXTRACTION_WARNING: PDF uploadé mais aucun texte trouvé. Il s'agit probablement d'un PDF scanné ou d'images.";
            }
            return data.text;
          } finally {
            try {
              if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
              }
            } catch (cleanupError) {
              // Ignore cleanup errors
            }
          }
        } catch (tempError) {
          return "EXTRACTION_ERROR: Impossible d'analyser ce PDF. L'IA ne pourra pas lire son contenu.";
        }
      }
    }

    // TXT / JSON / MD
    if ([".txt", ".md", ".json"].some(ext => lower.endsWith(ext))) {
      const text = buffer.toString("utf-8");
      if (text.trim().length === 0) {
        return "EXTRACTION_WARNING: Fichier vide ou illisible.";
      }
      return text;
    }

    // DOCX
    if (lower.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer });
      if (!result.value || result.value.trim().length === 0) {
        return "EXTRACTION_WARNING: Document Word uploadé mais aucun texte trouvé.";
      }
      return result.value;
    }

    // CSV
    if (lower.endsWith(".csv")) {
      const records = parseCSV(buffer, { columns: false, skip_empty_lines: true });
      if (records.length === 0) {
        return "EXTRACTION_WARNING: Fichier CSV vide.";
      }
      return records.map((row: string[]) => row.join(", ")).join("\n");
    }

    // HTML
    if (lower.endsWith(".html")) {
      const text = convert(buffer.toString("utf-8"), { wordwrap: false });
      if (text.trim().length === 0) {
        return "EXTRACTION_WARNING: Fichier HTML sans contenu textuel.";
      }
      return text;
    }

    return "TYPE_NOT_SUPPORTED: Type de fichier non supporté pour l'extraction de texte.";
  } catch (err) {
    return "EXTRACTION_ERROR: Erreur lors de l'analyse du fichier.";
  }
}