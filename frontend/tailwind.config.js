/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#18B8FF',   // Neon Blue
          secondary: '#4F7CFF', // Darker Blue/Indigo
          accent: '#00E5FF',    // Cyan accent
          bg: '#07101F',        // Dark background
          card: '#111B2F',      // Card Background
        },
        border: 'rgba(255, 255, 255, 0.08)',
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 15px rgba(24, 184, 255, 0.35)',
        'glow-accent': '0 0 15px rgba(0, 229, 255, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        'glass': '16px',
      }
    },
  },
  plugins: [],
}
