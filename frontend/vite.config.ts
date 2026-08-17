// Import defineConfig from 'vitest/config' instead of 'vite' to support the test block
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import babel from '@rolldown/plugin-babel'
import { playwright } from '@vitest/browser-playwright'
import reactCompiler from 'babel-plugin-react-compiler'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({
        plugins: [
            [reactCompiler, {target: '19'}] // React 19
        ]
     })
  ],
  server: {
    proxy: {
        '/api': {
            target: 'http://localhost:8000',
            changeOrigin: true,
            secure: false,
            ws: true,
        }
    }
  },
  test: {
    browser: {
        enabled: true,          // Activates Browser Mode globally
        provider: playwright(), // Binds Playwright as the execution engine
        instances: [
            { browser: 'chromium'}
        ],
        headless: true,      // Uncomment to hide the browser window during runs
    },
    alias: {
        '@testing-library/react': 'vitest-browser-react',
    }
  }
})
