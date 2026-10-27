import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// Components are written against the React API. Preact's compat layer
// (react / react-dom aliases, set by the preset) keeps the bundle near 10 KB
// instead of ~45 KB, which matters on mobile. To use real React, install
// react + react-dom and remove the preset.
export default defineConfig({
  plugins: [preact()],
  build: {
    outDir: '../assets/widgets',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: 'src/main.jsx',
      output: { entryFileNames: 'widgets.js', assetFileNames: 'widgets.[ext]', format: 'iife', inlineDynamicImports: true },
    },
  },
});
