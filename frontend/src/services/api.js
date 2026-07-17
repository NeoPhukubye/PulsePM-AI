import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' }
})

export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  getHealth: (id) => api.get(`/projects/${id}/health`),
}

export const teamsAPI = {
  getAll: () => api.get('/teams'),
  getById: (id) => api.get(`/teams/${id}`),
  getWorkload: (id) => api.get(`/teams/${id}/workload`),
}

export const standupsAPI = {
  getToday: () => api.get('/standups/today'),
  getHistory: () => api.get('/standups/history'),
  generate: (projectId) => api.post('/standups/generate', null, { params: { project_id: projectId } }),
}

export const reportsAPI = {
  getExecutive: () => api.get('/reports/executive'),
  getSprint: (sprintId) => api.get(`/reports/sprint/${sprintId}`),
  generate: (type) => api.post('/reports/generate', null, { params: { report_type: type } }),
}

export const alertsAPI = {
  getAll: () => api.get('/alerts'),
  getActive: () => api.get('/alerts/active'),
  getByProject: (id) => api.get(`/alerts/project/${id}`),
}

export const aiAPI = {
  chat: (message, projectId) => api.post('/ai/chat', { message, project_id: projectId }),
  getSuggestions: (projectId) => api.get(`/ai/suggestions/${projectId}`),
  predict: (projectId) => api.get(`/ai/predict/${projectId}`),
}

export default api
