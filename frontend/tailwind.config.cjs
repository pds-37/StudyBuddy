/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#070B14",
        "background-secondary": "#0A0F1A",
        surface: "rgba(15, 23, 42, 0.72)",
        "surface-hover": "rgba(30, 41, 59, 0.72)",
        border: "rgba(255, 255, 255, 0.05)",
        "border-strong": "rgba(255, 255, 255, 0.1)",
        brand: "#7C3AED",
        "brand-light": "#8B5CF6",
        cyan: "#06B6D4",
        success: "#22C55E",
        warning: "#F59E0B",
        "text-primary": "#F8FAFC",
        "text-secondary": "rgba(248, 250, 252, 0.7)",
        "text-muted": "rgba(248, 250, 252, 0.4)",
      },
      fontFamily: {
        sans: ["Satoshi", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Satoshi", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(124,58,237,0.2), 0 0 40px rgba(124,58,237,0.12)",
        "glow-hover": "0 0 0 1px rgba(124,58,237,0.4), 0 0 50px rgba(124,58,237,0.24)",
        glass: "0 4px 30px rgba(0, 0, 0, 0.1)",
      },
      animation: {
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 0.2, transform: 'scale(1)' },
          '50%': { opacity: 0.4, transform: 'scale(1.1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    }
  },
  plugins: []
};
