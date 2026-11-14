import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 👈 Yeh import hona chahiye

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 👈 Yeh plugin yahan add hona zaroori hai
  ],
})