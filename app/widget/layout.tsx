// app/widget/layout.tsx
import '../globals.css';

export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style
          // Neutralise le fond sombre global uniquement pour la route /widget/*
          dangerouslySetInnerHTML={{
            __html: `
              html, body { background: transparent !important; }
              body { margin: 0; padding: 0; overflow: visible; }
              main { background: transparent !important; }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
