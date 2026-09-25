import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from "path";
import { SITE } from './src/lib/siteConfig';

// White-label (T2.8): the HTML <title> comes from the same per-tenant config
// the app uses (SITE.pageTitle), injected on serve and on build. The literal
// in index.html is only a placeholder and never ships.
function siteTitle(): Plugin {
  return {
    name: 'site-title',
    transformIndexHtml(html: string) {
      return html.replace(/<title>[\s\S]*?<\/title>/, `<title>${SITE.brand.pageTitle}</title>`);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), siteTitle()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // T2.7: carve the heavy libraries out of the route chunks so they cache
        // independently and only load when a route actually pulls them in
        // (mapbox only comes in with /map, for example).
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('mapbox-gl') || id.includes('@mapbox')) return 'mapbox';
          if (id.includes('@clerk')) return 'clerk';
          if (id.includes('@supabase')) return 'supabase';
          return 'vendor';
        },
      },
    },
  },
});
