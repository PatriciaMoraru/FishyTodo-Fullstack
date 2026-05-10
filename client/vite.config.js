import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Production asset base path. Set `VITE_BASE_PATH` in `.env.production`.
 * Use `/` for root hosting; use `/your-repo-name/` for a GitHub Pages *project* site.
 */
function normalizeBasePath(raw) {
  if (raw === undefined || raw === null || raw === '') return '/'
  let s = String(raw).trim()
  if (s === '/' || s === '') return '/'
  if (!s.startsWith('/')) s = `/${s}`
  return s.endsWith('/') ? s : `${s}/`
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const productionBase = normalizeBasePath(env.VITE_BASE_PATH)

  return {
    plugins: [react()],
    base: command === 'build' ? productionBase : '/',
  }
})
