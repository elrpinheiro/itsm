import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    // O artifact publicado é um único HTML sem servidor por trás — qualquer imagem/fonte que
    // vire arquivo separado (acima do limite padrão de 4kb) quebra com 404 fora do dev server.
    // Os .docx de termo e .pdf da Base de Conhecimento (na casa das centenas de kB/MB) continuam de
    // fora: embuti-los como base64 infla o bundle à toa — eles já usam window.claude.downloads() a
    // partir da URL do asset.
    assetsInlineLimit: (filePath) => !/\.(docx|pdf)$/i.test(filePath),
    rollupOptions: {
      output: {
        // Sem servidor por trás, um chunk assíncrono separado (recharts, dompurify) também
        // vira um 404 silencioso — tudo precisa cair no único JS que o inline.mjs empacota.
        inlineDynamicImports: true,
      },
    },
  },
})
