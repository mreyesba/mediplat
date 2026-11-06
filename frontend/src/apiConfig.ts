// In dev, this stays empty so `${API_BASE_URL}/api/...` resolves to a relative
// path that Vite's dev proxy (vite.config.ts) forwards to the local backend.
// In production there's no proxy, so the build sets VITE_API_URL to the
// deployed backend's absolute URL.
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

export const POSTHOG_PROJECT_TOKEN = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN ?? "";
export const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST ?? "";
