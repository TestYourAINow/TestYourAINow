/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ===== TES ANIMATIONS EXISTANTES (PRÉSERVÉES) =====
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideUpFade: {
          "0%": {
            opacity: 0,
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: 1,
            transform: "translateY(0)",
          },
        },
        // ===== NOUVELLES ANIMATIONS RESPONSIVES =====
        scaleIn: {
          "0%": { 
            opacity: 0, 
            transform: "scale(0.95)" 
          },
          "100%": { 
            opacity: 1, 
            transform: "scale(1)" 
          },
        },
        slideInRight: {
          "0%": { 
            opacity: 0, 
            transform: "translateX(20px)" 
          },
          "100%": { 
            opacity: 1, 
            transform: "translateX(0)" 
          },
        },
      },
      animation: {
        // TES ANIMATIONS EXISTANTES (PRÉSERVÉES)
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-up-fade": "slideUpFade 0.5s ease-out forwards",
        // NOUVELLES ANIMATIONS RESPONSIVES
        "scale-in": "scaleIn 0.3s ease-out forwards",
        "slide-in-right": "slideInRight 0.3s ease-out forwards",
      },
      
      // ===== BREAKPOINTS RESPONSIVES (NOUVEAUX) =====
      screens: {
        'xs': '320px',    // Très petits téléphones
        'sm': '480px',    // Petits téléphones (DIFFÉRENT du Tailwind par défaut)
        'md': '768px',    // Tablettes (IDENTIQUE - pas de conflit)
        'lg': '1024px',   // Laptops (IDENTIQUE - pas de conflit)
        'xl': '1280px',   // Desktops (IDENTIQUE - pas de conflit)
        '2xl': '1536px',  // Large desktops (IDENTIQUE - pas de conflit)
        '3xl': '1920px',  // Ultra-wide (NOUVEAU)
        
        // Breakpoints spéciaux (NOUVEAUX)
        'mobile-only': {'max': '767px'},
        'tablet-only': {'min': '768px', 'max': '1023px'},
        'desktop-only': {'min': '1024px'},
      },
      
      // ===== ESPACEMENTS RESPONSIVES (NOUVEAUX) =====
      spacing: {
        'mobile': '1rem',      // 16px pour mobile
        'tablet': '1.5rem',    // 24px pour tablet
        'desktop': '2rem',     // 32px pour desktop
        'wide': '3rem',        // 48px pour large screens
      },
      
      // ===== COULEURS ÉTENDUES (COMPATIBLES AVEC TON THÈME) =====
      colors: {
        // Amélioration de tes gris existants
        gray: {
          925: '#0f0f0f',  // Entre 900 et 950
          875: '#1a1a1a',  // Entre 800 et 900
          825: '#212121',  // Entre 800 et 900
          775: '#2a2a2a',  // Entre 700 et 800
        },
      },
    },
  },
  
  // ===== PLUGINS CHIRURGICAUX (AJOUTS SEULEMENT) =====
  plugins: [
    // Plugin pour les classes responsive automatiques
    function({ addUtilities, theme }) {
      const responsiveUtilities = {
        // ===== CLASSES RESPONSIVES AUTOMATIQUES =====
        
        // Container responsive (améliore ton layout existant)
        '.container-responsive': {
          width: '100%',
          paddingLeft: theme('spacing.4'),
          paddingRight: theme('spacing.4'),
          marginLeft: 'auto',
          marginRight: 'auto',
          '@screen sm': {
            paddingLeft: theme('spacing.6'),
            paddingRight: theme('spacing.6'),
            maxWidth: '640px',
          },
          '@screen md': {
            paddingLeft: theme('spacing.8'),
            paddingRight: theme('spacing.8'),
            maxWidth: '768px',
          },
          '@screen lg': {
            maxWidth: '1024px',
          },
          '@screen xl': {
            maxWidth: '1280px',
          },
        },
        
        // Grid responsive automatique
        '.grid-auto-responsive': {
          display: 'grid',
          gap: theme('spacing.4'),
          gridTemplateColumns: 'repeat(1, 1fr)',
          '@screen sm': {
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: theme('spacing.6'),
          },
          '@screen lg': {
            gridTemplateColumns: 'repeat(3, 1fr)',
          },
          '@screen xl': {
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: theme('spacing.8'),
          },
        },
        
        // Flex responsive (améliore tes layouts flex existants)
        '.flex-responsive': {
          display: 'flex',
          flexDirection: 'column',
          gap: theme('spacing.4'),
          '@screen md': {
            flexDirection: 'row',
            gap: theme('spacing.6'),
          },
        },
        
        // Card responsive (pour tes SectionCard)
        '.card-responsive': {
          backgroundColor: 'rgba(31, 41, 55, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(55, 65, 81, 0.5)',
          borderRadius: theme('borderRadius.lg'),
          padding: theme('spacing.4'),
          '@screen sm': {
            borderRadius: theme('borderRadius.xl'),
            padding: theme('spacing.6'),
          },
          '@screen lg': {
            borderRadius: theme('borderRadius.2xl'),
            padding: theme('spacing.8'),
          },
        },
        
        // Text responsive
        '.text-responsive': {
          fontSize: theme('fontSize.sm'),
          lineHeight: theme('lineHeight.5'),
          '@screen sm': {
            fontSize: theme('fontSize.base'),
            lineHeight: theme('lineHeight.6'),
          },
          '@screen lg': {
            fontSize: theme('fontSize.lg'),
            lineHeight: theme('lineHeight.7'),
          },
        },
        
        // Heading responsive
        '.heading-responsive': {
          fontSize: theme('fontSize.lg'),
          lineHeight: theme('lineHeight.7'),
          fontWeight: theme('fontWeight.bold'),
          '@screen sm': {
            fontSize: theme('fontSize.xl'),
            lineHeight: theme('lineHeight.8'),
          },
          '@screen lg': {
            fontSize: theme('fontSize.2xl'),
            lineHeight: theme('lineHeight.9'),
          },
        },
        
        // Button responsive
        '.btn-responsive': {
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          fontSize: theme('fontSize.sm'),
          fontWeight: theme('fontWeight.medium'),
          borderRadius: theme('borderRadius.lg'),
          transition: 'all 0.2s ease-in-out',
          minHeight: '44px',  // Touch-friendly sur mobile
          '@screen sm': {
            padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
            fontSize: theme('fontSize.base'),
            minHeight: 'auto',
          },
        },
        
        // Sidebar responsive (pour ton layout existant)
        '.sidebar-responsive': {
          '@screen mobile-only': {
            position: 'fixed',
            top: '0',
            left: '0',
            bottom: '0',
            width: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            transform: 'translateX(-100%)',
            transition: 'transform 0.3s ease-in-out',
            zIndex: '50',
          },
          '@screen md': {
            position: 'relative',
            width: 'auto',
            backgroundColor: 'transparent',
            transform: 'translateX(0)',
            zIndex: 'auto',
          },
        },
        
        '.sidebar-responsive.open': {
          '@screen mobile-only': {
            transform: 'translateX(0)',
          },
        },
        
        // Modal responsive
        '.modal-responsive': {
          '@screen mobile-only': {
            position: 'fixed',
            bottom: '0',
            left: '0',
            right: '0',
            borderRadius: `${theme('borderRadius.xl')} ${theme('borderRadius.xl')} 0 0`,
            maxHeight: '90vh',
          },
          '@screen md': {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            borderRadius: theme('borderRadius.xl'),
            maxHeight: '80vh',
            width: '90%',
            maxWidth: '500px',
          },
        },
        
        // Navigation responsive
        '.mobile-nav': {
          display: 'block',
          '@screen md': {
            display: 'none',
          },
        },
        
        '.desktop-nav': {
          display: 'none',
          '@screen md': {
            display: 'block',
          },
        },
      };
      
      addUtilities(responsiveUtilities);
    },
    
    // Plugin pour les variants personnalisés
    function({ addVariant }) {
      // Touch devices
      addVariant('touch', '@media (hover: none) and (pointer: coarse)');
      addVariant('no-touch', '@media (hover: hover) and (pointer: fine)');
      
      // Retina displays
      addVariant('retina', '@media (-webkit-min-device-pixel-ratio: 2)');
      
      // Reduced motion (accessibilité)
      addVariant('motion-safe', '@media (prefers-reduced-motion: no-preference)');
      addVariant('motion-reduce', '@media (prefers-reduced-motion: reduce)');
    },
  ],
};