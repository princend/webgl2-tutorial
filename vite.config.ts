import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Vite 多頁面設定：首頁作為課程目錄，每一課都有獨立的 HTML 入口
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        lesson01: resolve(__dirname, 'src/lessons/01-triangle/index.html'),
      },
    },
  },
});
