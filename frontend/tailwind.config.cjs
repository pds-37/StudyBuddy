/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "var(--bg-obsidian)",
        ink: "var(--bg-ink)",
        panel: "var(--bg-panel)",
        card: "var(--bg-card)",
        line: "var(--border-main)",
        brand: "var(--brand)",
        cyan: "var(--cyan)",
        sun: "#f6c453"
      },
      fontFamily: {
        sans: ["Satoshi", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Satoshi", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      boxShadow: {
        glow: "0 28px 120px rgba(202, 138, 247, 0.2), 0 10px 30px rgba(40, 176, 243, 0.08)"
      },
      animation: {
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 0.2, transform: 'scale(1)' },
          '50%': { opacity: 0.4, transform: 'scale(1.1)' },
        }
      }
    }
  },
  plugins: []
};
