// src/components/Dashboard.jsx - MELHORADO COM UI/UX APRIMORADA

import { useState, useEffect, useMemo } from 'react';
import { queuesAPI, ticketsAPI, usersAPI, categoriesAPI, handleAPIError, TicketPoller } from '../services/api';
import { sortByPriority } from '../constants/system';
import { showSuccess, showError } from '../utils/toast';
import TicketCard from './TicketCard';
import TicketDetailsModal from './TicketDetailsModal';
import CreateTicketModal from './CreateTicketModal';
import SearchAndFilters from './SearchAndFilters';
import ExportModal from './ExportModal';
import AdvancedSearch from './AdvancedSearch';
import Navbar from './Navbar';

export default function Dashboard({ currentUser, onLogout, onNavigate }) {
  const [queues, setQueues] = useState([]);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [queueStats, setQueueStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  
  const [operators, setOperators] = useState([]);
  const [categories, setCategories] = useState([]);
  const [poller, setPoller] = useState(null);
  
  // Estado para sidebar colapsada em mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadQueues();
    loadOperators();
    loadCategories();
    
    return () => {
      if (poller) poller.stop();
    };
  }, []);

  useEffect(() => {
    if (selectedQueue) {
      loadTicketsFromQueue(selectedQueue.name);
      setupPolling(selectedQueue.name);
    }
    
    return () => {
      if (poller) poller.stop();
    };
  }, [selectedQueue]);

  const loadQueues = async () => {
    try {
      const response = await queuesAPI.getAll();
      const queuesData = response.data;
      
      setQueues(queuesData);
      
      // Seleciona "Minha Fila" como padrão, ou a primeira disponível
      if (queuesData.length > 0 && !selectedQueue) {
        const myQueue = queuesData.find(q => q.name === 'my-queue');
        setSelectedQueue(myQueue || queuesData[0]);
      }
    } catch (error) {
      const err = handleAPIError(error);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadOperators = async () => {
    try {
      const response = await usersAPI.getAll();
      const allUsers = response.data;
      const ops = allUsers.filter(u => 
        (u.role === 'operator' || u.role === 'master') && u.isActive
      );
      setOperators(ops);
    } catch (error) {
      console.error('Erro ao carregar operadores:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadTicketsFromQueue = async (queueName) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await queuesAPI.getTickets(queueName);
      const data = response.data;
      
      const sortedTickets = sortByPriority(data.tickets || []);
      
      setTickets(sortedTickets);
      setFilteredTickets(sortedTickets);
      setQueueStats(data.stats);
    } catch (error) {
      const err = handleAPIError(error);
      setError(err.message);
      if (error.response?.status === 404) {
        console.warn(`Fila "${queueName}" não encontrada`);
        loadQueues();
      }
    } finally {
      setLoading(false);
    }
  };

  const setupPolling = (queueName) => {
    if (poller) poller.stop();

    const newPoller = new TicketPoller(
      queueName,
      (data) => {
        if (data.tickets) {
          const sortedTickets = sortByPriority(data.tickets);
          setTickets(sortedTickets);
          setQueueStats(data.stats);
        }
      },
      10000
    );
    
    newPoller.start();
    setPoller(newPoller);
  };

  const handleQueueChange = (queue) => {
    // Se clicou na mesma fila, apenas recarrega os dados
    if (selectedQueue && selectedQueue.name === queue.name) {
      loadTicketsFromQueue(queue.name);
      return;
    }
    
    if (poller) poller.stop();
    
    setTickets([]);
    setFilteredTickets([]);
    setQueueStats(null);
    setSelectedQueue(queue);
    setSidebarOpen(false); // Fecha sidebar no mobile
  };

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setShowDetailsModal(true);
  };

  const handleTicketUpdate = () => {
    if (selectedQueue) {
      loadTicketsFromQueue(selectedQueue.name);
    }
  };

  // Agrupa filas por tipo para melhor organização
  const groupedQueues = useMemo(() => {
    const groups = {
      personal: [], // Minha Fila
      active: [],   // Abertos, Em Andamento, Aguardando...
      all: [],      // Todos os Chamados
      finished: [], // Resolvidos, Fechados, Cancelados
      admin: []     // Não Categorizados
    };
    
    queues.forEach(queue => {
      if (queue.name === 'my-queue') {
        groups.personal.push(queue);
      } else if (queue.name === 'all') {
        groups.all.push(queue);
      } else if (['open', 'in-progress', 'waiting-client', 'waiting-third-party'].includes(queue.name)) {
        groups.active.push(queue);
      } else if (['resolved', 'closed', 'cancelled'].includes(queue.name)) {
        groups.finished.push(queue);
      } else if (queue.name === 'uncategorized') {
        groups.admin.push(queue);
      } else {
        groups.active.push(queue);
      }
    });
    
    return groups;
  }, [queues]);

  // Componente de item de fila
  const QueueItem = ({ queue }) => (
    <li>
      <button
        onClick={() => handleQueueChange(queue)}
        className={`
          flex items-center justify-between w-full px-3 py-2.5 rounded-lg
          transition-all duration-200
          ${selectedQueue?.name === queue.name 
            ? 'bg-primary text-primary-content shadow-md' 
            : 'hover:bg-base-200'
          }
        `}
      >
        <span className="flex items-center gap-2.5">
          <i className={`bx ${queue.icon || 'bx-folder'} text-lg`}></i>
          <span className="font-medium text-sm">{queue.displayName}</span>
        </span>
        {queue.count > 0 && (
          <span className={`
            badge badge-sm font-bold min-w-[24px]
            ${selectedQueue?.name === queue.name 
              ? 'badge-ghost' 
              : queue.count > 10 ? 'badge-error' : 'badge-primary badge-outline'
            }
          `}>
            {queue.count}
          </span>
        )}
      </button>
    </li>
  );

  // Componente de seção de filas
  const QueueSection = ({ title, queues: sectionQueues, icon }) => {
    if (sectionQueues.length === 0) return null;
    
    return (
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider px-3 mb-2 flex items-center gap-2">
          <i className={`bx ${icon} text-sm`}></i>
          {title}
        </h3>
        <ul className="space-y-1">
          {sectionQueues.map((queue) => (
            <QueueItem key={queue._id} queue={queue} />
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-base-200">
      <Navbar 
        currentUser={currentUser} 
        onLogout={onLogout} 
        onNavigate={onNavigate}
        onSelectTicket={handleTicketClick}
      />
      
      {/* Mobile menu button */}
      <div className="lg:hidden fixed bottom-4 left-4 z-40">
        <button 
          className="btn btn-circle btn-primary shadow-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <i className={`bx ${sidebarOpen ? 'bx-x' : 'bx-menu'} text-2xl`}></i>
        </button>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Filas */}
        <div className={`
          fixed lg:relative inset-y-0 left-0 z-30
          w-72 bg-base-100 border-r border-base-300 
          transform transition-transform duration-300 ease-in-out
          lg:transform-none overflow-y-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          mt-16 lg:mt-0
        `}>
          <div className="p-4">
            {/* Header da Sidebar */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <i className='bx bx-folder-open text-primary text-xl'></i>
                Filas
              </h2>
              <button 
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => loadQueues()}
                title="Atualizar filas"
              >
                <i className='bx bx-refresh text-lg'></i>
              </button>
            </div>
            
            {/* Filas organizadas por seção */}
            <div className="space-y-2">
              {/* Seção Pessoal */}
              <QueueSection 
                title="Meus Chamados" 
                queues={groupedQueues.personal} 
                icon="bx-user"
              />
              
              {/* Seção Todos */}
              <QueueSection 
                title="Visão Geral" 
                queues={groupedQueues.all} 
                icon="bx-globe"
              />
              
              {/* Seção Ativos */}
              <QueueSection 
                title="Em Progresso" 
                queues={groupedQueues.active} 
                icon="bx-play-circle"
              />
              
              {/* Seção Finalizados */}
              <QueueSection 
                title="Finalizados" 
                queues={groupedQueues.finished} 
                icon="bx-check-double"
              />
              
              {/* Seção Admin */}
              {groupedQueues.admin.length > 0 && (
                <QueueSection 
                  title="Administração" 
                  queues={groupedQueues.admin} 
                  icon="bx-cog"
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Overlay para fechar sidebar no mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {selectedQueue && (
            <div className="mb-6">
              {/* Header da Fila */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <i className={`bx ${selectedQueue.icon || 'bx-folder'} text-primary text-xl`}></i>
                    </div>
                    {selectedQueue.displayName}
                  </h1>
                  <p className="text-base-content/60 mt-1 ml-13">
                    {selectedQueue.description || 'Visualização de chamados'}
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {(currentUser.role === 'master' || currentUser.role === 'operator') && (
                    <>
                      <button
                        className="btn btn-ghost btn-sm gap-2"
                        onClick={() => setShowAdvancedSearch(true)}
                        title="Pesquisa avançada"
                      >
                        <i className='bx bx-search-alt text-lg'></i>
                        <span className="hidden sm:inline">Pesquisa Avançada</span>
                      </button>
                      <button
                        className="btn btn-ghost btn-sm gap-2"
                        onClick={() => setShowExportModal(true)}
                        title="Exportar relatório"
                      >
                        <i className='bx bx-export text-lg'></i>
                        <span className="hidden sm:inline">Exportar</span>
                      </button>
                    </>
                  )}
                  
                  <button
                    className="btn btn-primary btn-sm gap-2"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <i className='bx bx-plus text-lg'></i>
                    <span className="hidden sm:inline">Novo Chamado</span>
                    <span className="sm:hidden">Novo</span>
                  </button>
                </div>
              </div>

              {/* Stats da Fila */}
              {queueStats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  <div className="stat bg-base-100 rounded-xl shadow-sm p-4">
                    <div className="stat-figure text-primary">
                      <i className='bx bx-file text-2xl lg:text-3xl'></i>
                    </div>
                    <div className="stat-title text-xs">Total</div>
                    <div className="stat-value text-xl lg:text-2xl text-primary">{queueStats.total}</div>
                  </div>

                  <div className="stat bg-base-100 rounded-xl shadow-sm p-4">
                    <div className="stat-figure text-error">
                      <i className='bx bx-error-circle text-2xl lg:text-3xl'></i>
                    </div>
                    <div className="stat-title text-xs">Críticos</div>
                    <div className="stat-value text-xl lg:text-2xl text-error">{queueStats.critical || 0}</div>
                  </div>

                  <div className="stat bg-base-100 rounded-xl shadow-sm p-4">
                    <div className="stat-figure text-warning">
                      <i className='bx bx-time-five text-2xl lg:text-3xl'></i>
                    </div>
                    <div className="stat-title text-xs">SLA Vencido</div>
                    <div className="stat-value text-xl lg:text-2xl text-warning">{queueStats.slaBreached || 0}</div>
                  </div>

                  <div className="stat bg-base-100 rounded-xl shadow-sm p-4">
                    <div className="stat-figure text-info">
                      <i className='bx bx-alarm-exclamation text-2xl lg:text-3xl'></i>
                    </div>
                    <div className="stat-title text-xs">SLA em Risco</div>
                    <div className="stat-value text-xl lg:text-2xl text-info">{queueStats.slaAtRisk || 0}</div>
                  </div>
                </div>
              )}

              {/* BUSCA E FILTROS */}
              <SearchAndFilters
                tickets={tickets}
                onFilteredResults={setFilteredTickets}
                categories={categories}
                operators={operators}
              />
            </div>
          )}

          {error && (
            <div className="alert alert-error mb-4 shadow-lg">
              <i className='bx bx-error-circle text-xl'></i>
              <span>{error}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => loadTicketsFromQueue(selectedQueue?.name)}>
                <i className='bx bx-refresh'></i>
                Tentar novamente
              </button>
            </div>
          )}

          {loading && !filteredTickets.length ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="text-base-content/60">Carregando chamados...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-24 h-24 rounded-full bg-base-300/50 flex items-center justify-center mb-4">
                <i className='bx bx-inbox text-5xl text-base-content/30'></i>
              </div>
              <p className="text-xl font-semibold text-base-content/60">
                {tickets.length === 0 ? 'Nenhum chamado nesta fila' : 'Nenhum resultado encontrado'}
              </p>
              <p className="text-base-content/40 mt-2 max-w-md">
                {tickets.length === 0 
                  ? 'Quando novos chamados entrarem nesta fila, eles aparecerão aqui.'
                  : 'Tente ajustar os filtros de busca para encontrar o que procura.'
                }
              </p>
              {tickets.length > 0 && (
                <button 
                  className="btn btn-ghost btn-sm mt-4"
                  onClick={() => setFilteredTickets(tickets)}
                >
                  <i className='bx bx-x'></i>
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-base-content/60">
                  Mostrando <span className="font-semibold">{filteredTickets.length}</span> de {tickets.length} {tickets.length === 1 ? 'chamado' : 'chamados'}
                </p>
                <div className="flex items-center gap-2 text-xs text-base-content/50">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                  Auto-atualização ativa
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredTickets.map((ticket) => (
                  <TicketCard
                    key={ticket._id}
                    ticket={ticket}
                    onClick={handleTicketClick}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {showDetailsModal && selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          currentUser={currentUser}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedTicket(null);
          }}
          onUpdate={handleTicketUpdate}
        />
      )}

      {showCreateModal && (
        <CreateTicketModal
          isOpen={showCreateModal}
          currentUser={currentUser}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            handleTicketUpdate();
          }}
        />
      )}

      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showAdvancedSearch && (
        <AdvancedSearch
          isOpen={showAdvancedSearch}
          onClose={() => setShowAdvancedSearch(false)}
          onResults={(data) => {
            if (data.tickets?.length > 0) {
              setFilteredTickets(data.tickets);
            }
          }}
        />
      )}
    </div>
  );
}
