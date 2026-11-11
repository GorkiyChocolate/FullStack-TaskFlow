import type { Task, TaskInput, TaskStatus } from './types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    })
  } catch {
    throw new Error('Cannot connect to the API. Is the backend running?')
  }
  if (!response.ok) {
    let detail = `Request failed (${response.status})`
    try {
      const body = await response.json()
      if (typeof body.detail === 'string') detail = body.detail
    } catch { /* keep generic error */ }
    throw new Error(detail)
  }
  return response.status === 204 ? (undefined as T) : response.json()
}

export const api = {
  list: () => request<Task[]>('/tasks'),
  create: (data: TaskInput) => request<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<TaskInput> & { status?: TaskStatus }) =>
    request<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: number) => request<void>(`/tasks/${id}`, { method: 'DELETE' }),
}
