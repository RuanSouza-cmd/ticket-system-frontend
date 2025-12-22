// src/components/StatusChangeModal.jsx - NOVO COM COMENTÁRIO

import { useState } from 'react';
import { STATUS_CONFIG } from '../constants/system';

export default function StatusChangeModal({ ticket, currentUser, onClose, onSubmit }) {
  const [selectedStatus, setSelectedStatus] = useState(ticket.status);
  const [comment, setComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Status que REQUEREM comentário obrigatório
  const REQUIRES_COMMENT = [
    'resolvido',
    'fechado', 
    'cancelado',
    'em-andamento',
    'aguardando-cliente',
    'aguardando-terceiro'
  ];

  const requiresComment = REQUIRES_COMMENT.includes(selectedStatus);
  const commentPlaceholder = getCommentPlaceholder(selectedStatus);

  const canSubmit = selectedStatus !== ticket.status && 
                    (!requiresComment || comment.trim().length >= 10);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setLoading(true);
    try {
      await onSubmit(selectedStatus, comment.trim(), isInternal);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
          <i className='bx bx-edit text-primary'></i>
          Alterar Status do Ticket
        </h3>
        
        <div className="mb-4 p-3 bg-base-200 rounded-lg">
          <p className="text-sm text-base-content/60">
            <span className="font-semibold">Ticket #{ticket.ticketNumber}</span>
          </p>
          <p className="text-sm font-semibold mt-1">{ticket.title}</p>
        </div>

        {/* Seleção de Status */}
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text font-semibold">
              <i className='bx bx-list-ul mr-1'></i>
              Novo Status
            </span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedStatus(key)}
                disabled={key === ticket.status}
                className={`btn btn-sm justify-start ${
                  selectedStatus === key 
                    ? 'btn-primary' 
                    : key === ticket.status
                    ? 'btn-disabled'
                    : 'btn-ghost'
                }`}
              >
                <i className={`bx ${config.icon}`}></i>
                <span className="flex-1 text-left">{config.label}</span>
                {key === ticket.status && (
                  <i className='bx bx-check text-success'></i>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Alerta de Comentário Obrigatório */}
        {requiresComment && (
          <div className="alert alert-warning mb-4">
            <i className='bx bx-info-circle'></i>
            <div>
              <p className="font-semibold">Comentário Obrigatório</p>
              <p className="text-sm">
                Este status requer explicação (mínimo 10 caracteres)
              </p>
            </div>
          </div>
        )}

        {/* Campo de Comentário */}
        {selectedStatus !== ticket.status && (
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-semibold">
                <i className='bx bx-message-detail mr-1'></i>
                {requiresComment ? 'Comentário *' : 'Comentário (Opcional)'}
              </span>
              <span className="label-text-alt">
                {comment.length}/500 caracteres
              </span>
            </label>
            <textarea
              className={`textarea textarea-bordered h-32 ${
                requiresComment && comment.trim().length < 10 
                  ? 'textarea-warning' 
                  : ''
              }`}
              placeholder={commentPlaceholder}
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              required={requiresComment}
            />
            {requiresComment && comment.trim().length < 10 && (
              <label className="label">
                <span className="label-text-alt text-warning">
                  Mínimo 10 caracteres (atual: {comment.trim().length})
                </span>
              </label>
            )}
          </div>
        )}

        {/* Checkbox Comentário Interno */}
        {comment.trim() && (
          <div className="form-control mb-4">
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
              />
              <div className="flex-1">
                <span className="label-text font-semibold">
                  <i className='bx bx-lock-alt mr-1'></i>
                  Comentário Interno
                </span>
                <p className="text-xs text-base-content/60 mt-1">
                  Visível apenas para operadores e masters
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Preview da Mudança */}
        {selectedStatus !== ticket.status && (
          <div className="bg-base-200 p-4 rounded-lg mb-4">
            <p className="text-sm font-semibold mb-2">Preview da Mudança:</p>
            <div className="flex items-center gap-2 text-sm">
              <div className={`badge ${STATUS_CONFIG[ticket.status].badgeClass}`}>
                {STATUS_CONFIG[ticket.status].label}
              </div>
              <i className='bx bx-right-arrow-alt'></i>
              <div className={`badge ${STATUS_CONFIG[selectedStatus].badgeClass}`}>
                {STATUS_CONFIG[selectedStatus].label}
              </div>
            </div>
            {comment.trim() && (
              <div className="mt-3 p-2 bg-base-100 rounded">
                <p className="text-xs text-base-content/60 mb-1">
                  {isInternal ? '🔒 Comentário interno' : '💬 Comentário público'}:
                </p>
                <p className="text-sm italic">"{comment.trim()}"</p>
              </div>
            )}
          </div>
        )}

        {/* Ações */}
        <div className="modal-action">
          <button 
            className="btn btn-ghost" 
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            className={`btn btn-primary gap-2 ${loading ? 'loading' : ''}`}
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
          >
            {!loading && <i className='bx bx-check'></i>}
            {loading ? 'Alterando...' : 'Confirmar Alteração'}
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/50" onClick={onClose}></div>
    </div>
  );
}

// Helper: Retorna placeholder apropriado para cada status
function getCommentPlaceholder(status) {
  const placeholders = {
    'aberto': 'Adicione informações adicionais (opcional)',
    'em-andamento': 'Descreva o que está sendo feito para resolver este ticket...',
    'aguardando-cliente': 'Explique o que está aguardando do cliente (informações, aprovação, etc)...',
    'aguardando-terceiro': 'Informe quem ou o que está aguardando (fornecedor, outro setor, etc)...',
    'resolvido': 'Descreva detalhadamente a solução aplicada e o que foi feito...',
    'fechado': 'Confirmação final do fechamento do ticket...',
    'cancelado': 'Explique o motivo do cancelamento deste ticket...',
    'reaberto': 'Explique por que o ticket foi reaberto...',
    'em-validacao': 'Informe o que precisa ser validado...'
  };
  
  return placeholders[status] || 'Adicione um comentário...';
}