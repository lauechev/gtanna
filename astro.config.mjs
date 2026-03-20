import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

// https://astro.build/config
export default defineConfig({
  // Update these per project for GitHub Pages deployment
  site: 'https://lauechev.github.io',
  base: '/gtanna/',
  output: 'static',
  integrations: [sitemap()],
})
