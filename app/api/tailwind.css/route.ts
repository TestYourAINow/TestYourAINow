import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    // 🎯 LIRE TON TAILWIND COMPILÉ DEPUIS .next/static/css/
    const nextDir = path.join(process.cwd(), '.next');
    const staticCssDir = path.join(nextDir, 'static', 'css');
    
    // Trouver le fichier CSS Tailwind compilé
    let tailwindCss = '';
    
    if (fs.existsSync(staticCssDir)) {
      const cssFiles = fs.readdirSync(staticCssDir);
      const appCssFile = cssFiles.find(file => 
        file.startsWith('app-') && file.endsWith('.css')
      );
      
      if (appCssFile) {
        const cssPath = path.join(staticCssDir, appCssFile);
        tailwindCss = fs.readFileSync(cssPath, 'utf8');
      }
    }
    
    // 🎯 FALLBACK : CSS de base avec tes animations custom
    if (!tailwindCss) {
      tailwindCss = `
        /* Tailwind CSS de base + tes animations custom */
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
        
        /* Tes animations custom */
        @keyframes bounceDots {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes slideUpFade {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-bounceDots {
          animation: bounceDots 1.2s infinite ease-in-out both;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        
        .animate-slide-up-fade {
          animation: slideUpFade 0.5s ease-out forwards;
        }
        
        /* Classes Tailwind essentielles pour le widget */
        .flex { display: flex; }
        .items-start { align-items: flex-start; }
        .items-end { align-items: flex-end; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .flex-row { flex-direction: row; }
        .flex-row-reverse { flex-direction: row-reverse; }
        .flex-col { flex-direction: column; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mr-2 { margin-right: 0.5rem; }
        .w-8 { width: 2rem; }
        .h-8 { height: 2rem; }
        .w-2 { width: 0.5rem; }
        .h-2 { height: 0.5rem; }
        .rounded-full { border-radius: 9999px; }
        .self-start { align-self: flex-start; }
        .max-w-sm { max-width: 24rem; }
        .relative { position: relative; }
        .inline-block { display: inline-block; }
      `;
    }
    
    return new NextResponse(tailwindCss, {
      status: 200,
      headers: {
        'Content-Type': 'text/css',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
    
  } catch (error) {
    console.error('Error serving Tailwind CSS:', error);
    return new NextResponse('/* Error loading CSS */', {
      status: 500,
      headers: { 'Content-Type': 'text/css' },
    });
  }
}