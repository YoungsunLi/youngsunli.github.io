import type { Theme } from 'vitepress'
import { createConciseTheme } from 'vitepress-theme-concise'
import { data as posts } from './posts.data.mjs'
import PinoutViewer from './components/PinoutViewer.vue'

export default {
  extends: createConciseTheme({ posts }),
  enhanceApp({ app }) {
    app.component('PinoutViewer', PinoutViewer)
  }
} satisfies Theme
