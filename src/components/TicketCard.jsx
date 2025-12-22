// src/components/TicketCard.jsx - CATEGORIA EM DESTAQUE

import { 
  PRIORITY_CONFIG, 
  STATUS_CONFIG, 
  SLA_CONFIG,
  formatDate, 
  formatTimeRemaining,
  getSLAStatus 
} from '../constants/system';

// Status finalizados
const CLOSED_STATUSES = ['resolvido', 'fechado', 'cancelado'];

// Cores por departamento
const DEPT_COLORS = {
  'SUPORTE': { bg: 'from-blue-500 to-cyan-500', text: 'text-blue-600', light: 'bg-blue-50' },
  'INFRA': { bg: 'from-purple-500 to-violet-500', text: 'text-purple-600', light: 'bg-purple-50' },
  'FINANCEIRO': { bg: 'from-green-500 to-emerald-500', text: 'text-green-600', light: 'bg-green-50' },
  'DESENVOLVIMENTO': { bg: 'from-orange-500 to-amber-500', text: 'text-orange-600', light: 'bg-orange-50' },
  'NAO-CATEGORIZADO': { bg: 'from-gray-400 to-slate-400', text: 'text-gray-500', light: 'bg-gray-50' }
};

export default function TicketCard({ ticket, onClick }) {
  const priorityConfig = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.media;
  const statusConfig = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.aberto;
  
  const isResolved = ticket.status === 'resolvido' || ticket.status === 'fechado';
  const isClosed = CLOSED_STATUSES.includes(ticket.status);
  
  // Categoria completa
  const category = ticket.category || {};
  const categoryFull = category.department !== 'NAO-CATEGORIZADO' 
    ? `${category.department || 'N/A'} • ${category.type || 'N/A'} • ${category.system || 'N/A'}`
    : 'Não Categorizado';
  
  const deptColors = DEPT_COLORS[category.department] || DEPT_COLORS['NAO-CATEGORIZADO'];
  
  // Calcula status do SLA
  let slaDisplay = null;
  
  if (isResolved && ticket.sla?.firstResponse?.deadline) {
    const wasWithinSLA = !ticket.sla.firstResponse.breached && !ticket.sla.resolution?.breached;
    slaDisplay = {
      label: wasWithinSLA ? 'SLA OK' : 'SLA Estourado',
      class: wasWithinSLA ? 'bg-success/10 text-success' : 'bg-error/10 text-error',
      icon: wasWithinSLA ? 'bx-check-circle' : 'bx-x-circle'
    };
  } else if (!isClosed && ticket.sla?.firstResponse?.deadline) {
    const slaStatus = getSLAStatus(
      ticket.sla.firstResponse.deadline, 
      ticket.sla.firstResponse.breached
    );
    const timeRemaining = formatTimeRemaining(ticket.sla.firstResponse.deadline);
    const isPaused = ticket.status === 'aguardando-cliente' || ticket.status === 'aguardando-terceiro';
    
    if (slaStatus === 'breached') {
      slaDisplay = {
        label: 'Estourado',
        class: 'bg-gradient-to-r from-red-500 to-rose-500 text-white',
        icon: 'bx-error-circle'
      };
    } else if (slaStatus === 'at-risk') {
      slaDisplay = {
        label: timeRemaining,
        class: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white',
        icon: 'bx-alarm-exclamation'
      };
    } else if (isPaused) {
      slaDisplay = {
        label: 'Pausado',
        class: 'bg-info/10 text-info',
        icon: 'bx-pause-circle'
      };
    } else {
      slaDisplay = {
        label: timeRemaining,
        class: 'bg-success/10 text-success',
        icon: 'bx-time-five'
      };
    }
  }

  return (
    <div 
      className={`
        card bg-base-100 shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer
        border border-base-200 hover:border-primary/30 overflow-hidden
        ${ticket.priority === 'critica' ? 'ring-2 ring-error/40' : ''}
        ${isClosed ? 'opacity-60' : ''}
        group
      `}
      onClick={() => onClick?.(ticket)}
    >
      {/* Header com Categoria em DESTAQUE */}
      <div className={`bg-gradient-to-r ${deptColors.bg} px-4 py-2.5`}>
        <div className="flex items-center justify-between">
          {/* Categoria Completa */}
          <div className="flex items-center gap-2 text-white">
            <i className='bx bx-category text-lg'></i>
            <span className="font-bold text-sm tracking-wide">
              {categoryFull}
            </span>
          </div>
          
          {/* Badge de Status */}
          <span className={`
            inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold
            bg-white/20 text-white backdrop-blur-sm
          `}>
            <i className={`${statusConfig?.icon || 'bx bx-loader'} text-xs`}></i>
            {statusConfig?.label || 'Aberto'}
          </span>
        </div>
      </div>
      
      <div className="card-body p-4">
        {/* Linha: Número + Prioridade + Sem dono */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Número do Ticket */}
          <span className="font-mono text-sm font-bold text-primary">
            #{ticket.ticketNumber}
          </span>
          
          {/* Badge de Prioridade */}
          <span className={`
            inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold
            ${priorityConfig?.badgeClass || 'bg-base-300'}
          `}>
            <i className={`${priorityConfig?.icon || 'bx bx-flag'} text-xs`}></i>
            {priorityConfig?.label || 'Média'}
          </span>
          
          {/* Indicador de não atribuído */}
          {!ticket.assignedTo?.userId && !isClosed && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-gradient-to-r from-red-500 to-rose-500 text-white animate-pulse">
              <i className='bx bx-user-x text-xs'></i>
              Sem dono
            </span>
          )}
        </div>

        {/* Título - Agora secundário */}
        <h3 className="text-sm text-base-content/80 line-clamp-2 mt-2 group-hover:text-primary transition-colors">
          {ticket.title}
        </h3>

        {/* SLA Badge - Destacado */}
        {slaDisplay && (
          <div className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold mt-2 w-fit
            ${slaDisplay.class}
          `}>
            <i className={`bx ${slaDisplay.icon}`}></i>
            <span>SLA: {slaDisplay.label}</span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-base-200 mt-3 pt-3">
          {/* Footer: Solicitante e Operador */}
          <div className="flex items-center justify-between">
            {/* Solicitante */}
            <div className="flex items-center gap-2 text-xs text-base-content/60 min-w-0">
              <div className="avatar placeholder flex-shrink-0">
                <div className="bg-base-300 text-base-content/50 rounded-full w-6 h-6">
                  <span className="text-xs">
                    {ticket.client?.name?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
              </div>
              <span className="truncate">{ticket.client?.name || 'N/A'}</span>
            </div>
            
            {/* Tempo */}
            <div className="flex items-center gap-1 text-xs text-base-content/40" title={formatDate(ticket.updatedAt)}>
              <i className='bx bx-time-five'></i>
              <span>{formatDate(ticket.updatedAt, 'relative')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
