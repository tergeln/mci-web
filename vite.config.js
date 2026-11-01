import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Polling detects edits made through the local workspace bridge as well as editors.
  server: { watch: { usePolling: true, interval: 500 } },
});
