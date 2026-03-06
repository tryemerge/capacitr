/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/auth/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
        heading: ["Gridnik", "Space Grotesk", "Arial", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      },
      colors: {
        /* ── Capacitr Brand Palette ──────────────────────────────
         * LIGHT CANVAS THEME
         * Override zinc (neutral) with warm beige/canvas tones
         * rooted in Secondary Tan #D9D0C0.
         * Override indigo (accent) with Primary Green #0F5331.
         * Brand Orange + Green = primary accents
         * Brand Blue + Yellow = reserved alternative accents
         * ─────────────────────────────────────────────────────── */
        zinc: {
          50:  "#FDFCFA",  // page background — warm white
          100: "#F5F0E8",  // card backgrounds — light canvas
          200: "#E8E0D4",  // borders, dividers
          300: "#D9D0C0",  // ← Brand: Secondary Tan
          400: "#B8A990",  // muted labels
          500: "#8C7A64",  // secondary text
          600: "#6B5D4D",  // body text
          700: "#4A3F34",  // strong text
          800: "#33291E",  // headings
          900: "#1E1710",  // near-black text
          950: "#0F0B07",  // true dark
        },
        indigo: {
          50:  "#edfcf2",
          100: "#d4f5e0",
          200: "#a8ebc2",
          300: "#4ade80",
          400: "#22c55e",
          500: "#16a34a",  // hover state
          600: "#0F5331",  // ← Brand: Primary Green (primary buttons)
          700: "#0c4428",
          800: "#0a3520",
          900: "#082d1a",
          950: "#041a0e",
        },
        brand: {
          orange:  "#FA5302",  // primary accent
          yellow:  "#CBFF02",  // alt accent (callouts)
          green:   "#0F5331",  // primary accent
          dark:    "#021822",  // alt accent (reserved)
          grey:    "#F1F9FF",  // alt light
          tan:     "#D9D0C0",  // canvas base
          canvas:  "#F5F0E8",  // card bg
          cream:   "#FDFCFA",  // page bg
        },
      },
    },
  },
  plugins: [],
};
