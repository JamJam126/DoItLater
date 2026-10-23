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
        text: '#FAFAFA'
      },
      fontFamily: {
        sans: ['"JetBrains Mono"', 'monospace']
      }
    }
  },
  plugins: []
})