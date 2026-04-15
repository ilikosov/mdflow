const BASE_URL = '/api/v1';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export const kanbanApi = {
  get: () => fetchApi<{ tasks: any[]; config: any }>('/kanban'),
  put: (data: { tasks: any[]; config: any }) =>
    fetchApi('/kanban', { method: 'PUT', body: JSON.stringify(data) }),
};

export const archiveApi = {
  get: () => fetchApi<any[]>('/archive'),
  put: (tasks: any[]) => fetchApi('/archive', { method: 'PUT', body: JSON.stringify(tasks) }),
};
