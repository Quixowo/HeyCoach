import { apiJson, apiFetch } from './client'

export interface User {
  id: string
  email: string
  display_name: string
  experience_level: string
  primary_goal: string
  injury_notes: string | null
  created_at: string
}

export interface RegisterPayload {
  email: string
  password: string
  display_name: string
  experience_level: 'beginner' | 'intermediate' | 'advanced'
  primary_goal: 'hypertrophy' | 'strength' | 'fat_loss' | 'general'
  injury_notes?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export async function register(payload: RegisterPayload): Promise<User> {
  return apiJson<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function login(payload: LoginPayload): Promise<User> {
  return apiJson<User>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function logout(): Promise<void> {
  await apiFetch('/auth/logout', { method: 'POST' })
}

export async function getMe(): Promise<User | null> {
  const res = await apiFetch('/auth/me')
  if (res.status === 401) return null
  if (!res.ok) return null
  return res.json() as Promise<User>
}
