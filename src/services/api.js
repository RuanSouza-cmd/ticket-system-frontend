// src/services/api.js - CORRIGIDO - BUG DO LOGIN RESOLVIDO

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 segundos timeout
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros - CORRIGIDO
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // CORREÇÃO PRINCIPAL: Não redireciona se for erro de login (401 na rota /auth/login)
    const isLoginRoute = error.config?.url?.includes('/auth/login');
    
    if (error.response?.status === 401 && !isLoginRoute) {
      // Apenas redireciona se NÃO for a rota de login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Dispara evento customizado para o App.jsx tratar
      window.dispatchEvent(new CustomEvent('auth:expired', { 
        detail: { message: 'Sessão expirada. Faça login novamente.' }
      }));
    }
    
    return Promise.reject(error);
  }
);

// ========== AUTH ==========
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  me: () => api.get('/auth/me'),
  getCurrentUser: () => api.get('/auth/me'),
  changePassword: (oldPassword, newPassword) => 
    api.post('/auth/change-password', { oldPassword, newPassword })
};

// ========== TICKETS ==========
export const ticketsAPI = {
  // Listagem e busca
  getAll: (params) => api.get('/tickets', { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  search: (query) => api.get('/tickets', { params: { search: query } }),
  searchGlobal: (query, page = 1, limit = 20) => 
    api.get('/tickets/search/global', { params: { q: query, page, limit } }),
  searchAdvanced: (filters) => api.post('/tickets/search/advanced', filters),
  
  // CRUD
  create: (ticketData) => api.post('/tickets', ticketData),
  update: (id, ticketData) => api.patch(`/tickets/${id}`, ticketData),
  delete: (id) => api.delete(`/tickets/${id}`),
  
  // Ações específicas
  categorize: (id, categoryData) => api.patch(`/tickets/${id}/categorize`, categoryData),
  assign: (id, assignToUserId) => api.patch(`/tickets/${id}/assign`, { assignToUserId }),
  updateStatus: (id, status) => api.patch(`/tickets/${id}/status`, { status }),
  updatePriority: (id, priority) => api.patch(`/tickets/${id}/priority`, { priority }),
  
  // Transferência por DEPARTAMENTO (principal)
  transferDepartment: (id, departmentId, reason) => 
    api.patch(`/tickets/${id}/transfer-department`, { departmentId, reason }),
  
  // Transferência por categoria (legado)
  transfer: (id, categoryId, reason) => api.patch(`/tickets/${id}/transfer`, { categoryId, reason }),
  
  // Ações com descrição obrigatória (regras de negócio)
  updateStatusWithDescription: (id, status, description) => 
    api.patch(`/tickets/${id}/status`, { status, description }),
  assignWithDescription: (id, assignToUserId, description) => 
    api.patch(`/tickets/${id}/assign`, { assignToUserId, description }),
  
  // Comentários e Histórico
  addComment: (id, text, isInternal = false) => 
    api.post(`/tickets/${id}/comments`, { text, isInternal }),
  getComments: (id) => api.get(`/tickets/${id}/comments`),
  getHistory: (id) => api.get(`/tickets/${id}/history`),
  
  // Arquivos - ATUALIZADOS
  uploadFile: (id, formData) => 
    api.post(`/uploads/ticket/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  uploadFiles: (id, formData) => 
    api.post(`/uploads/ticket/${id}/multiple`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getFiles: (id) => api.get(`/uploads/ticket/${id}`),
  deleteFile: (id, fileName) => api.delete(`/uploads/ticket/${id}/${fileName}`),
  getFileDownloadUrl: (ticketId, fileName) => `${API_URL}/uploads/ticket/${ticketId}/${fileName}`,
  getFilePreviewUrl: (ticketId, fileName) => `${API_URL}/uploads/ticket/${ticketId}/${fileName}/preview`,
  
  // Exportação
  exportCSV: (params) => api.get('/tickets/export/csv', { params, responseType: 'blob' }),
  exportJSON: (params) => api.get('/tickets/export/json', { params, responseType: 'blob' })
};

// ========== QUEUES ==========
export const queuesAPI = {
  // Listagem
  getAll: () => api.get('/queues'),
  getById: (id) => api.get(`/queues/${id}`),
  getByName: (name) => api.get(`/queues/${name}`),
  
  // Tickets da fila
  getTickets: (queueName) => api.get(`/queues/${queueName}/tickets`),
  
  // CRUD (apenas Master)
  create: (queueData) => api.post('/queues', queueData),
  update: (id, queueData) => api.patch(`/queues/${id}`, queueData),
  delete: (id) => api.delete(`/queues/${id}`),
  
  // Inicialização
  initialize: () => api.post('/queues/initialize')
};

// ========== CATEGORIES ==========
export const categoriesAPI = {
  // Listagem
  getAll: (params) => api.get('/categories', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  getStats: () => api.get('/categories/stats'),
  
  // Para criação de tickets (filtra apenas permitidas)
  getForCreation: () => api.get('/categories', { params: { forCreation: true } }),
  
  // CRUD (apenas Master)
  create: (categoryData) => api.post('/categories', categoryData),
  update: (id, categoryData) => api.patch(`/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/categories/${id}`),
  
  // Inicialização
  initialize: () => api.post('/categories/initialize')
};

// ========== USERS ==========
export const usersAPI = {
  // Listagem
  getAll: () => api.get('/admin/users'),
  getById: (id) => api.get(`/admin/users/${id}`),
  getOperators: () => api.get('/admin/users', { params: { role: 'operator' } }),
  
  // CRUD (apenas Master)
  create: (userData) => api.post('/admin/users', userData),
  update: (id, userData) => api.patch(`/admin/users/${id}`, userData),
  delete: (id) => api.delete(`/admin/users/${id}`),
  
  // Ações específicas
  resetPassword: (id, newPassword) => 
    api.post(`/admin/users/${id}/reset-password`, { newPassword }),
  toggleActive: (id) => api.patch(`/admin/users/${id}/toggle-active`)
};

// ========== DEPARTMENTS ==========
export const departmentsAPI = {
  // Listagem
  getAll: () => api.get('/departments'),
  getAllIncludingInactive: () => api.get('/departments/all'),
  getById: (id) => api.get(`/departments/${id}`),
  
  // CRUD (apenas Master)
  create: (departmentData) => api.post('/departments', departmentData),
  update: (id, departmentData) => api.patch(`/departments/${id}`, departmentData),
  delete: (id) => api.delete(`/departments/${id}`),
  
  // Reordenar
  reorder: (order) => api.patch('/departments/reorder', { order }),
  
  // Inicialização
  initialize: () => api.post('/departments/initialize')
};

// ========== EXTERNAL (Webhook) ==========
export const externalAPI = {
  createTicket: (ticketData) => api.post('/external/tickets', ticketData)
};

// ========== TEMPLATES ==========
export const templatesAPI = {
  // Listagem
  getAll: (params) => api.get('/templates', { params }),
  getById: (id) => api.get(`/templates/${id}`),
  getByShortcut: (shortcut) => api.get(`/templates/shortcut/${shortcut}`),
  
  // Uso
  use: (id, variables) => api.post(`/templates/${id}/use`, { variables }),
  
  // CRUD (Master/Operator)
  create: (templateData) => api.post('/templates', templateData),
  update: (id, templateData) => api.patch(`/templates/${id}`, templateData),
  delete: (id) => api.delete(`/templates/${id}`),
  
  // Inicialização
  initialize: () => api.post('/templates/initialize')
};

// ========== DASHBOARD & STATS ==========
export const statsAPI = {
  getDashboard: () => api.get('/stats/dashboard'),
  getTicketsByStatus: () => api.get('/stats/tickets-by-status'),
  getTicketsByPriority: () => api.get('/stats/tickets-by-priority'),
  getTicketsByCategory: () => api.get('/stats/tickets-by-category'),
  getSLACompliance: () => api.get('/stats/sla-compliance'),
  getOperatorPerformance: () => api.get('/stats/operator-performance')
};

// ========== HELPER FUNCTIONS ==========

/**
 * Upload de arquivo com FormData
 */
export const uploadFile = async (file, ticketId = null) => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (ticketId) {
    return ticketsAPI.uploadFile(ticketId, formData);
  }
  
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

/**
 * Tratamento de erro padronizado - MELHORADO
 */
export const handleAPIError = (error) => {
  // Erros de rede/timeout
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return { 
        message: 'A requisição demorou muito. Tente novamente.', 
        errors: [],
        status: 0,
        isTimeout: true
      };
    }
    
    if (error.message === 'Network Error') {
      return { 
        message: 'Sem conexão com o servidor. Verifique sua internet.', 
        errors: [],
        status: 0,
        isNetworkError: true
      };
    }
    
    return { 
      message: 'Erro de conexão. Verifique sua internet.', 
      errors: [],
      status: 0 
    };
  }
  
  // Erros do servidor
  const { status, data } = error.response;
  
  // Mensagens específicas por status
  const statusMessages = {
    400: 'Dados inválidos. Verifique as informações.',
    401: data?.error || 'Credenciais inválidas.',
    403: 'Você não tem permissão para esta ação.',
    404: 'Recurso não encontrado.',
    409: data?.error || 'Conflito de dados.',
    422: 'Dados inválidos.',
    429: 'Muitas requisições. Aguarde um momento.',
    500: 'Erro interno do servidor. Tente novamente.',
    502: 'Servidor temporariamente indisponível.',
    503: 'Serviço indisponível. Tente mais tarde.'
  };
  
  const message = data?.error || 
                  data?.message || 
                  statusMessages[status] || 
                  'Erro ao processar requisição';
  
  const errors = data?.errors || [];
  
  return { message, errors, status };
};

/**
 * Polling para atualização em tempo real (fallback para WebSocket)
 */
export class TicketPoller {
  constructor(queueName, onUpdate, interval = 5000) {
    this.queueName = queueName;
    this.onUpdate = onUpdate;
    this.interval = interval;
    this.pollerId = null;
    this.lastUpdate = Date.now();
    this.isRunning = false;
    this.errorCount = 0;
    this.maxErrors = 3;
  }
  
  start() {
    this.stop(); // Para qualquer polling anterior
    this.isRunning = true;
    this.errorCount = 0;
    
    const poll = async () => {
      if (!this.isRunning) return;
      
      try {
        const response = await queuesAPI.getTickets(this.queueName);
        this.onUpdate(response.data);
        this.lastUpdate = Date.now();
        this.errorCount = 0; // Reset contador de erros
      } catch (error) {
        this.errorCount++;
        console.error('Erro no polling:', error);
        
        // Se muitos erros seguidos, para o polling
        if (this.errorCount >= this.maxErrors) {
          console.warn('Polling pausado devido a múltiplos erros');
          this.stop();
        }
      }
    };
    
    // Primeira busca imediata
    poll();
    
    // Inicia polling
    this.pollerId = setInterval(poll, this.interval);
  }
  
  stop() {
    this.isRunning = false;
    if (this.pollerId) {
      clearInterval(this.pollerId);
      this.pollerId = null;
    }
  }
  
  updateQueue(newQueueName) {
    this.queueName = newQueueName;
    this.start(); // Reinicia com nova fila
  }
  
  // Força uma atualização imediata
  refresh() {
    if (this.isRunning) {
      this.start();
    }
  }
}

/**
 * Cache simples para reduzir requisições
 */
class APICache {
  constructor(ttl = 60000) { // 1 minuto padrão
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  set(key, data, customTtl) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + (customTtl || this.ttl)
    });
  }
  
  clear(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
  
  has(key) {
    return this.get(key) !== null;
  }
}

export const apiCache = new APICache();

/**
 * Wrapper com cache
 */
export const withCache = async (key, apiCall, ttl) => {
  const cached = apiCache.get(key);
  if (cached) return cached;
  
  const response = await apiCall();
  apiCache.set(key, response.data, ttl);
  return response.data;
};

// Alias para compatibilidade com código antigo
export const adminAPI = usersAPI;

// Exportação padrão
export default api;
