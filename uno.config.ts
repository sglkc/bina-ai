import { defineConfig, presetIcons, presetWind4 } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4(),
    presetIcons({
      collections: {
        mdi: () => import('@iconify-json/mdi/icons.json').then(i => i.default),
      },
      warn: true,
    }),
  ],
  theme: {
    fontFamily: {
      "open-sauce": '"Open Sauce One", sans-serif',
    },
  },
  variants: [
    (matcher) => {
      if (!matcher.startsWith('on:')) return matcher
      return {
        matcher: matcher.slice(3),
        selector: s => `${s}:hover, ${s}:focus`,
      }
    },
  ],
})
