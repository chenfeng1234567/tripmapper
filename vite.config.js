import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Static assets live in `static/` and are copied verbatim into the build.
// The build output goes to `public/`, which is what GitLab Pages serves.
// `base: './'` keeps asset URLs relative so the build works under any subpath.
export default defineConfig({
  plugins: [react()],
  base: './',
  publicDir: 'static',
  build: {
    outDir: 'public',
    emptyOutDir: true,
  },
});
