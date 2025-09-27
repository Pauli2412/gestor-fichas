import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    port: 5173, // el que uses en local
    allowedHosts: [
      "gestor-fichas.onrender.com", // 👈 agrega tu dominio de Render
    ],
  },
})
