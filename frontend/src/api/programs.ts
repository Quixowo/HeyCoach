import { apiJson } from './client'

export interface ProgramExercise {
  id: string
  exercise_id: string
  exercise_name: string
  order_index: number
  target_sets: number | null
  target_reps: number | null
  target_rir: number | null
  target_weight: number | null
}

export interface ProgramSummary {
  id: string
  name: string
  created_at: string
}

export interface ProgramDetail {
  id: string
  name: string
  created_at: string
  exercises: ProgramExercise[]
}

export interface ProgramExerciseInput {
  exercise_id: string
  order_index?: number | null
  target_sets?: number | null
  target_reps?: number | null
  target_rir?: number | null
  target_weight?: number | null
}

export interface CreateProgramPayload {
  name: string
  exercises: ProgramExerciseInput[]
}

export interface UpdateProgramPayload {
  name?: string | null
  exercises: ProgramExerciseInput[]
}

export async function listPrograms(): Promise<ProgramSummary[]> {
  return apiJson<ProgramSummary[]>('/programs')
}

export async function getProgram(id: string): Promise<ProgramDetail> {
  return apiJson<ProgramDetail>(`/programs/${id}`)
}

export async function createProgram(payload: CreateProgramPayload): Promise<ProgramDetail> {
  return apiJson<ProgramDetail>('/programs', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateProgram(
  id: string,
  payload: UpdateProgramPayload,
): Promise<ProgramDetail> {
  return apiJson<ProgramDetail>(`/programs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
