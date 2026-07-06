import { apiJson } from './client'

export interface Exercise {
  id: string
  name: string
  primary_muscle_group: string
  movement_pattern: string
  equipment: string
}

export interface ExerciseMatch {
  exercise_id: string
  name: string
  score: number
}

export async function listExercises(): Promise<Exercise[]> {
  return apiJson<Exercise[]>('/exercises')
}

export async function searchExercises(q: string): Promise<ExerciseMatch[]> {
  const params = new URLSearchParams({ q })
  const res = await apiJson<{ matches: ExerciseMatch[] }>(
    `/exercises/search?${params.toString()}`,
  )
  return res.matches
}
