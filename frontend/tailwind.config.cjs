/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#030712", // Rich dark slate-950
        "background-secondary": "#0f172a", // Slate-900
        surface: "rgba(15, 23, 42, 0.6)",
        "surface-hover": "rgba(30, 41, 59, 0.8)",
        border: "rgba(255, 255, 255, 0.08)",
        "border-strong": "rgba(255, 255, 255, 0.15)",
        brand: "#6366f1", // Indigo 500
        "brand-light": "#818cf8", // Indigo 400
        "brand-dark": "#4f46e5", // Indigo 600
        accent: "#8b5cf6", // Violet 500
        "accent-light": "#a78bfa", // Violet 400
        cyan: "#06B6D4",
        success: "#10b981", // Emerald 500
        warning: "#f59e0b",
        "text-primary": "#ffffff", // Pure white for better visibility
        "text-secondary": "#cbd5e1", // Slate 300
        "text-muted": "#94a3b8", // Slate 400
      },
      fontFamily: {
        sans: ["Inter", "Satoshi", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Outfit", "Inter", "Satoshi", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(99, 102, 241, 0.15), 0 0 20px rgba(99, 102, 241, 0.1)",
        "glow-hover": "0 0 0 1px rgba(99, 102, 241, 0.3), 0 0 30px rgba(99, 102, 241, 0.2)",
        "glass-panel": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        premium: "0 10px 40px -10px rgba(0,0,0,0.5)",
      },
      animation: {
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
          '50%': { opacity: 0.6, transform: 'scale(1.05)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        }
      }
    }
  },
  plugins: []
};
