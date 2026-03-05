
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          gold: '#C9A961',
          'gold-dark': '#A08748',
        },
        dark: {
          base: '#0F1419',
          card: '#1A1F26',
          border: '#3D3428',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
