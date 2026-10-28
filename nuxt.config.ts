// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  srcDir: 'src/',
  components: true,

  runtimeConfig: {
    telegramBotToken: '',
    telegramChatId: ''
  },

  vite: {
    server: {
      allowedHosts: ['.trycloudflare.com']
    }
  },

  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap'
        }
      ]
    }
  }
})
