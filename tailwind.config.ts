import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['"Space Grotesk"', 'sans-serif'] },
      colors: {
        accent: { DEFAULT: '#4f46e5', light: '#eef2ff' },
        ink: '#18181b',
        muted: '#71717a',
        border: '#e4e4e7',
      },
    },
  },
  plugins: [],
} satisfies Config;
