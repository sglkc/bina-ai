import { preact } from '@preact/preset-vite'
import { defineConfig } from 'wxt'

export default defineConfig({
  manifest: {
    name: 'BINA: Blind-friendly Intelligent Navigation Assistant',
    description: 'AI-based web assistive technology for the visually impaired',
    short_name: 'BINA AI',
    permissions: ['activeTab', 'offscreen', 'scripting'],
    host_permissions: ['<all_urls>'],
    web_accessible_resources: [
      {
        matches: ['<all_urls>'],
        resources: [
          '/audio/*'
        ]
      }
    ],
    commands: {
      'open-popup': {
        suggested_key: {
          default: 'Ctrl+Shift+1'
        },
        description: 'Open popup and enable speech recognition',
      },
    },
    default_locale: 'en'
  },
  modules: ['@wxt-dev/unocss', '@wxt-dev/i18n/module'],
  vite: () => ({
    plugins: [
      preact(),
    ],
  })
})
