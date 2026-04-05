import axios, { type AxiosError } from 'axios'

// Pointe vers le backend FastAPI du repo retranscriptions_mk
const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://backend-production-xxxx.up.railway.app/api/v1'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('a2c_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('a2c_token')
      localStorage.removeItem('a2c_user')
      window.location.href = '/espace-prestataire/login'
    }
    return Promise.reject(error)
  }
)

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = (error as AxiosError<{ detail: string | { msg: string }[] }>).response?.data
    if (!data) return (error as Error).message
    if (typeof data.detail === 'string') return data.detail
    if (Array.isArray(data.detail)) return data.detail.map((d) => d.msg).join(', ')
  }
  if (error instanceof Error) return error.message
  return 'Erreur inconnue'
}
