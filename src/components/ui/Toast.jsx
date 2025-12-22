// src/components/ui/Toast.jsx - Sistema de Toasts Padronizado

import toast from 'react-hot-toast';

const ToastBase = ({ t, type, message, description, icon, gradientFrom, gradientTo, shadowColor }) => (
  <div 
    className={`${t.visible ? 'animate-toast-enter' : 'animate-toast-leave'} 
      max-w-md w-full bg-base-100 shadow-2xl rounded-2xl pointer-events-auto 
      ring-1 ring-black/5 overflow-hidden`}
  >
    <div className="p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradientFrom} ${gradientTo} 
            flex items-center justify-center shadow-lg ${shadowColor}`}>
            <i className={`bx ${icon} text-xl text-white`}></i>
          </div>
        </div>
        <div className="flex-1 pt-0.5">
          <p className="text-sm font-semibold text-base-content">{message}</p>
          {description && (
            <p className="mt-1 text-xs text-base-content/60">{description}</p>
          )}
        </div>
        <button 
          onClick={() => toast.dismiss(t.id)}
          className="flex-shrink-0 text-base-content/40 hover:text-base-content transition-colors"
        >
          <i className='bx bx-x text-xl'></i>
        </button>
      </div>
    </div>
    <div 
      className={`h-1 bg-gradient-to-r ${gradientFrom} ${gradientTo}`}
      style={{ animation: `shrink ${type === 'error' ? '5s' : '4s'} linear forwards` }}
    ></div>
  </div>
);

export const showSuccess = (message, description = '') => {
  toast.custom((t) => (
    <ToastBase 
      t={t}
      type="success"
      message={message}
      description={description}
      icon="bx-check"
      gradientFrom="from-green-400"
      gradientTo="to-emerald-500"
      shadowColor="shadow-green-500/30"
    />
  ), { duration: 4000 });
};

export const showError = (message, description = '') => {
  toast.custom((t) => (
    <ToastBase 
      t={t}
      type="error"
      message={message}
      description={description}
      icon="bx-x"
      gradientFrom="from-red-400"
      gradientTo="to-rose-500"
      shadowColor="shadow-red-500/30"
    />
  ), { duration: 5000 });
};

export const showWarning = (message, description = '') => {
  toast.custom((t) => (
    <ToastBase 
      t={t}
      type="warning"
      message={message}
      description={description}
      icon="bx-error"
      gradientFrom="from-amber-400"
      gradientTo="to-orange-500"
      shadowColor="shadow-orange-500/30"
    />
  ), { duration: 4000 });
};

export const showInfo = (message, description = '') => {
  toast.custom((t) => (
    <ToastBase 
      t={t}
      type="info"
      message={message}
      description={description}
      icon="bx-info-circle"
      gradientFrom="from-blue-400"
      gradientTo="to-cyan-500"
      shadowColor="shadow-blue-500/30"
    />
  ), { duration: 4000 });
};

export const showLoading = (message = 'Processando...') => {
  return toast.custom((t) => (
    <div 
      className={`${t.visible ? 'animate-toast-enter' : 'animate-toast-leave'} 
        max-w-md w-full bg-base-100 shadow-2xl rounded-2xl pointer-events-auto 
        ring-1 ring-black/5 overflow-hidden`}
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          <span className="loading loading-spinner loading-md text-primary"></span>
          <p className="text-sm font-medium text-base-content">{message}</p>
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-primary to-secondary animate-pulse"></div>
    </div>
  ), { duration: Infinity });
};

export const dismissToast = (toastId) => toast.dismiss(toastId);
export const dismissAllToasts = () => toast.dismiss();

const ToastService = {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  loading: showLoading,
  dismiss: dismissToast,
  dismissAll: dismissAllToasts
};

export default ToastService;