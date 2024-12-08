import { preact } from '@preact/preset-vite'
import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/unocss'],
  vite: () => ({
    plugins: [
      preact(),
    ]
  })
})
