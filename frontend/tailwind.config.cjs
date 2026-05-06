/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#030507",
        ink: "#0a0c10",
        panel: "#09090b",
        card: "#09090b",
        line: "#18181b",
        brand: "#ca8af7",
        cyan: "#28b0f3",
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
