// src/constants/system.js

// ========== STATUS DO CHAMADO ==========
export const TICKET_STATUS = {
  NAO_CATEGORIZADO: 'nao-categorizado',
  ABERTO: 'aberto',
  EM_ANDAMENTO: 'em-andamento',
  AGUARDANDO_CLIENTE: 'aguardando-cliente',
  AGUARDANDO_TERCEIRO: 'aguardando-terceiro',
  RESOLVIDO: 'resolvido',
  FECHADO: 'fechado',
  CANCELADO: 'cancelado',
  REABERTO: 'reaberto'
};

export const STATUS_CONFIG = {
  [TICKET_STATUS.NAO_CATEGORIZADO]: {
    label: 'Não Categorizado',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    icon: 'bx bx-question-mark',
    badgeClass: 'bg-gradient-to-r from-gray-400 to-slate-400 text-white shadow-sm'
  },
  [TICKET_STATUS.ABERTO]: {
    label: 'Aberto',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: 'bx bx-folder-open',
    badgeClass: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/30'
  },
  [TICKET_STATUS.EM_ANDAMENTO]: {
    label: 'Em Andamento',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    icon: 'bx bx-loader-alt bx-spin',
    badgeClass: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30'
  },
  [TICKET_STATUS.AGUARDANDO_CLIENTE]: {
    label: 'Aguardando Cliente',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    icon: 'bx bx-time-five',
    badgeClass: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-md shadow-yellow-500/30'
  },
  [TICKET_STATUS.AGUARDANDO_TERCEIRO]: {
    label: 'Aguardando Terceiro',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: 'bx bx-user-voice',
    badgeClass: 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-md shadow-purple-500/30'
  },
  [TICKET_STATUS.RESOLVIDO]: {
    label: 'Resolvido',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: 'bx bx-check-circle',
    badgeClass: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/30'
  },
  [TICKET_STATUS.FECHADO]: {
    label: 'Fechado',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: 'bx bx-lock-alt',
    badgeClass: 'bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-md shadow-gray-500/30'
  },
  [TICKET_STATUS.CANCELADO]: {
    label: 'Cancelado',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: 'bx bx-x-circle',
    badgeClass: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md shadow-red-500/30'
  },
  [TICKET_STATUS.REABERTO]: {
    label: 'Reaberto',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    icon: 'bx bx-revision',
    badgeClass: 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md shadow-indigo-500/30'
  }
};

// Transições permitidas de status (de -> para)
export const STATUS_TRANSITIONS = {
  [TICKET_STATUS.NAO_CATEGORIZADO]: [TICKET_STATUS.ABERTO, TICKET_STATUS.CANCELADO],
  [TICKET_STATUS.ABERTO]: [
    TICKET_STATUS.EM_ANDAMENTO,
    TICKET_STATUS.AGUARDANDO_CLIENTE,
    TICKET_STATUS.AGUARDANDO_TERCEIRO,
    TICKET_STATUS.CANCELADO
  ],
  [TICKET_STATUS.EM_ANDAMENTO]: [
    TICKET_STATUS.AGUARDANDO_CLIENTE,
    TICKET_STATUS.AGUARDANDO_TERCEIRO,
    TICKET_STATUS.RESOLVIDO,
    TICKET_STATUS.CANCELADO
  ],
  [TICKET_STATUS.AGUARDANDO_CLIENTE]: [
    TICKET_STATUS.EM_ANDAMENTO,
    TICKET_STATUS.REABERTO,
    TICKET_STATUS.CANCELADO
  ],
  [TICKET_STATUS.AGUARDANDO_TERCEIRO]: [
    TICKET_STATUS.EM_ANDAMENTO,
    TICKET_STATUS.CANCELADO
  ],
  [TICKET_STATUS.RESOLVIDO]: [
    TICKET_STATUS.FECHADO,
    TICKET_STATUS.REABERTO
  ],
  [TICKET_STATUS.REABERTO]: [
    TICKET_STATUS.EM_ANDAMENTO,
    TICKET_STATUS.AGUARDANDO_CLIENTE
  ],
  [TICKET_STATUS.FECHADO]: [],
  [TICKET_STATUS.CANCELADO]: []
};

// ========== PRIORIDADES ==========
export const PRIORITY = {
  CRITICA: 'critica',
  ALTA: 'alta',
  MEDIA: 'media',
  BAIXA: 'baixa'
};

export const PRIORITY_CONFIG = {
  [PRIORITY.CRITICA]: {
    label: 'Crítica',
    value: 4,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-l-red-500',
    icon: 'bx bxs-error',
    badgeClass: 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/30',
    ringClass: 'ring-2 ring-red-500'
  },
  [PRIORITY.ALTA]: {
    label: 'Alta',
    value: 3,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-l-orange-500',
    icon: 'bx bx-up-arrow-alt',
    badgeClass: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30',
    ringClass: 'ring-2 ring-orange-500'
  },
  [PRIORITY.MEDIA]: {
    label: 'Média',
    value: 2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-l-blue-500',
    icon: 'bx bx-minus',
    badgeClass: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/30',
    ringClass: 'ring-1 ring-blue-500'
  },
  [PRIORITY.BAIXA]: {
    label: 'Baixa',
    value: 1,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-l-green-500',
    icon: 'bx bx-down-arrow-alt',
    badgeClass: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/30',
    ringClass: 'ring-1 ring-green-500'
  }
};

// ========== SLA STATUS ==========
export const SLA_STATUS = {
  WITHIN: 'within',
  AT_RISK: 'at-risk',
  BREACHED: 'breached'
};

export const SLA_CONFIG = {
  [SLA_STATUS.WITHIN]: {
    label: 'No prazo',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: 'bx bx-check-circle',
    badgeClass: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/30'
  },
  [SLA_STATUS.AT_RISK]: {
    label: 'Em risco',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: 'bx bx-error',
    badgeClass: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30 animate-pulse'
  },
  [SLA_STATUS.BREACHED]: {
    label: 'Estourado',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: 'bx bx-time-five',
    badgeClass: 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/40'
  }
};

// ========== ROLES DO USUÁRIO ==========
export const USER_ROLES = {
  MASTER: 'master',
  OPERATOR: 'operator',
  AGENT: 'agent'
};

export const ROLE_CONFIG = {
  [USER_ROLES.MASTER]: {
    label: 'Master',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: 'bx bx-crown',
    badgeClass: 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-md shadow-purple-500/30'
  },
  [USER_ROLES.OPERATOR]: {
    label: 'Operador',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: 'bx bx-headphone',
    badgeClass: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/30'
  },
  [USER_ROLES.AGENT]: {
    label: 'Agente',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: 'bx bx-user',
    badgeClass: 'bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-md shadow-gray-500/30'
  }
};

// ========== PERMISSÕES ==========
export const PERMISSIONS = {
  // Visualização
  VIEW_UNCATEGORIZED: 'view_uncategorized',
  VIEW_ALL_TICKETS: 'view_all_tickets',
  VIEW_ALL_QUEUES: 'view_all_queues',
  
  // Tickets
  CREATE_TICKET: 'create_ticket',
  EDIT_ANY_TICKET: 'edit_any_ticket',
  EDIT_OWN_TICKET: 'edit_own_ticket',
  DELETE_ANY_TICKET: 'delete_any_ticket',
  DELETE_OWN_TICKET: 'delete_own_ticket',
  ASSIGN_TICKET: 'assign_ticket',
  CHANGE_STATUS: 'change_status',
  CHANGE_PRIORITY: 'change_priority',
  
  // Categorias
  CREATE_CATEGORY: 'create_category',
  EDIT_CATEGORY: 'edit_category',
  DELETE_CATEGORY: 'delete_category',
  
  // Filas
  CREATE_QUEUE: 'create_queue',
  EDIT_QUEUE: 'edit_queue',
  DELETE_QUEUE: 'delete_queue',
  
  // Usuários
  CREATE_USER: 'create_user',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',
  
  // Configurações
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_REPORTS: 'view_reports'
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.MASTER]: Object.values(PERMISSIONS), // Todas as permissões
  [USER_ROLES.OPERATOR]: [
    PERMISSIONS.VIEW_ALL_TICKETS,
    PERMISSIONS.VIEW_ALL_QUEUES,
    PERMISSIONS.CREATE_TICKET,
    PERMISSIONS.EDIT_ANY_TICKET,
    PERMISSIONS.DELETE_OWN_TICKET,
    PERMISSIONS.ASSIGN_TICKET,
    PERMISSIONS.CHANGE_STATUS,
    PERMISSIONS.CHANGE_PRIORITY
  ],
  [USER_ROLES.AGENT]: [
    PERMISSIONS.CREATE_TICKET,
    PERMISSIONS.EDIT_OWN_TICKET,
    PERMISSIONS.DELETE_OWN_TICKET
  ]
};

// ========== AÇÕES DE LOG ==========
export const LOG_ACTIONS = {
  CREATED: 'criado',
  UPDATED: 'atualizado',
  CATEGORIZED: 'categorizado',
  ASSIGNED: 'atribuído',
  STATUS_CHANGED: 'status alterado',
  PRIORITY_CHANGED: 'prioridade alterada',
  COMMENTED: 'comentário adicionado',
  FILE_ATTACHED: 'arquivo anexado',
  TRANSFERRED: 'transferido',
  REOPENED: 'reaberto',
  RESOLVED: 'resolvido',
  CLOSED: 'fechado',
  CANCELLED: 'cancelado'
};

// ========== FILAS PADRÃO ==========
export const DEFAULT_QUEUES = {
  UNCATEGORIZED: 'uncategorized',
  OPEN: 'open',
  ALL: 'all',
  MY_QUEUE: 'my-queue',
  IN_PROGRESS: 'in-progress',
  WAITING_CLIENT: 'waiting-client',
  WAITING_THIRD_PARTY: 'waiting-third-party',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  CANCELLED: 'cancelled'
};

// ========== UTILITÁRIOS ==========

/**
 * Verifica se usuário tem permissão
 */
export function hasPermission(userRole, permission) {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
}

/**
 * Verifica se status pode transitar para outro
 */
export function canTransitionTo(currentStatus, newStatus) {
  return STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
}

/**
 * Ordena tickets por prioridade
 */
export function sortByPriority(tickets) {
  return tickets.sort((a, b) => {
    const priorityA = PRIORITY_CONFIG[a.priority]?.value || 0;
    const priorityB = PRIORITY_CONFIG[b.priority]?.value || 0;
    const priorityDiff = priorityB - priorityA;
    if (priorityDiff !== 0) return priorityDiff;
    // Se prioridades iguais, ordena por data (mais antigo primeiro)
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
}

/**
 * Calcula tempo restante de SLA
 */
export function getSLATimeRemaining(deadline) {
  if (!deadline) return null;
  
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate - now;
  
  if (diff < 0) return { expired: true, hours: 0, minutes: 0 };
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return { expired: false, hours, minutes };
}

/**
 * Formata tempo de forma legível
 */
export function formatTimeRemaining(deadline) {
  const time = getSLATimeRemaining(deadline);
  
  if (!time) return 'Sem prazo';
  if (time.expired) return 'Estourado';
  
  if (time.hours > 24) {
    const days = Math.floor(time.hours / 24);
    return `${days}d ${time.hours % 24}h`;
  }
  
  if (time.hours > 0) {
    return `${time.hours}h ${time.minutes}m`;
  }
  
  return `${time.minutes}m`;
}

/**
 * Determina status do SLA baseado no tempo restante
 */
export function getSLAStatus(deadline, isBreached) {
  if (isBreached) return SLA_STATUS.BREACHED;
  
  const time = getSLATimeRemaining(deadline);
  if (!time || time.expired) return SLA_STATUS.BREACHED;
  
  const totalMinutes = time.hours * 60 + time.minutes;
  if (totalMinutes < 120) return SLA_STATUS.AT_RISK; // Menos de 2h
  
  return SLA_STATUS.WITHIN;
}

/**
 * Formata data para exibição
 */
export function formatDate(date, format = 'full') {
  if (!date) return '';
  
  const d = new Date(date);
  
  if (format === 'relative') {
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
  }
  
  if (format === 'short') {
    return d.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      year: '2-digit'
    });
  }
  
  if (format === 'time') {
    return d.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  }
  
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default {
  TICKET_STATUS,
  STATUS_CONFIG,
  STATUS_TRANSITIONS,
  PRIORITY,
  PRIORITY_CONFIG,
  SLA_STATUS,
  SLA_CONFIG,
  USER_ROLES,
  ROLE_CONFIG,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  LOG_ACTIONS,
  DEFAULT_QUEUES,
  hasPermission,
  canTransitionTo,
  sortByPriority,
  getSLATimeRemaining,
  formatTimeRemaining,
  getSLAStatus,
  formatDate
};
