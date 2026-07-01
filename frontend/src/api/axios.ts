// Re-export the configured api wrapper as default for files that do: import api from './axios'
// Those files use: api.get('/path').then(r => r.data) — the api wrapper returns ApiResponse directly
export { api as default, api, apiClient } from './client';
