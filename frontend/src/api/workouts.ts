import { apiJson } from './client'

export interface WorkoutSession {
  id: string
  program_id: string | null
  date: string
  status: string
  notes: string | null
  created_at: string
}

export interface SetEntry {
  id: string
  session_id: string
  exercise_id: string
  set_number: number
  weight: number
  reps: number
  rir: number | null
  created_at: string
}

export interface HistoryEntry {
  id: string
  session_id: string
  exercise_id: string
  exercise_name: string
  set_number: number
  weight: number
  reps: number
  rir: number | null
  created_at: string
}

export interface StartSessionPayload {
  program_id?: string | null
  notes?: string | null
}

export interface LogSetPayload {
  exercise_id: string
  weight: number
  reps: number
  rir?: number | null
}

export async function listSessions(): Promise<WorkoutSession[]> {
  return apiJson<WorkoutSession[]>('/workouts/sessions')
}

export async function startSession(
  payload: StartSessionPayload = {},
): Promise<WorkoutSession> {
  return apiJson<WorkoutSession>('/workouts/sessions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function finishSession(sessionId: string): Promise<WorkoutSession> {
  return apiJson<WorkoutSession>(`/workouts/sessions/${sessionId}/finish`, {
    method: 'POST',
  })
}

export async function logSet(payload: LogSetPayload): Promise<SetEntry> {
  return apiJson<SetEntry>('/workouts/sets', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getHistory(params?: {
  exercise_id?: string
  start_date?: string
  end_date?: string
}): Promise<HistoryEntry[]> {
  const qs = new URLSearchParams()
  if (params?.exercise_id) qs.set('exercise_id', params.exercise_id)
  if (params?.start_date) qs.set('start_date', params.start_date)
  if (params?.end_date) qs.set('end_date', params.end_date)
  const query = qs.toString()
  return apiJson<HistoryEntry[]>(`/workouts/history${query ? `?${query}` : ''}`)
}
