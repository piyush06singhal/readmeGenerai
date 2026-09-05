import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { createServer } from './server/index.js'

function apiPlugin(): Plugin {
  return {
    name: 'api-routes',
    configureServer(server) {
      // Expose env vars from a local .env file to the server middleware so
      // server/ai.ts can read GROQ_API_KEY during development without the
      // key ever being bundled into the client.
      const env = loadEnv(server.config.mode, process.cwd(), '')
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined) process.env[key] = value
      }
      server.middlewares.use('/api', createServer())
    },
  }
}

export default defineConfig({
  plugins: [tailwindcss(), react(), apiPlugin()],
  server: {
    port: 3000,
  },
})
