export const PRODUCTION_BACKEND_URL = 'https://taurenvideobackend.onrender.com'

export function getBackendUrl() {
  return (
    process.env.API_BASE_URL ??
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    PRODUCTION_BACKEND_URL
  ).replace(/\/+$/, '')
}
