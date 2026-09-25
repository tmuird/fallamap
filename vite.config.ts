import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
