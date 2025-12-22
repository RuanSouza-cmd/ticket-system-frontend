// src/App.jsx - COMPLETO COM CONFIRM PROVIDER

import { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import MasterDashboard from './views/MasterDashboard';
import UsersManagement from './views/UsersManagement';
import CategoriesManagement from './views/CategoriesManagement';
import TemplatesManagement from './views/TemplatesManagement';
import DepartmentsManagement from './views/DepartmentsManagement';
import Settings from './views/Settings';
import { authAPI, handleAPIError } from './services/api';
import { ConfirmProvider } from './components/ui/ConfirmModal';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [viewHistory, setViewHistory] = useState(['dashboard']);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const handleAuthExpired = (event) => {
      console.log('Sessão expirada detectada');
      setSessionExpiredMessage(event.detail?.message || 'Sua sessão expirou');
      setCurrentUser(null);
      setCurrentView('dashboard');
      setViewHistory(['dashboard']);
      
      toast.error('Sua sessão expirou. Faça login novamente.', {
        duration: 5000,
        icon: '🔒'
      });
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    
    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const response = await authAPI.me();
        const userData = response.data.user || response.data;
        
        if (userData) {
          setCurrentUser(userData);
        } else {
          throw new Error('Dados de usuário inválidos');
        }
      } catch (error) {
        console.error('Erro na verificação de autenticação:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        const err = handleAPIError(error);
        if (!err.isNetworkError) {
          setSessionExpiredMessage('Sua sessão expirou ou é inválida');
        }
      }
    }
    setLoading(false);
  };

  const handleLogin = useCallback((user) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
    setViewHistory(['dashboard']);
    setSessionExpiredMessage('');
    
    toast.success(`Bem-vindo(a), ${user.displayName || user.email}!`, {
      icon: '👋',
      duration: 3000
    });
  }, []);

  const handleLogoutRequest = useCallback(() => {
    setShowLogoutModal(true);
  }, []);

  const handleLogoutConfirm = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setCurrentView('dashboard');
    setViewHistory(['dashboard']);
    setShowLogoutModal(false);
    
    toast.success('Você saiu com sucesso', {
      icon: '👋',
      duration: 2000
    });
  }, []);

  const handleNavigation = useCallback((view) => {
    if (view !== currentView) {
      setViewHistory(prev => [...prev, view]);
    }
    setCurrentView(view);
  }, [currentView]);

  const handleGoBack = useCallback(() => {
    if (viewHistory.length > 1) {
      const newHistory = [...viewHistory];
      newHistory.pop();
      const previousView = newHistory[newHistory.length - 1];
      setViewHistory(newHistory);
      setCurrentView(previousView);
    }
  }, [viewHistory]);

  const canGoBack = viewHistory.length > 1 && currentView !== 'dashboard';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 gap-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-base-content/60 animate-pulse">Carregando sistema...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <Login onLogin={handleLogin} initialError={sessionExpiredMessage} />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--fallback-b1,oklch(var(--b1)))',
              color: 'var(--fallback-bc,oklch(var(--bc)))',
            },
          }}
        />
      </>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            currentUser={currentUser} 
            onLogout={handleLogoutRequest}
            onNavigate={handleNavigation}
          />
        );
      case 'master':
        if (currentUser.role !== 'master') return null;
        return (
          <MasterDashboard 
            currentUser={currentUser} 
            onLogout={handleLogoutRequest}
            onNavigate={handleNavigation}
            onGoBack={handleGoBack}
            canGoBack={canGoBack}
          />
        );
      case 'users':
        if (currentUser.role !== 'master') return null;
        return (
          <UsersManagement 
            currentUser={currentUser} 
            onLogout={handleLogoutRequest}
            onNavigate={handleNavigation}
            onGoBack={handleGoBack}
            canGoBack={canGoBack}
          />
        );
      case 'categories':
        if (currentUser.role !== 'master') return null;
        return (
          <CategoriesManagement 
            currentUser={currentUser} 
            onLogout={handleLogoutRequest}
            onNavigate={handleNavigation}
            onGoBack={handleGoBack}
            canGoBack={canGoBack}
          />
        );
      case 'departments':
        if (currentUser.role !== 'master') return null;
        return (
          <DepartmentsManagement 
            currentUser={currentUser} 
            onLogout={handleLogoutRequest}
            onNavigate={handleNavigation}
            onGoBack={handleGoBack}
            canGoBack={canGoBack}
          />
        );
      case 'templates':
        if (!['master', 'operator'].includes(currentUser.role)) return null;
        return (
          <TemplatesManagement 
            currentUser={currentUser} 
            onLogout={handleLogoutRequest}
            onNavigate={handleNavigation}
            onGoBack={handleGoBack}
            canGoBack={canGoBack}
          />
        );
      case 'settings':
        return (
          <Settings 
            currentUser={currentUser} 
            onLogout={handleLogoutRequest}
            onNavigate={handleNavigation}
            onGoBack={handleGoBack}
            canGoBack={canGoBack}
          />
        );
      default:
        return (
          <Dashboard 
            currentUser={currentUser} 
            onLogout={handleLogoutRequest}
            onNavigate={handleNavigation}
          />
        );
    }
  };

  return (
    <ConfirmProvider>
      {renderCurrentView()}

      {showLogoutModal && (
        <div className="modal modal-open z-50">
          <div className="modal-box max-w-sm animate-modal-enter">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center mb-4 shadow-lg shadow-rose-500/30">
                <i className='bx bx-log-out text-3xl text-white'></i>
              </div>
              <h3 className="font-bold text-xl">Encerrar Sessão</h3>
              <p className="py-4 text-base-content/60">
                Você tem certeza que deseja sair da sua conta?
              </p>
            </div>
            <div className="modal-action justify-center gap-3 mt-2">
              <button 
                className="btn btn-ghost min-w-[120px]" 
                onClick={() => setShowLogoutModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn border-0 min-w-[120px] bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-lg shadow-rose-500/30 gap-2"
                onClick={handleLogoutConfirm}
              >
                <i className='bx bx-log-out'></i>
                Sair
              </button>
            </div>
          </div>
          <div 
            className="modal-backdrop bg-black/60 backdrop-blur-sm" 
            onClick={() => setShowLogoutModal(false)}
          ></div>
        </div>
      )}
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--fallback-b1,oklch(var(--b1)))',
            color: 'var(--fallback-bc,oklch(var(--bc)))',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: 'white',
            },
          },
        }}
      />
    </ConfirmProvider>
  );
}

export default App;