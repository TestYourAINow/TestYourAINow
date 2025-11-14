/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
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
        // 🆕 AJOUTE CES 4 ANIMATIONS ICI 👇
        float: {
          '0%, 100%': { 
            transform: 'translate(0, 0) scale(1)',
            opacity: '1',
          },
          '33%': { 
            transform: 'translate(30px, -30px) scale(1.1)',
            opacity: '0.8',
          },
          '66%': { 
            transform: 'translate(-20px, 20px) scale(0.9)',
            opacity: '0.9',
          },
        },
        'float-delayed': {
          '0%, 100%': { 
            transform: 'translate(0, 0) scale(1)',
            opacity: '1',
          },
          '33%': { 
            transform: 'translate(-30px, 30px) scale(0.9)',
            opacity: '0.7',
          },
          '66%': { 
            transform: 'translate(20px, -20px) scale(1.1)',
            opacity: '0.9',
          },
        },
        'float-slow': {
          '0%, 100%': { 
            transform: 'translate(0, 0) scale(1)',
            opacity: '1',
          },
          '50%': { 
            transform: 'translate(15px, 15px) scale(1.05)',
            opacity: '0.8',
          },
        },
        'bounce-gentle': {
          '0%, 100%': { 
            transform: 'translateY(0)',
          },
          '50%': { 
            transform: 'translateY(-10px)',
          },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-up-fade": "slideUpFade 0.5s ease-out forwards",
        // 🆕 AJOUTE CES 4 ANIMATIONS ICI 👇
        'float': 'float 20s ease-in-out infinite',
        'float-delayed': 'float-delayed 25s ease-in-out infinite',
        'float-slow': 'float-slow 30s ease-in-out infinite',
        'bounce-gentle': 'bounce-gentle 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};