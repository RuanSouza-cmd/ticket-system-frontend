// src/components/Login.jsx - VERSÃO MELHORADA COM FEEDBACK VISUAL

import { useState, useEffect } from 'react';
import { authAPI, handleAPIError } from '../services/api';

export default function Login({ onLogin, initialError = '' }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError);
  const [errorType, setErrorType] = useState(''); // 'credentials' | 'inactive' | 'network' | 'server'
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false); // Animação de shake no erro

  // Limpa autenticação anterior ao montar
  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  // Atualiza erro inicial se receber por prop
  useEffect(() => {
    if (initialError) {
      setError(initialError);
      setErrorType('server');
    }
  }, [initialError]);

  // Remove erro ao digitar (depois de 5 segundos)
  useEffect(() => {
    if (error && (formData.email || formData.password)) {
      const timeout = setTimeout(() => {
        setError('');
        setErrorType('');
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [formData.email, formData.password]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorType('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData.email.trim(), formData.password);
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Resposta inválida do servidor');
      }
      
      localStorage.setItem('token', token);
      onLogin(user);
      
    } catch (error) {
      console.error('Erro no login:', error);
      
      const err = handleAPIError(error);
      
      // Determina o tipo de erro para mostrar feedback adequado
      if (err.status === 401) {
        setErrorType('credentials');
        setError('Email ou senha incorretos');
      } else if (err.status === 403) {
        setErrorType('inactive');
        setError('Sua conta está inativa. Entre em contato com o administrador.');
      } else if (err.isNetworkError || err.isTimeout) {
        setErrorType('network');
        setError(err.message);
      } else {
        setErrorType('server');
        setError(err.message || 'Erro ao fazer login. Tente novamente.');
      }
      
      // Animação de shake
      triggerShake();
      
      // Limpa token se existir
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const getErrorIcon = () => {
    switch (errorType) {
      case 'credentials':
        return 'bx-lock-open-alt';
      case 'inactive':
        return 'bx-user-x';
      case 'network':
        return 'bx-wifi-off';
      default:
        return 'bx-error-circle';
    }
  };

  const getErrorColor = () => {
    switch (errorType) {
      case 'credentials':
        return 'alert-error';
      case 'inactive':
        return 'alert-warning';
      case 'network':
        return 'alert-info';
      default:
        return 'alert-error';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
      <div className={`card w-full max-w-md bg-base-100 shadow-2xl transition-transform ${shake ? 'animate-shake' : ''}`}>
        <div className="card-body">
          {/* Logo SVG */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <svg
                className="w-32 h-auto"
                version="1.1"
                viewBox="0 0 2048 720"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  transform="translate(925,12)"
                  d="m0 0h73l43 3 42 6 39 8 33 9 36 12 25 10 29 14 27 16 22 14 13 10 16 13 10 9 10 10 9 11 9 10 13 18 13 21 9 19 9 28 6 31 2 19v18l-3 26-5 25-5 15-8 14-13 18-10 13-12 14-21 21-10 6-14 7-25 9-20 6-16 3h-23l-16-4-23-8-23-12-12-9-7-7-8-7-11-14-12-24-8-20-4-17v-34l3-12 11-29 5-13 6-10 8-10 15-16 10-9 11-7 11-5 15-5 21-3 16-2 2-1h9l14 3h2v-42l-9-3-19-4h-25l-20 4-27 9-19 9-17 10-9 7-10 9-8 7-6 7-11 19-9 13-7 16-5 17-3 20v44l4 30 4 15 8 20 11 21 11 15 7 12-3 3-21 5-33 6-7 1-35 2h-44l-41-1-1-2 8-24 12-28 6-20 4-25v-36l-5-26-7-21-9-19-8-11-6-5-3-1-16 1-13 1 6 22 7 24 4 24 1 14v24l-3 24-6 25-4 12-6 11-8 10-16 16-14 11-11 5-22 5h-14l-15-4-12-6-12-11-8-10-13-25-12-27-9-24-4-17-4-23-4-8-5-5-7-3-11-1-8 2-5 3-2 5v12l5 35 6 29 7 25 7 21 10 15 3 9-1 1h-10l-54-13-40-12-25-9-25-11-25-13-21-13-19-12-16-11-11-9-3-3v-9l11-41 8-22 3-15 1-9v-21l-3-18-7-23-8-20-11-20-8-12-9-11-16-16-14-11-20-12-3-2 1-5 7-9 9-10 16-16 14-11 14-10 22-13 26-13 33-13 31-9 20-4 23-3 43-1h234zm-372 114-10 4-10 7-10 9-7 11-3 9v9l4 14 6 9 5 6 11 8 10 4h14l13-5 10-9 6-8 5-10 2-7v-13l-4-9-6-9-5-6-10-8-10-5-3-1z"
                  fill="currentColor"
                />
                <path transform="translate(1625,231)" d="m0 0h119l38 3 34 5 38 8 21 6 22 8 25 11 20 10 18 11 19 14 19 19 9 11 11 16 8 16 3 11 1 6v12l-6 12-12 19-6 10-8 10-16 16-11 9-11 8-20 12-23 12-15 7-31 11-29 8-25 5-32 3h-50l-40-4-28-5-43-11-25-8-21-7-26-11-30-13-23-11-16-9-12-8-16-11-16-12-2-3v-9l5-19 10-32 5-21 3-29v-20l-4-27-5-25v-7l67-2 39-2z" fill="currentColor" />
                <path transform="translate(331,160)" d="m0 0 17 4 16 8 16 11 13 11 12 13 12 18 8 17 5 17 2 17v16l-5 30-5 17-3 6-5 4-10 4-4 8-6 15-2 8-3 6-5 4-9 3-5 4-2 6-7 8-9 8-16 11-15 10-21 10-24 9-24 8-31 6-18 2h-55l-23-3-18-5-18-8-14-8-10-8-13-13-11-15-9-17-5-16-1-5v-21l4-15 9-17 13-17 15-15 15-11 14-8 21-9 37-12 39-12 27-9 27-12 17-9 15-10 13-10 10-8 10-9 14-14zm-188 171-7 2-4 11-3 5-4 2-6-1-8-7-5-5-2 2 3 6 8 9 2 1h11l8-4 8-5 6-9 1-6-1-1z" fill="currentColor" />
                <path transform="translate(1143,513)" d="m0 0 14 8 19 9 18 6 29 6 8 1h31l26-5 21-7 13-7h4v18l-1 38-5 37-4 24-5 17-7 11-7 9-11 12-8 8-12 9-12 3-9-2-6-4-6-7-4-11-2-11v-24l-4-16-3-5-7-1-8 4-7 8-8 16-12 26-8 11-13 13-8 4-4 1h-15l-7-4-8-9-3-7v-8l7-24 13-30 5-10 1-5-1-1h-6l-10 6-13 11-17 13-14 10-12 6-10 1-7-2-7-8-2-6v-13l3-12 7-12 12-13 7-7 7-8 13-13 7-8 26-26 8-7 11-11z" fill="currentColor" />
                <path transform="translate(729,524)" d="m0 0 4 2 9 8 15 9 16 8 12 3h35l15-3 26-11 16-9 11-7h3l-1 17-2 91-3 34-3 8-4 6-9 8-7 3h-8l-12-5-8-7-3-4-11-31-4-6-6-4-5-1-4 4-7 15-11 31-9 17-8 9-7 4v3l4 4h-30l-1-2 2-6-11-9-3-6v-10l6-29 8-28 1-9-8 3-8 6-10 9-13 11-18 12-11 5-8 2h-7l-9-3-6-5-4-7-1-4v-13l4-8 9-10 56-56 9-11 11-15z" fill="currentColor" />
                <path transform="translate(471,463)" d="m0 0 7 1 23 14 39 20 25 10 25 9 38 11 3 2-1 5-9 9-10 7-22 14-10 4-6 1h-15l-6-3-7-7-4-3-7 1-12 5-21 6-8 1-7-2-4-5-2-9v-9l3-16 5-15 6-11 1-4-6 4-13 11-14 10-12 6-12 3h-14l-5-3-3-4-1-3v-10l6-11 10-10 19-13 18-14z" fill="currentColor" />
                <path transform="translate(122,320)" d="m0 0 10 1 6 4 3 5 2 2-6 1-4 11-4 6-4 2-6-1-8-7-3-4v-9l7-8z" fill="currentColor" />
                <path transform="translate(1129,715)" d="m0 0h12l7 2v3h-19z" fill="currentColor" />
                <path transform="translate(1248,717)" d="m0 0 8 1v1h-9z" fill="currentColor" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold">Platy Suporte</h2>
            <p className="text-base-content/60 mt-2">Faça login para continuar</p>
          </div>

          {/* Alerta de Erro */}
          {error && (
            <div className={`alert ${getErrorColor()} mb-4 animate-fadeIn`}>
              <i className={`bx ${getErrorIcon()} text-xl`}></i>
              <div className="flex flex-col">
                <span className="font-medium">{error}</span>
                {errorType === 'credentials' && (
                  <span className="text-xs opacity-80 mt-1">
                    Verifique seu email e senha
                  </span>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Email</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                  <i className='bx bx-envelope text-xl'></i>
                </span>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className={`input input-bordered w-full pl-10 ${
                    errorType === 'credentials' ? 'input-error' : ''
                  }`}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  autoFocus
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Senha</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                  <i className='bx bx-lock-alt text-xl'></i>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input input-bordered w-full pl-10 pr-10 ${
                    errorType === 'credentials' ? 'input-error' : ''
                  }`}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  tabIndex={-1}
                >
                  <i className={`bx ${showPassword ? 'bx-show' : 'bx-hide'} text-xl`}></i>
                </button>
              </div>
            </div>

            {/* Botão de Login */}
            <button
              type="submit"
              className={`btn btn-primary w-full gap-2 ${loading ? 'loading' : ''}`}
              disabled={loading || !formData.email || !formData.password}
            >
              {!loading && <i className='bx bx-log-in text-xl'></i>}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="divider text-xs text-base-content/50">Credenciais de teste</div>

          {/* Dicas de Credenciais */}
          <div className="space-y-2 text-sm">
            <div className="p-3 bg-warning/10 rounded-lg border border-warning/30 hover:bg-warning/20 transition-colors cursor-default">
              <div className="flex items-center gap-2 mb-1">
                <i className='bx bx-crown text-warning'></i>
                <span className="font-semibold text-warning">Master</span>
              </div>
              <p className="text-xs opacity-80">
                Email: <code className="bg-base-200 px-1 rounded select-all">master@example.com</code><br />
                Senha: <code className="bg-base-200 px-1 rounded select-all">master123</code>
              </p>
            </div>

            <div className="p-3 bg-info/10 rounded-lg border border-info/30 hover:bg-info/20 transition-colors cursor-default">
              <div className="flex items-center gap-2 mb-1">
                <i className='bx bx-user-circle text-info'></i>
                <span className="font-semibold text-info">Operador</span>
              </div>
              <p className="text-xs opacity-80">
                Crie usuários no painel Master
              </p>
            </div>
          </div>

          {/* Rodapé */}
          <div className="text-center mt-6">
            <p className="text-xs text-base-content/50">
              Sistema de Gestão de Chamados v1.0
            </p>
          </div>
        </div>
      </div>

      {/* Estilos para animações - SHAKE SUAVIZADO */}
      <style>{`
        @keyframes shake {
          0%, 100% { 
            transform: translateX(0); 
          }
          15%, 45%, 75% { 
            transform: translateX(-3px); 
          }
          30%, 60%, 90% { 
            transform: translateX(3px); 
          }
        }
        
        .animate-shake {
          animation: shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
        
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(-10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}