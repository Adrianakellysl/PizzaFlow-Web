export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const TOKEN_KEY = 'pizzaflow_token';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
      window.dispatchEvent(new Event('pizzaflow:unauthorized'));
    }

    throw new ApiError(
      data?.erro || data?.error || data?.message || 'Erro ao comunicar com a API.',
      response.status
    );
  }

  return data;
}

export const api = {
  login: (credentials) =>
    request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  listarPedidos: () => request('/pedidos'),

  criarPedido: (pedido) =>
    request('/pedidos', {
      method: 'POST',
      body: JSON.stringify(pedido)
    }),

  editarPedido: (id, pedido) =>
    request(`/pedidos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pedido)
    }),

  avancarStatus: (id, status) =>
    request(`/pedidos/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(status ? { status } : {})
    }),

  cancelarPedido: (id) =>
    request(`/pedidos/${id}`, {
      method: 'DELETE'
    })
};
