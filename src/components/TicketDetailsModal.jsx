// src/components/TicketDetailsModal.jsx - MODAL COM REGRAS DE NEGÓCIO

import { useState, useEffect } from 'react';
import { ticketsAPI, usersAPI, categoriesAPI, departmentsAPI, templatesAPI, handleAPIError } from '../services/api';
import { 
  PRIORITY_CONFIG, 
  STATUS_CONFIG, 
  SLA_CONFIG,
  formatDate, 
  formatTimeRemaining,
  getSLAStatus 
} from '../constants/system';
import toast from 'react-hot-toast';
import InteractionModal from './InteractionModal';
import FileUpload, { FileList } from './FileUpload';

// Status que bloqueiam o chamado
const CLOSED_STATUSES = ['resolvido', 'fechado', 'cancelado'];

export default function TicketDetailsModal({ 
  ticket: initialTicket, 
  currentUser, 
  onClose, 
  onUpdate 
}) {
  const [ticket, setTicket] = useState(initialTicket);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Dados auxiliares
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [operators, setOperators] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [templates, setTemplates] = useState([]);
  
  // UI States
  const [activeTab, setActiveTab] = useState('overview');
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [addingComment, setAddingComment] = useState(false);
  
  // Edit states
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ 
    title: initialTicket?.title || '', 
    description: initialTicket?.description || '' 
  });
  
  // Transfer state - AGORA USA departmentId
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferData, setTransferData] = useState({ departmentId: '', reason: '' });
  
  // Modal de Interação
  const [showInteraction, setShowInteraction] = useState(false);
  const [interactionType, setInteractionType] = useState(''); // 'status' | 'assign'
  const [pendingStatus, setPendingStatus] = useState('');

  // Verifica se chamado está fechado
  const isTicketClosed = CLOSED_STATUSES.includes(ticket?.status);
  const canEdit = (currentUser?.role === 'master' || currentUser?.role === 'operator') && !isTicketClosed;
  const isMaster = currentUser?.role === 'master';

  useEffect(() => {
    if (ticket?._id) {
      loadTicketDetails();
      loadAuxiliaryData();
    }
  }, [ticket?._id]);

  const loadTicketDetails = async () => {
    try {
      const [commentsRes, historyRes] = await Promise.all([
        ticketsAPI.getComments(ticket._id),
        ticketsAPI.getHistory(ticket._id)
      ]);
      setComments(commentsRes.data || []);
      setHistory(historyRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
    }
  };

  const loadAuxiliaryData = async () => {
    try {
      const [operatorsRes, categoriesRes, departmentsRes, templatesRes] = await Promise.all([
        usersAPI.getAll(),
        categoriesAPI.getAll(),
        departmentsAPI.getAll(),
        templatesAPI.getAll()
      ]);
      setOperators((operatorsRes.data || []).filter(u => 
        (u.role === 'operator' || u.role === 'master') && u.isActive
      ));
      setCategories(categoriesRes.data.categories || categoriesRes.data || []);
      setDepartments(departmentsRes.data || []);
      setTemplates(templatesRes.data.templates || templatesRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados auxiliares:', error);
    }
  };

  const refreshTicket = async () => {
    try {
      const response = await ticketsAPI.getById(ticket._id);
      setTicket(response.data);
      loadTicketDetails();
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao atualizar ticket:', error);
    }
  };

  // ===== AÇÕES COM MODAL DE INTERAÇÃO =====

  const handleStatusClick = (newStatus) => {
    // Abre modal de interação em vez de mudar direto
    setPendingStatus(newStatus);
    setInteractionType('status');
    setShowInteraction(true);
  };

  const handleAssignClick = () => {
    setInteractionType('assign');
    setShowInteraction(true);
  };

  const handleInteractionConfirm = async ({ description, operatorId }) => {
    setActionLoading(true);
    try {
      if (interactionType === 'status') {
        // Muda status com descrição
        await ticketsAPI.updateStatusWithDescription(ticket._id, pendingStatus, description);
        toast.success(`Status alterado para ${STATUS_CONFIG[pendingStatus]?.label || pendingStatus}`);
      } else if (interactionType === 'assign') {
        // Atribui com descrição
        await ticketsAPI.assignWithDescription(ticket._id, operatorId, description);
        const operator = operators.find(o => o._id === operatorId);
        toast.success(`Atribuído para ${operator?.displayName || 'operador'}`);
      }
      
      setShowInteraction(false);
      refreshTicket();
    } catch (error) {
      toast.error(handleAPIError(error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    if (isTicketClosed) {
      toast.error('Não é possível comentar em chamados finalizados');
      return;
    }
    
    setAddingComment(true);
    try {
      await ticketsAPI.addComment(ticket._id, newComment.trim(), isInternal);
      setNewComment('');
      setIsInternal(false);
      toast.success('Comentário adicionado!');
      loadTicketDetails();
      refreshTicket();
    } catch (error) {
      toast.error(handleAPIError(error).message);
    } finally {
      setAddingComment(false);
    }
  };

  const handleUseTemplate = async (template) => {
    try {
      const variables = {
        cliente: ticket.client?.name || 'Cliente',
        ticket: ticket.ticketNumber,
        operador: currentUser.displayName || currentUser.email
      };
      const response = await templatesAPI.use(template._id, variables);
      setNewComment(response.data.processedContent);
      toast.success(`Template "${template.shortTitle}" aplicado!`);
    } catch (error) {
      toast.error(handleAPIError(error).message);
    }
  };

  const handleSaveEdit = async () => {
    if (!editData.title.trim()) {
      toast.error('Título não pode estar vazio');
      return;
    }
    setActionLoading(true);
    try {
      await ticketsAPI.update(ticket._id, editData);
      setEditMode(false);
      toast.success('Chamado atualizado!');
      refreshTicket();
    } catch (error) {
      toast.error(handleAPIError(error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferData.departmentId) {
      toast.error('Selecione um departamento de destino');
      return;
    }
    if (!transferData.reason?.trim()) {
      toast.error('Motivo da transferência é obrigatório');
      return;
    }
    setActionLoading(true);
    try {
      await ticketsAPI.transferDepartment(ticket._id, transferData.departmentId, transferData.reason);
      setShowTransfer(false);
      setTransferData({ departmentId: '', reason: '' });
      toast.success('Chamado transferido com sucesso!');
      refreshTicket();
    } catch (error) {
      toast.error(handleAPIError(error).message);
    } finally {
      setActionLoading(false);
    }
  };

  // ===== HELPERS DE SLA =====
  
  const getSLABadge = () => {
    if (!ticket?.sla?.firstResponse?.deadline) return null;
    
    // Se resolvido, mostra se foi dentro ou fora do SLA
    if (ticket.status === 'resolvido' || ticket.status === 'fechado') {
      const wasWithinSLA = !ticket.sla.firstResponse.breached && !ticket.sla.resolution?.breached;
      return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
          wasWithinSLA 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <i className={`bx ${wasWithinSLA ? 'bx-check-circle' : 'bx-x-circle'}`}></i>
          {wasWithinSLA ? 'SLA Cumprido' : 'SLA Estourado'}
        </span>
      );
    }
    
    // Se não resolvido, mostra tempo restante
    const slaStatus = getSLAStatus(ticket.sla.firstResponse.deadline, ticket.sla.firstResponse.breached);
    const slaConfig = SLA_CONFIG[slaStatus];
    const timeRemaining = formatTimeRemaining(ticket.sla.firstResponse.deadline);
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${slaConfig?.badgeClass || 'bg-base-300'}`}>
        <i className='bx bx-time-five'></i>
        {timeRemaining}
      </span>
    );
  };

  const priorityConfig = ticket ? (PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.media) : null;
  const statusConfig = ticket ? (STATUS_CONFIG[ticket.status] || STATUS_CONFIG.aberto) : null;

  if (!ticket) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-6xl h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header Fixo */}
        <div className="bg-base-100 border-b border-base-300 p-4 flex-shrink-0">
          {/* Linha 1: Número, badges e botão fechar */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold">#{ticket.ticketNumber}</h2>
              
              {/* Badge Prioridade - Apenas visual, não editável */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${priorityConfig?.badgeClass || 'bg-base-300'}`}>
                <i className={priorityConfig?.icon || 'bx bx-flag'}></i>
                {priorityConfig?.label || 'Média'}
              </span>
              
              {/* Badge Status */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusConfig?.badgeClass || 'bg-base-300'}`}>
                <i className={statusConfig?.icon || 'bx bx-loader'}></i>
                {statusConfig?.label || 'Aberto'}
              </span>
              
              {/* Badge SLA */}
              {getSLABadge()}
              
              {/* Indicador de Bloqueado */}
              {isTicketClosed && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-600 text-white">
                  <i className='bx bx-lock-alt'></i>
                  Finalizado
                </span>
              )}
            </div>
            
            <button 
              className="btn btn-ghost btn-sm btn-circle"
              onClick={onClose}
            >
              <i className='bx bx-x text-2xl'></i>
            </button>
          </div>

          {/* Linha 2: Título */}
          {editMode ? (
            <div className="space-y-2">
              <input 
                type="text" 
                className="input input-bordered w-full text-lg font-semibold"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                placeholder="Título do chamado"
              />
              <div className="flex gap-2">
                <button 
                  className="btn btn-primary btn-sm gap-1" 
                  onClick={handleSaveEdit} 
                  disabled={actionLoading}
                >
                  {actionLoading ? <span className="loading loading-spinner loading-xs"></span> : <i className='bx bx-check'></i>}
                  Salvar
                </button>
                <button 
                  className="btn btn-ghost btn-sm" 
                  onClick={() => { 
                    setEditMode(false); 
                    setEditData({ title: ticket.title, description: ticket.description }); 
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <h3 className="text-lg font-semibold flex-1">{ticket.title}</h3>
              {canEdit && (
                <button 
                  className="btn btn-ghost btn-xs gap-1" 
                  onClick={() => setEditMode(true)}
                >
                  <i className='bx bx-edit-alt'></i>
                  Editar
                </button>
              )}
            </div>
          )}

          {/* Linha 3: Ações Rápidas */}
          {!editMode && (
            <div className="flex flex-wrap gap-2 mt-3">
              {/* Aviso de chamado fechado - ESTILIZADO */}
              {isTicketClosed && (
                <div className="flex-1 rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">
                    <div className="flex items-center gap-3 text-white">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <i className='bx bx-lock-alt text-2xl'></i>
                      </div>
                      <div>
                        <p className="font-bold">Chamado Finalizado</p>
                        <p className="text-sm text-white/80">Reabra o chamado para fazer alterações ou adicionar comentários.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Ações para chamados não fechados */}
              {!isTicketClosed && canEdit && (
                <>
                  {/* Dropdown Status - Abre modal de interação */}
                  <div className="dropdown dropdown-bottom">
                    <label tabIndex={0} className="btn btn-sm btn-outline gap-1">
                      <i className='bx bx-transfer-alt'></i>
                      Alterar Status
                      <i className='bx bx-chevron-down'></i>
                    </label>
                    <ul tabIndex={0} className="dropdown-content z-[100] menu p-2 shadow-xl bg-base-100 rounded-box w-56 border border-base-300">
                      {Object.entries(STATUS_CONFIG)
                        .filter(([key]) => {
                          // Filtra status que podem ser selecionados
                          if (key === ticket.status) return false;
                          if (key === 'nao-categorizado') return false;
                          // Cancelar só para master
                          if (key === 'cancelado' && !isMaster) return false;
                          return true;
                        })
                        .map(([key, config]) => (
                          <li key={key}>
                            <button 
                              onClick={() => handleStatusClick(key)}
                              className="flex items-center gap-2"
                              disabled={actionLoading}
                            >
                              <i className={`${config.icon} text-lg`}></i>
                              <span>{config.label}</span>
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>

                  {/* Botão Atribuir - Abre modal de interação */}
                  <button 
                    className="btn btn-sm btn-outline gap-1"
                    onClick={handleAssignClick}
                  >
                    <i className='bx bx-user-plus'></i>
                    Atribuir
                  </button>

                  {/* Botão Transferir */}
                  <button 
                    className="btn btn-sm btn-outline gap-1"
                    onClick={() => setShowTransfer(true)}
                  >
                    <i className='bx bx-transfer'></i>
                    Transferir Departamento
                  </button>
                </>
              )}
              
              {/* Botão Reabrir para chamados fechados */}
              {isTicketClosed && canEdit && (
                <button 
                  className="btn btn-sm btn-primary gap-1"
                  onClick={() => handleStatusClick('reaberto')}
                >
                  <i className='bx bx-revision'></i>
                  Reabrir Chamado
                </button>
              )}
            </div>
          )}
        </div>

        {/* Conteúdo Principal com Grid */}
        <div className="flex-1 overflow-y-auto bg-base-200 p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Coluna Principal - Tabs */}
            <div className="lg:col-span-2 space-y-4">
              {/* Tabs */}
              <div className="tabs tabs-boxed bg-base-100 p-1">
                <button 
                  className={`tab gap-1 ${activeTab === 'overview' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <i className='bx bx-info-circle'></i>
                  Detalhes
                </button>
                <button 
                  className={`tab gap-1 ${activeTab === 'comments' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('comments')}
                >
                  <i className='bx bx-message-detail'></i>
                  Comentários
                  {comments.length > 0 && (
                    <span className="badge badge-sm badge-primary">{comments.length}</span>
                  )}
                </button>
                <button 
                  className={`tab gap-1 ${activeTab === 'history' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('history')}
                >
                  <i className='bx bx-history'></i>
                  Histórico
                </button>
                <button 
                  className={`tab gap-1 ${activeTab === 'files' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('files')}
                >
                  <i className='bx bx-paperclip'></i>
                  Anexos
                  {ticket?.files?.length > 0 && (
                    <span className="badge badge-sm badge-secondary">{ticket.files.length}</span>
                  )}
                </button>
              </div>

              {/* Tab Content */}
              <div className="card bg-base-100 shadow">
                <div className="card-body">
                  {/* Overview */}
                  {activeTab === 'overview' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm text-base-content/60 mb-2">Descrição</h4>
                        {editMode ? (
                          <textarea 
                            className="textarea textarea-bordered w-full h-32"
                            value={editData.description}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                            placeholder="Descrição do chamado"
                          />
                        ) : (
                          <p className="whitespace-pre-wrap">{ticket.description || 'Sem descrição'}</p>
                        )}
                      </div>
                      
                      {ticket.tags?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-base-content/60 mb-2">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {ticket.tags.map((tag, idx) => (
                              <span 
                                key={idx} 
                                className="badge"
                                style={tag.color ? { backgroundColor: tag.color, color: '#fff' } : {}}
                              >
                                {tag.name || tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {ticket.files?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-base-content/60 mb-2">
                            Anexos ({ticket.files.length})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {ticket.files.slice(0, 3).map((file, idx) => (
                              <span
                                key={idx}
                                className="badge badge-outline gap-1"
                              >
                                <i className='bx bx-file'></i>
                                {file.originalName || file.name || 'Arquivo'}
                              </span>
                            ))}
                            {ticket.files.length > 3 && (
                              <span className="badge badge-ghost">
                                +{ticket.files.length - 3} mais
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-base-content/50 mt-1">
                            Veja todos na aba "Anexos"
                          </p>
                        </div>
                      )}

                      {!isTicketClosed && (
                        <>
                          <div className="divider my-2"></div>
                          <div>
                            <h4 className="font-semibold text-sm text-base-content/60 mb-2">Resposta Rápida</h4>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                className="input input-bordered flex-1 input-sm"
                                placeholder="Digite uma resposta rápida..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                              />
                              <button 
                                className="btn btn-primary btn-sm"
                                onClick={handleAddComment}
                                disabled={!newComment.trim() || addingComment}
                              >
                                {addingComment ? (
                                  <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                  <i className='bx bx-send'></i>
                                )}
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Comments */}
                  {activeTab === 'comments' && (
                    <div className="space-y-4">
                      {/* Adicionar comentário */}
                      {!isTicketClosed && (
                        <div className="bg-base-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm">Novo Comentário</h4>
                            {templates.length > 0 && (
                              <div className="dropdown dropdown-end">
                                <label tabIndex={0} className="btn btn-ghost btn-xs gap-1">
                                  <i className='bx bx-message-square-dots'></i>
                                  Templates
                                </label>
                                <ul tabIndex={0} className="dropdown-content z-[100] menu p-2 shadow-lg bg-base-100 rounded-box w-64 max-h-48 overflow-y-auto border border-base-300">
                                  {templates.map((t) => (
                                    <li key={t._id}>
                                      <button onClick={() => handleUseTemplate(t)} className="text-sm">
                                        <span className="flex-1">{t.shortTitle}</span>
                                        {t.shortcut && <span className="badge badge-xs">{t.shortcut}</span>}
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          <textarea 
                            className="textarea textarea-bordered w-full h-20"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Digite seu comentário..."
                          />
                          <div className="flex items-center justify-between mt-2">
                            {(currentUser?.role === 'master' || currentUser?.role === 'operator') && (
                              <label className="label cursor-pointer gap-2 p-0">
                                <input 
                                  type="checkbox" 
                                  className="checkbox checkbox-sm checkbox-warning"
                                  checked={isInternal}
                                  onChange={(e) => setIsInternal(e.target.checked)}
                                />
                                <span className="label-text text-sm flex items-center gap-1">
                                  <i className='bx bx-lock-alt'></i>
                                  Interno
                                </span>
                              </label>
                            )}
                            <button 
                              className="btn btn-primary btn-sm gap-1"
                              onClick={handleAddComment}
                              disabled={!newComment.trim() || addingComment}
                            >
                              {addingComment ? (
                                <span className="loading loading-spinner loading-xs"></span>
                              ) : (
                                <i className='bx bx-send'></i>
                              )}
                              Enviar
                            </button>
                          </div>
                        </div>
                      )}

                      {isTicketClosed && (
                        <div className="rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600">
                              <i className='bx bx-lock-alt text-xl'></i>
                            </div>
                            <div>
                              <p className="font-semibold text-amber-700">Comentários Desabilitados</p>
                              <p className="text-sm text-amber-600/80">Reabra o chamado para adicionar novos comentários.</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Lista de comentários */}
                      {comments.length === 0 ? (
                        <div className="text-center py-8 text-base-content/60">
                          <i className='bx bx-message text-4xl mb-2'></i>
                          <p>Nenhum comentário ainda</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {comments.map((c, idx) => (
                            <div 
                              key={idx} 
                              className={`p-3 rounded-lg ${
                                c.isInternal 
                                  ? 'bg-warning/10 border border-warning/30' 
                                  : 'bg-base-200'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="avatar placeholder">
                                    <div className="bg-primary text-primary-content rounded-full w-8 h-8">
                                      <span className="text-xs">
                                        {(c.createdBy?.displayName || c.createdBy?.email || 'U').charAt(0)}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="font-semibold text-sm">
                                      {c.createdBy?.displayName || c.createdBy?.email}
                                    </p>
                                    <p className="text-xs text-base-content/60">{formatDate(c.createdAt)}</p>
                                  </div>
                                </div>
                                {c.isInternal && (
                                  <span className="badge badge-warning badge-sm gap-1">
                                    <i className='bx bx-lock-alt'></i>
                                    Interno
                                  </span>
                                )}
                              </div>
                              <p className="whitespace-pre-wrap text-sm">{c.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* History */}
                  {activeTab === 'history' && (
                    <div>
                      {history.length === 0 ? (
                        <div className="text-center py-8 text-base-content/60">
                          <i className='bx bx-history text-4xl mb-2'></i>
                          <p>Nenhum histórico disponível</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {history.map((h, idx) => (
                            <div key={idx} className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div className={`w-2.5 h-2.5 rounded-full ${
                                  idx === 0 ? 'bg-primary' : 'bg-base-300'
                                }`}></div>
                                {idx < history.length - 1 && (
                                  <div className="w-0.5 flex-1 bg-base-300 my-1"></div>
                                )}
                              </div>
                              <div className="flex-1 pb-3">
                                <div className="flex items-center justify-between">
                                  <p className="font-semibold text-sm capitalize">{h.action}</p>
                                  <p className="text-xs text-base-content/60">{formatDate(h.timestamp)}</p>
                                </div>
                                <p className="text-xs text-base-content/60">
                                  {h.performedBy?.displayName || 'Sistema'}
                                </p>
                                {h.field && (
                                  <p className="text-sm mt-1 bg-base-200 p-2 rounded text-xs">
                                    <span className="text-base-content/60">{h.field}:</span>
                                    <span className="text-error line-through mx-1">{h.oldValue}</span>
                                    →
                                    <span className="text-success ml-1">{h.newValue}</span>
                                  </p>
                                )}
                                {h.description && (
                                  <p className="text-sm mt-1 bg-base-200 p-2 rounded italic">
                                    "{h.description}"
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab de Anexos */}
                  {activeTab === 'files' && (
                    <div className="space-y-4">
                      {/* Upload de novos arquivos */}
                      {!isTicketClosed && canEdit && (
                        <FileUpload 
                          ticketId={ticket._id}
                          onUploadComplete={(files) => {
                            setTicket(prev => ({
                              ...prev,
                              files: [...(prev.files || []), ...files]
                            }));
                            refreshTicket();
                          }}
                        />
                      )}

                      {isTicketClosed && (
                        <div className="rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600">
                              <i className='bx bx-lock-alt text-xl'></i>
                            </div>
                            <div>
                              <p className="font-semibold text-amber-700">Uploads Desabilitados</p>
                              <p className="text-sm text-amber-600/80">Reabra o chamado para anexar novos arquivos.</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Lista de arquivos */}
                      <div>
                        <h4 className="font-semibold text-sm text-base-content/60 mb-3 flex items-center gap-2">
                          <i className='bx bx-folder'></i>
                          Arquivos Anexados ({ticket?.files?.length || 0})
                        </h4>
                        <FileList 
                          files={ticket?.files || []}
                          ticketId={ticket._id}
                          canDelete={canEdit && !isTicketClosed}
                          onDelete={(fileName) => {
                            setTicket(prev => ({
                              ...prev,
                              files: (prev.files || []).filter(f => f.fileName !== fileName)
                            }));
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Cliente */}
              <div className="card bg-base-100 shadow">
                <div className="card-body p-4">
                  <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                    <i className='bx bx-user text-primary'></i>
                    Cliente
                  </h4>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="avatar placeholder">
                      <div className="bg-primary text-primary-content rounded-full w-10 h-10">
                        <span>{ticket.client?.name?.charAt(0) || '?'}</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{ticket.client?.name || 'Não informado'}</p>
                      <p className="text-xs text-base-content/60">{ticket.client?.email}</p>
                    </div>
                  </div>
                  {ticket.client?.phone && (
                    <p className="text-sm flex items-center gap-2">
                      <i className='bx bx-phone text-base-content/60'></i>
                      {ticket.client.phone}
                    </p>
                  )}
                  {ticket.client?.company && (
                    <p className="text-sm flex items-center gap-2">
                      <i className='bx bx-building text-base-content/60'></i>
                      {ticket.client.company}
                    </p>
                  )}
                </div>
              </div>

              {/* Informações */}
              <div className="card bg-base-100 shadow">
                <div className="card-body p-4">
                  <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                    <i className='bx bx-info-circle text-primary'></i>
                    Informações
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-base-content/60">Departamento</span>
                      <span className="font-medium">{ticket.category?.department || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/60">Tipo</span>
                      <span>{ticket.category?.type || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/60">Sistema</span>
                      <span>{ticket.category?.system || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/60">Prioridade</span>
                      <span className={`badge badge-sm ${priorityConfig?.badgeClass || ''}`}>
                        {priorityConfig?.label || 'Média'}
                      </span>
                    </div>
                    <div className="divider my-1"></div>
                    <div className="flex justify-between">
                      <span className="text-base-content/60">Criado</span>
                      <span className="text-xs">{formatDate(ticket.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/60">Atualizado</span>
                      <span className="text-xs">{formatDate(ticket.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Responsável */}
              <div className="card bg-base-100 shadow">
                <div className="card-body p-4">
                  <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                    <i className='bx bx-user-check text-primary'></i>
                    Responsável
                  </h4>
                  {ticket.assignedTo?.displayName ? (
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-success text-success-content rounded-full w-10 h-10">
                          <span>{ticket.assignedTo.displayName.charAt(0)}</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">{ticket.assignedTo.displayName}</p>
                        <p className="text-xs text-base-content/60">{ticket.assignedTo.email}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-warning">
                      <i className='bx bx-user-x text-xl'></i>
                      <span className="text-sm">Não atribuído</span>
                    </div>
                  )}
                </div>
              </div>

              {/* SLA */}
              {ticket.sla?.firstResponse?.deadline && (
                <div className="card bg-base-100 shadow">
                  <div className="card-body p-4">
                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                      <i className='bx bx-time-five text-primary'></i>
                      SLA
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-base-content/60 text-xs">Primeira Resposta</p>
                        <p className={`font-medium flex items-center gap-1 ${
                          ticket.sla.firstResponse.breached ? 'text-error' : 
                          ticket.sla.firstResponse.respondedAt ? 'text-success' : ''
                        }`}>
                          {ticket.sla.firstResponse.respondedAt ? (
                            <>
                              <i className='bx bx-check-circle'></i>
                              {formatDate(ticket.sla.firstResponse.respondedAt)}
                            </>
                          ) : ticket.sla.firstResponse.breached ? (
                            <>
                              <i className='bx bx-x-circle'></i>
                              Estourado
                            </>
                          ) : (
                            formatDate(ticket.sla.firstResponse.deadline)
                          )}
                        </p>
                      </div>
                      {ticket.sla.resolution?.deadline && (
                        <div>
                          <p className="text-base-content/60 text-xs">Resolução</p>
                          <p className={`font-medium flex items-center gap-1 ${
                            ticket.sla.resolution.breached ? 'text-error' : 
                            ticket.sla.resolution.resolvedAt ? 'text-success' : ''
                          }`}>
                            {ticket.sla.resolution.resolvedAt ? (
                              <>
                                <i className='bx bx-check-circle'></i>
                                {formatDate(ticket.sla.resolution.resolvedAt)}
                              </>
                            ) : ticket.sla.resolution.breached ? (
                              <>
                                <i className='bx bx-x-circle'></i>
                                Estourado
                              </>
                            ) : (
                              formatDate(ticket.sla.resolution.deadline)
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div className="modal-backdrop bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal de Interação (Status/Atribuição) */}
      <InteractionModal
        isOpen={showInteraction}
        onClose={() => {
          setShowInteraction(false);
          setPendingStatus('');
        }}
        onConfirm={handleInteractionConfirm}
        type={interactionType}
        title={interactionType === 'status' 
          ? `Alterar para ${STATUS_CONFIG[pendingStatus]?.label}` 
          : 'Atribuir Chamado'
        }
        ticket={ticket}
        currentUser={currentUser}
        newStatus={pendingStatus}
        operators={operators}
        loading={actionLoading}
      />

      {/* Modal de Transferência */}
      {showTransfer && (
        <div className="modal modal-open z-[60]">
          <div className="modal-box">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <i className='bx bx-transfer text-primary'></i>
              Transferir para Outro Departamento
            </h3>
            <p className="text-sm text-base-content/60 mt-1">
              O chamado será enviado para a fila de abertos do departamento selecionado
            </p>
            <div className="py-4 space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Departamento de Destino <span className="text-error">*</span></span>
                </label>
                <select 
                  className="select select-bordered w-full"
                  value={transferData.departmentId}
                  onChange={(e) => setTransferData({ ...transferData, departmentId: e.target.value })}
                >
                  <option value="">Selecione o departamento...</option>
                  {departments
                    .filter(dept => dept._id !== ticket?.departmentId?._id && dept._id !== ticket?.departmentId)
                    .map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.displayName}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Preview do departamento selecionado */}
              {transferData.departmentId && (
                <div className="bg-base-200 p-3 rounded-lg">
                  {(() => {
                    const selectedDept = departments.find(d => d._id === transferData.departmentId);
                    if (!selectedDept) return null;
                    return (
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: selectedDept.color }}
                        >
                          <i className={`bx ${selectedDept.icon} text-xl`}></i>
                        </div>
                        <div>
                          <p className="font-semibold">{selectedDept.displayName}</p>
                          <p className="text-xs text-base-content/60">{selectedDept.description || 'Sem descrição'}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Motivo da Transferência <span className="text-error">*</span></span>
                </label>
                <textarea 
                  className="textarea textarea-bordered"
                  placeholder="Descreva o motivo da transferência..."
                  value={transferData.reason}
                  onChange={(e) => setTransferData({ ...transferData, reason: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-action">
              <button 
                className="btn btn-ghost" 
                onClick={() => { 
                  setShowTransfer(false); 
                  setTransferData({ departmentId: '', reason: '' }); 
                }}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary gap-1" 
                onClick={handleTransfer} 
                disabled={actionLoading || !transferData.departmentId || !transferData.reason?.trim()}
              >
                {actionLoading ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <i className='bx bx-check'></i>
                )}
                Confirmar Transferência
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowTransfer(false)}></div>
        </div>
      )}
    </div>
  );
}
