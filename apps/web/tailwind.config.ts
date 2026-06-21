import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        rice:    "#F5F0E1",
        paper:   "#EDE4D0",
        sand:    "#D4C5A0",
        wood:    "#5C4B3A",
        ink:     "#2C2C2C",
        cinnabar:"#A93226"
      },
      fontFamily: {
        song: ['"Noto Serif SC"', '"Source Han Serif"', "serif"],
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"]
      },
      backgroundImage: {
        "rice-paper": "url('/textures/rice-paper.png')"
      }
    }
  },
  plugins: []
} satisfies Config;
