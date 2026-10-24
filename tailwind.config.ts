import { defineConfig } from '@nuxtjs/tailwindcss/config'

export default defineConfig({
  content: [
    './src/components/**/*.{vue,js,ts}',
    './src/layouts/**/*.vue',
    './src/pages/**/*.vue',
    './src/app.vue'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0A0A0A',
        hover: '#1A1A1A',
        focus: '#1D1D1D',
        border: '#262626',
        text: '#FAFAFA',
        'text-sub': '#B3B3B3'
      },
      fontFamily: {
        sans: ['"JetBrains Mono"', 'monospace']
      }
    }
  },
  plugins: []
})