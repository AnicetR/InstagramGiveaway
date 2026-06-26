// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/'
  },

  css: [
    '~/assets/css/tailwind.css'
  ],

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/google-fonts',
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],

  googleFonts: {
    families: {
      'Space+Grotesk': [400, 500, 700],
      'Outfit': [400, 600, 800]
    },
    display: 'swap'
  }
})