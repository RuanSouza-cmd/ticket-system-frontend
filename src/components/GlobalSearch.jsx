// src/components/GlobalSearch.jsx - Busca Global de Tickets

import { useState, useRef, useEffect } from 'react';
import { ticketsAPI, handleAPIError } from '../services/api';

export default function GlobalSearch({ onSelectTicket }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Atalho de teclado (Ctrl+K ou Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
        setResults([]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Busca com debounce
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError('');
      
      try {
        const response = await ticketsAPI.searchGlobal(query);
        setResults(response.data.tickets || []);
      } catch (err) {
        const apiError = handleAPIError(err);
        setError(apiError.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (ticket) => {
    if (onSelectTicket) {
      onSelectTicket(ticket);
    }
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'aberto': { bg: 'bg-info text-info-content', label: 'Aberto' },
      'em-andamento': { bg: 'bg-warning text-warning-content', label: 'Em Andamento' },
      'aguardando-cliente': { bg: 'bg-secondary text-secondary-content', label: 'Aguardando' },
      'resolvido': { bg: 'bg-success text-success-content', label: 'Resolvido' },
      'fechado': { bg: 'bg-base-300 text-base-content', label: 'Fechado' }
    };
    const config = statusConfig[status] || statusConfig['aberto'];
    return (
      <span className={`badge badge-sm ${config.bg}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityIndicator = (priority) => {
    const colors = {
      'critica': 'bg-error',
      'alta': 'bg-warning',
      'media': 'bg-info',
      'baixa': 'bg-success'
    };
    return <span className={`w-2 h-2 rounded-full ${colors[priority] || 'bg-base-300'}`}></span>;
  };

  return (
    <>
      {/* Botão de busca na navbar */}
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="btn btn-ghost btn-sm gap-2"
      >
        <i className='bx bx-search text-lg'></i>
        <span className="hidden sm:inline">Buscar</span>
        <kbd className="kbd kbd-sm hidden md:inline">⌘K</kbd>
      </button>

      {/* Modal de busca */}
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[10vh] bg-black/50 backdrop-blur-sm">
          <div 
            ref={containerRef}
            className="w-full max-w-2xl mx-4 bg-base-100 rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Input de busca */}
            <div className="flex items-center gap-3 p-4 border-b border-base-300">
              <i className={`bx ${loading ? 'bx-loader-alt animate-spin' : 'bx-search'} text-xl text-base-content/50`}></i>
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar por número (ex: 2024-0001), título, cliente..."
                className="flex-1 bg-transparent outline-none text-lg"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              <kbd className="kbd kbd-sm">ESC</kbd>
            </div>

            {/* Resultados */}
            <div className="max-h-[60vh] overflow-y-auto">
              {error && (
                <div className="p-4 text-error text-center">
                  <i className='bx bx-error-circle mr-2'></i>
                  {error}
                </div>
              )}

              {!error && query.length < 2 && (
                <div className="p-8 text-center text-base-content/50">
                  <i className='bx bx-search text-4xl mb-2'></i>
                  <p>Digite pelo menos 2 caracteres para buscar</p>
                  <p className="text-sm mt-2">
                    Dica: busque pelo número exato do ticket (ex: 2024-0001)
                  </p>
                </div>
              )}

              {!error && query.length >= 2 && !loading && results.length === 0 && (
                <div className="p-8 text-center text-base-content/50">
                  <i className='bx bx-search-alt text-4xl mb-2'></i>
                  <p>Nenhum resultado encontrado para "{query}"</p>
                </div>
              )}

              {results.length > 0 && (
                <ul className="menu p-2">
                  {results.map((ticket) => (
                    <li key={ticket._id}>
                      <button
                        onClick={() => handleSelect(ticket)}
                        className="flex items-start gap-3 p-3 hover:bg-base-200 rounded-lg"
                      >
                        {getPriorityIndicator(ticket.priority)}
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-primary font-semibold">
                              #{ticket.ticketNumber}
                            </span>
                            {getStatusBadge(ticket.status)}
                          </div>
                          <p className="font-medium truncate mt-1">{ticket.title}</p>
                          <div className="flex items-center gap-3 text-xs text-base-content/60 mt-1">
                            <span className="flex items-center gap-1">
                              <i className='bx bx-user'></i>
                              {ticket.client?.name || 'Sem cliente'}
                            </span>
                            <span className="flex items-center gap-1">
                              <i className='bx bx-folder'></i>
                              {ticket.category?.department || 'Não categorizado'}
                            </span>
                            <span className="flex items-center gap-1">
                              <i className='bx bx-time'></i>
                              {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                        <i className='bx bx-chevron-right text-xl text-base-content/30'></i>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-3 border-t border-base-300 bg-base-200/50 text-xs text-base-content/60">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="kbd kbd-xs">↑</kbd>
                  <kbd className="kbd kbd-xs">↓</kbd>
                  para navegar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="kbd kbd-xs">Enter</kbd>
                  para selecionar
                </span>
              </div>
              <span>
                {results.length > 0 && `${results.length} resultado${results.length > 1 ? 's' : ''}`}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
