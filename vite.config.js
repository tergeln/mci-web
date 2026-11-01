import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { seoPlugin } from './scripts/seo.mjs';

export default defineConfig({
  plugins: [react(), seoPlugin()],
  // Polling detects edits made through the local workspace bridge as well as editors.
  server: { watch: { usePolling: true, interval: 500 } },
});
