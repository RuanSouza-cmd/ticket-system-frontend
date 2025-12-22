// src/components/ui/ConfirmModal.jsx - Modal de Confirmação Padronizado

import { useState, useCallback } from 'react';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirmar ação',
  message = 'Tem certeza que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger',
  icon = null,
  loading = false
}) {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: icon || 'bx-trash',
      gradient: 'from-red-500 to-rose-600',
      hoverGradient: 'hover:from-red-600 hover:to-rose-700',
      shadow: 'shadow-red-500/30',
      iconBg: 'from-red-400 to-rose-500'
    },
    warning: {
      icon: icon || 'bx-error',
      gradient: 'from-amber-500 to-orange-600',
      hoverGradient: 'hover:from-amber-600 hover:to-orange-700',
      shadow: 'shadow-orange-500/30',
      iconBg: 'from-amber-400 to-orange-500'
    },
    info: {
      icon: icon || 'bx-info-circle',
      gradient: 'from-blue-500 to-cyan-600',
      hoverGradient: 'hover:from-blue-600 hover:to-cyan-700',
      shadow: 'shadow-blue-500/30',
      iconBg: 'from-blue-400 to-cyan-500'
    },
    success: {
      icon: icon || 'bx-check-circle',
      gradient: 'from-green-500 to-emerald-600',
      hoverGradient: 'hover:from-green-600 hover:to-emerald-700',
      shadow: 'shadow-green-500/30',
      iconBg: 'from-green-400 to-emerald-500'
    }
  };

  const config = typeConfig[type] || typeConfig.danger;

  return (
    <div className="modal modal-open z-[100]">
      <div className="modal-box max-w-sm animate-modal-enter">
        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${config.iconBg} 
            flex items-center justify-center mb-4 shadow-lg ${config.shadow}`}>
            <i className={`bx ${config.icon} text-3xl text-white`}></i>
          </div>
          
          <h3 className="font-bold text-xl">{title}</h3>
          
          <p className="py-4 text-base-content/60">{message}</p>
        </div>
        
        <div className="modal-action justify-center gap-3 mt-2">
          <button 
            className="btn btn-ghost min-w-[100px]" 
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button 
            className={`btn border-0 min-w-[100px] bg-gradient-to-r ${config.gradient} 
              ${config.hoverGradient} text-white shadow-lg ${config.shadow} gap-2`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Aguarde...
              </>
            ) : (
              <>
                <i className={`bx ${config.icon}`}></i>
                {confirmText}
              </>
            )}
          </button>
        </div>
      </div>
      <div 
        className="modal-backdrop bg-black/60 backdrop-blur-sm" 
        onClick={!loading ? onClose : undefined}
      ></div>
    </div>
  );
}

// Componente de contexto global para usar em qualquer lugar
import { createContext, useContext } from 'react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    icon: null,
    loading: false,
    resolve: null
  });

  const confirm = useCallback(({ 
    title, 
    message, 
    type = 'danger', 
    confirmText = 'Confirmar', 
    cancelText = 'Cancelar', 
    icon = null 
  }) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title,
        message,
        type,
        confirmText,
        cancelText,
        icon,
        loading: false,
        resolve
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (modalState.resolve) {
      modalState.resolve(true);
    }
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, [modalState.resolve]);

  const handleClose = useCallback(() => {
    if (modalState.resolve) {
      modalState.resolve(false);
    }
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, [modalState.resolve]);

  const setLoading = useCallback((loading) => {
    setModalState(prev => ({ ...prev, loading }));
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm, setLoading }}>
      {children}
      <ConfirmModal
        isOpen={modalState.isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        icon={modalState.icon}
        loading={modalState.loading}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm deve ser usado dentro de um ConfirmProvider');
  }
  return context;
}