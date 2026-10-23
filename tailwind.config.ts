import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0A0A0A',
        text: '#FAFAFA'
      },
      fontFamily: {
        sans: ['"JetBrains Mono"', 'monospace']
      }
    }
  },
  plugins: []
} satisfies Config