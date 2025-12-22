// src/components/InteractionModal.jsx - ESTILIZADO COM GRADIENTES

import { useState, useEffect } from 'react';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../constants/system';

// Mensagens prontas por tipo de status
const STATUS_TEMPLATES = {
  'em-andamento': [
    'Iniciando análise do chamado.',
    'Chamado recebido, iniciando atendimento.',
    'Em análise pela equipe técnica.'
  ],
  'aguardando-cliente': [
    'Aguardando informações adicionais do solicitante.',
    'Favor fornecer mais detalhes para prosseguirmos.',
    'Aguardando retorno sobre a solução proposta.'
  ],
  'aguardando-terceiro': [
    'Encaminhado para análise de terceiros.',
    'Aguardando retorno do fornecedor.',
    'Dependência externa identificada, aguardando resolução.'
  ],
  'resolvido': [
    'Problema identificado e corrigido.',
    'Solução aplicada com sucesso.',
    'Chamado resolvido conforme solicitação.',
    'Dúvida esclarecida.'
  ],
  'fechado': [
    'Chamado encerrado após confirmação do solicitante.',
    'Fechamento automático por inatividade.',
    'Chamado concluído.'
  ],
  'cancelado': [
    'Cancelado a pedido do solicitante.',
    'Chamado duplicado.',
    'Cancelado por falta de informações.'
  ],
  'reaberto': [
    'Chamado reaberto para nova análise.',
    'Reabertura solicitada pelo cliente.',
    'Problema recorrente, reabrindo chamado.'
  ]
};

// Mensagens prontas para atribuição
const ASSIGN_TEMPLATES = [
  'Atribuído para tratamento.',
  'Encaminhado para o especialista responsável.',
  'Atribuído conforme área de conhecimento.',
  'Transferido para o responsável técnico.'
];

// Configurações de cor por status para os gradientes
const STATUS_GRADIENT_CONFIG = {
  'em-andamento': {
    gradient: 'from-amber-500 to-orange-500',
    bgGradient: 'from-amber-500/10 to-orange-500/10',
    borderColor: 'border-amber-500/30',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500'
  },
  'aguardando-cliente': {
    gradient: 'from-yellow-500 to-amber-500',
    bgGradient: 'from-yellow-500/10 to-amber-500/10',
    borderColor: 'border-yellow-500/30',
    iconBg: 'bg-gradient-to-br from-yellow-500 to-amber-500'
  },
  'aguardando-terceiro': {
    gradient: 'from-purple-500 to-violet-500',
    bgGradient: 'from-purple-500/10 to-violet-500/10',
    borderColor: 'border-purple-500/30',
    iconBg: 'bg-gradient-to-br from-purple-500 to-violet-500'
  },
  'resolvido': {
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-500/10 to-emerald-500/10',
    borderColor: 'border-green-500/30',
    iconBg: 'bg-gradient-to-br from-green-500 to-emerald-500'
  },
  'fechado': {
    gradient: 'from-gray-500 to-slate-500',
    bgGradient: 'from-gray-500/10 to-slate-500/10',
    borderColor: 'border-gray-500/30',
    iconBg: 'bg-gradient-to-br from-gray-500 to-slate-500'
  },
  'cancelado': {
    gradient: 'from-red-500 to-rose-500',
    bgGradient: 'from-red-500/10 to-rose-500/10',
    borderColor: 'border-red-500/30',
    iconBg: 'bg-gradient-to-br from-red-500 to-rose-500'
  },
  'reaberto': {
    gradient: 'from-indigo-500 to-blue-500',
    bgGradient: 'from-indigo-500/10 to-blue-500/10',
    borderColor: 'border-indigo-500/30',
    iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-500'
  },
  'aberto': {
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/10 to-cyan-500/10',
    borderColor: 'border-blue-500/30',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500'
  }
};

export default function InteractionModal({
  isOpen,
  onClose,
  onConfirm,
  type, // 'status' | 'assign'
  title,
  ticket,
  currentUser,
  // Para mudança de status
  newStatus,
  // Para atribuição
  operators,
  loading = false
}) {
  const [description, setDescription] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('');
  const [error, setError] = useState('');

  // Reset ao abrir
  useEffect(() => {
    if (isOpen) {
      setDescription('');
      setSelectedOperator('');
      setError('');
    }
  }, [isOpen, newStatus]);

  const statusConfig = newStatus ? STATUS_CONFIG[newStatus] : null;
  const gradientConfig = newStatus ? STATUS_GRADIENT_CONFIG[newStatus] : STATUS_GRADIENT_CONFIG['aberto'];
  const templates = type === 'status' 
    ? STATUS_TEMPLATES[newStatus] || []
    : ASSIGN_TEMPLATES;

  const handleTemplateClick = (template) => {
    setDescription(template);
    setError('');
  };

  const handleConfirm = () => {
    // Validação
    if (!description.trim()) {
      setError('A descrição é obrigatória para registrar a interação.');
      return;
    }

    if (type === 'assign' && !selectedOperator) {
      setError('Selecione um operador para atribuir o chamado.');
      return;
    }

    onConfirm({
      description: description.trim(),
      operatorId: selectedOperator
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open z-[60]">
      <div className="modal-box max-w-lg overflow-hidden p-0">
        {/* Header com gradiente */}
        <div className={`
          bg-gradient-to-r ${type === 'assign' ? 'from-primary to-secondary' : gradientConfig?.gradient || 'from-primary to-secondary'}
          p-5 text-white
        `}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
              {type === 'status' && statusConfig && (
                <i className={`${statusConfig.icon} text-3xl`}></i>
              )}
              {type === 'assign' && (
                <i className='bx bx-user-plus text-3xl'></i>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl">
                {title || (type === 'status' ? `Alterar para ${statusConfig?.label}` : 'Atribuir Chamado')}
              </h3>
              <p className="text-white/80 text-sm mt-0.5">
                #{ticket?.ticketNumber} - {ticket?.title?.substring(0, 35)}...
              </p>
            </div>
            <button 
              className="btn btn-ghost btn-sm btn-circle text-white hover:bg-white/20"
              onClick={onClose}
            >
              <i className='bx bx-x text-2xl'></i>
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Alerta de regra de negócio - Estilizado */}
          <div className={`
            rounded-xl p-4 border
            ${type === 'assign' 
              ? 'bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20' 
              : `bg-gradient-to-r ${gradientConfig?.bgGradient || 'from-primary/5 to-secondary/5'} ${gradientConfig?.borderColor || 'border-primary/20'}`
            }
          `}>
            <div className="flex items-start gap-3">
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                ${type === 'assign' ? 'bg-gradient-to-br from-primary to-secondary' : gradientConfig?.iconBg || 'bg-gradient-to-br from-primary to-secondary'}
                text-white shadow-md
              `}>
                <i className='bx bx-info-circle text-lg'></i>
              </div>
              <p className="text-sm text-base-content/80 leading-relaxed">
                {type === 'status' 
                  ? 'Toda alteração de status requer uma descrição para manter o histórico completo do atendimento.'
                  : 'Registre o motivo da atribuição para rastreabilidade.'
                }
              </p>
            </div>
          </div>

          {/* Seleção de operador (apenas para atribuição) */}
          {type === 'assign' && (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <i className='bx bx-user text-primary'></i>
                  Atribuir para <span className="text-error">*</span>
                </span>
              </label>
              <select
                className="select select-bordered w-full focus:select-primary"
                value={selectedOperator}
                onChange={(e) => {
                  setSelectedOperator(e.target.value);
                  if (error) setError('');
                }}
                disabled={loading}
              >
                <option value="">Selecione um operador...</option>
                {operators?.map((op) => (
                  <option key={op._id} value={op._id}>
                    {op.displayName} ({op.role === 'master' ? 'Master' : 'Operador'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Templates de mensagem */}
          {templates.length > 0 && (
            <div>
              <label className="label pb-1">
                <span className="label-text text-sm text-base-content/60 flex items-center gap-1">
                  <i className='bx bx-bulb text-warning'></i>
                  Mensagens sugeridas (clique para usar):
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {templates.map((template, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`
                      btn btn-sm h-auto py-1.5 px-3 text-xs
                      ${description === template 
                        ? `bg-gradient-to-r ${type === 'assign' ? 'from-primary to-secondary' : gradientConfig?.gradient || 'from-primary to-secondary'} text-white border-0 shadow-md` 
                        : 'btn-ghost bg-base-200/50 hover:bg-base-200'
                      }
                    `}
                    onClick={() => handleTemplateClick(template)}
                  >
                    {template.substring(0, 32)}...
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Campo de descrição */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold flex items-center gap-2">
                <i className='bx bx-edit text-primary'></i>
                Descrição da Interação <span className="text-error">*</span>
              </span>
            </label>
            <textarea
              className={`
                textarea textarea-bordered h-28 focus:textarea-primary resize-none
                ${error && !description.trim() ? 'textarea-error' : ''}
              `}
              placeholder="Descreva o motivo desta ação..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (error) setError('');
              }}
              disabled={loading}
            />
            <label className="label">
              <span className="label-text-alt text-base-content/50 flex items-center gap-1">
                <i className='bx bx-history text-xs'></i>
                Esta descrição será registrada no histórico do chamado
              </span>
            </label>
          </div>

          {/* Erro - Estilizado */}
          {error && (
            <div className="rounded-xl p-4 bg-gradient-to-r from-error/10 to-rose-500/10 border border-error/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-error to-rose-500 flex items-center justify-center text-white shadow-md">
                  <i className='bx bx-error-circle text-lg'></i>
                </div>
                <span className="text-sm text-error font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-2">
            <button 
              className="btn btn-ghost" 
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              className={`
                btn gap-2 border-0 text-white shadow-lg
                ${type === 'status' && newStatus === 'cancelado' 
                  ? 'bg-gradient-to-r from-error to-rose-500 hover:from-error/90 hover:to-rose-500/90 shadow-error/30' 
                  : type === 'status' && newStatus === 'resolvido' 
                  ? 'bg-gradient-to-r from-success to-emerald-500 hover:from-success/90 hover:to-emerald-500/90 shadow-success/30'
                  : `bg-gradient-to-r ${type === 'assign' ? 'from-primary to-secondary shadow-primary/30' : gradientConfig?.gradient + ' shadow-primary/30' || 'from-primary to-secondary shadow-primary/30'} hover:opacity-90`
                }
              `}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <i className={`bx ${type === 'status' ? 'bx-check' : 'bx-user-plus'}`}></i>
              )}
              {type === 'status' ? 'Confirmar Interação' : 'Atribuir'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="modal-backdrop bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
    </div>
  );
}
