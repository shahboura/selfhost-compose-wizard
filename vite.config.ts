import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/selfhost-compose-wizard/',
  plugins: [react()],
  assetsInclude: ['**/*.yaml', '**/*.yml'],
})
