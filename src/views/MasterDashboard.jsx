// src/views/MasterDashboard.jsx - COM BOTÃO VOLTAR

import { useState, useEffect } from 'react';
import { usersAPI, categoriesAPI, queuesAPI, handleAPIError } from '../services/api';
import Navbar from '../components/Navbar';

export default function MasterDashboard({ currentUser, onLogout, onNavigate, onGoBack, canGoBack }) {
  const [stats, setStats] = useState({
    users: { total: 0, masters: 0, operators: 0, agents: 0 },
    categories: { total: 0, active: 0, masterOnly: 0 },
    queues: { total: 0 },
    tickets: { total: 0, open: 0, inProgress: 0, resolved: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError('');

    try {
      const usersResponse = await usersAPI.getAll();
      const users = Array.isArray(usersResponse.data) ? usersResponse.data : [];
      
      const usersStats = {
        total: users.length,
        masters: users.filter(u => u.role === 'master').length,
        operators: users.filter(u => u.role === 'operator').length,
        agents: users.filter(u => u.role === 'agent').length
      };

      const categoriesResponse = await categoriesAPI.getAll();
      const categories = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [];
      
      const categoriesStats = {
        total: categories.length,
        active: categories.filter(c => c.isActive).length,
        masterOnly: categories.filter(c => c.isMasterOnly).length
      };

      const queuesResponse = await queuesAPI.getAll();
      const queues = Array.isArray(queuesResponse.data) ? queuesResponse.data : [];
      
      const queuesStats = {
        total: queues.length
      };

      setStats({
        users: usersStats,
        categories: categoriesStats,
        queues: queuesStats,
        tickets: { total: 0, open: 0, inProgress: 0, resolved: 0 }
      });

    } catch (error) {
      const err = handleAPIError(error);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (view) => {
    if (onNavigate) {
      onNavigate(view);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-base-200">
      <Navbar currentUser={currentUser} onLogout={onLogout} onNavigate={onNavigate} />
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header com botão voltar */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              {canGoBack && (
                <button 
                  onClick={onGoBack}
                  className="btn btn-ghost btn-sm gap-1"
                >
                  <i className='bx bx-arrow-back text-lg'></i>
                  Voltar
                </button>
              )}
            </div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <i className='bx bx-crown text-primary'></i>
              Painel Master
            </h1>
            <p className="text-base-content/60 mt-1">
              Visão geral completa do sistema
            </p>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <i className='bx bx-error-circle text-xl'></i>
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm opacity-70">Total de Usuários</h3>
                        <p className="text-3xl font-bold">{stats.users.total}</p>
                      </div>
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <i className='bx bx-user text-3xl text-primary'></i>
                      </div>
                    </div>
                    <div className="divider my-2"></div>
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center gap-1">
                        <i className='bx bx-crown text-warning'></i>
                        {stats.users.masters} Masters
                      </span>
                      <span className="flex items-center gap-1">
                        <i className='bx bx-user-circle text-info'></i>
                        {stats.users.operators} Operadores
                      </span>
                      <span className="flex items-center gap-1">
                        <i className='bx bx-user text-secondary'></i>
                        {stats.users.agents} Agentes
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm opacity-70">Categorias</h3>
                        <p className="text-3xl font-bold">{stats.categories.total}</p>
                      </div>
                      <div className="bg-secondary/10 p-3 rounded-lg">
                        <i className='bx bx-category text-3xl text-secondary'></i>
                      </div>
                    </div>
                    <div className="divider my-2"></div>
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center gap-1">
                        <i className='bx bx-check-circle text-success'></i>
                        {stats.categories.active} Ativas
                      </span>
                      <span className="flex items-center gap-1">
                        <i className='bx bx-lock text-warning'></i>
                        {stats.categories.masterOnly} Restritas
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm opacity-70">Filas</h3>
                        <p className="text-3xl font-bold">{stats.queues.total}</p>
                      </div>
                      <div className="bg-accent/10 p-3 rounded-lg">
                        <i className='bx bx-list-ul text-3xl text-accent'></i>
                      </div>
                    </div>
                    <div className="divider my-2"></div>
                    <div className="text-xs opacity-70">
                      Todas as filas ativas
                    </div>
                  </div>
                </div>

                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm opacity-70">Tickets</h3>
                        <p className="text-3xl font-bold">{stats.tickets.total}</p>
                      </div>
                      <div className="bg-info/10 p-3 rounded-lg">
                        <i className='bx bx-file text-3xl text-info'></i>
                      </div>
                    </div>
                    <div className="divider my-2"></div>
                    <div className="text-xs opacity-70">
                      Em breve: estatísticas detalhadas
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <button 
                  onClick={() => handleNavigation('users')} 
                  className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer text-left"
                >
                  <div className="card-body">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-4 rounded-lg">
                        <i className='bx bx-user-plus text-4xl text-primary'></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Gerenciar Usuários</h3>
                        <p className="text-sm opacity-70">Criar, editar e excluir usuários</p>
                      </div>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => handleNavigation('departments')} 
                  className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer text-left"
                >
                  <div className="card-body">
                    <div className="flex items-center gap-4">
                      <div className="bg-info/10 p-4 rounded-lg">
                        <i className='bx bx-buildings text-4xl text-info'></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Departamentos</h3>
                        <p className="text-sm opacity-70">Organizar equipes por área</p>
                      </div>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => handleNavigation('categories')} 
                  className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer text-left"
                >
                  <div className="card-body">
                    <div className="flex items-center gap-4">
                      <div className="bg-secondary/10 p-4 rounded-lg">
                        <i className='bx bx-category-alt text-4xl text-secondary'></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Gerenciar Categorias</h3>
                        <p className="text-sm opacity-70">Configurar categorias e SLAs</p>
                      </div>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => handleNavigation('settings')} 
                  className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer text-left"
                >
                  <div className="card-body">
                    <div className="flex items-center gap-4">
                      <div className="bg-accent/10 p-4 rounded-lg">
                        <i className='bx bx-cog text-4xl text-accent'></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Configurações</h3>
                        <p className="text-sm opacity-70">Ajustar preferências do sistema</p>
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Atividade Recente */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">
                    <i className='bx bx-time text-primary'></i>
                    Atividade Recente
                  </h2>
                  <div className="text-center py-12 text-base-content/60">
                    <i className='bx bx-history text-6xl mb-4'></i>
                    <p>Sistema de logs em desenvolvimento</p>
                    <p className="text-sm mt-2">Em breve você verá todas as atividades do sistema aqui</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
