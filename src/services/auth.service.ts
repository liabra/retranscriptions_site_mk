import { apiClient } from './api'

export interface User {
  id: string
  email: string
  nom: string
  role: 'retranscripteur' | 'correcteur' | 'administratrice' | 'coordinatrice' | 'comptabilite' | 'lecture_seule'
  actif: boolean
}

export interface LoginResponse {
  access_token: string
  user: User
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)
    const res = await apiClient.post<LoginResponse>('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    localStorage.setItem('a2c_token', res.data.access_token)
    localStorage.setItem('a2c_user', JSON.stringify(res.data.user))
    return res.data
  },

  logout() {
    localStorage.removeItem('a2c_token')
    localStorage.removeItem('a2c_user')
  },

  getUser(): User | null {
    try {
      const raw = localStorage.getItem('a2c_user')
      return raw ? (JSON.parse(raw) as User) : null
    } catch {
      return null
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('a2c_token')
  },
}
