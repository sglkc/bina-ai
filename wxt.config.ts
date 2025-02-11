import { preact } from '@preact/preset-vite'
import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  manifest: {
    name: 'Web AID',
    description: 'AI-based Assistive Technology for Web Navigation',
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
    }
  },
  modules: ['@wxt-dev/unocss'],
  vite: () => ({
    plugins: [
      preact(),
    ],
  })
})
