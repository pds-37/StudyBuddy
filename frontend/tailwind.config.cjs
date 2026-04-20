/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#000000",
        panel: "#09090b",
        card: "#09090b",
        line: "#18181b",
        brand: "#7c5cff",
        cyan: "#22d3ee",
        sun: "#f6c453"
      },
      fontFamily: {
        sans: ["Satoshi", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Satoshi", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      boxShadow: {
        glow: "0 28px 120px rgba(124, 92, 255, 0.2), 0 10px 30px rgba(34, 211, 238, 0.08)"
      }
    }
  },
  plugins: []
};
