// src/components/SearchAndFilters.jsx - CORRIGIDO

import { useState, useEffect } from 'react';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../constants/system';

export default function SearchAndFilters({ 
  tickets, 
  onFilteredResults,
  categories = [],
  operators = []
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, priorityFilter, categoryFilter, assignedFilter, tickets]);

  const applyFilters = () => {
    let filtered = [...tickets];

    // Busca por texto
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(ticket => 
        ticket.ticketNumber?.toString().includes(term) ||
        ticket.title?.toLowerCase().includes(term) ||
        ticket.description?.toLowerCase().includes(term) ||
        ticket.client?.name?.toLowerCase().includes(term) ||
        ticket.client?.email?.toLowerCase().includes(term)
      );
    }

    // Filtro de status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    // Filtro de prioridade
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }

    // Filtro de categoria (corrigido para department)
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.category?.department === categoryFilter);
    }

    // Filtro de atribuído (CORRIGIDO - usa userId)
    if (assignedFilter !== 'all') {
      if (assignedFilter === 'unassigned') {
        filtered = filtered.filter(ticket => !ticket.assignedTo?.userId);
      } else {
        filtered = filtered.filter(ticket => {
          const ticketUserId = ticket.assignedTo?.userId?.toString() || ticket.assignedTo?.userId;
          return ticketUserId === assignedFilter;
        });
      }
    }

    onFilteredResults(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
    setAssignedFilter('all');
  };

  const activeFiltersCount = [
    statusFilter !== 'all',
    priorityFilter !== 'all',
    categoryFilter !== 'all',
    assignedFilter !== 'all',
    searchTerm.trim() !== ''
  ].filter(Boolean).length;

  // Extrai departamentos únicos das categorias
  const uniqueDepartments = [...new Set(categories.map(c => c.department).filter(Boolean))];

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Buscar por número, título, descrição ou cliente..."
            className="input input-bordered w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className='bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40'></i>
          {searchTerm && (
            <button 
              className="btn btn-ghost btn-sm btn-circle absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setSearchTerm('')}
            >
              <i className='bx bx-x text-lg'></i>
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'} gap-2`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <i className='bx bx-filter-alt'></i>
            <span className="hidden sm:inline">Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="badge badge-sm badge-secondary">{activeFiltersCount}</span>
            )}
          </button>

          {activeFiltersCount > 0 && (
            <button
              className="btn btn-ghost gap-2"
              onClick={clearFilters}
              title="Limpar todos os filtros"
            >
              <i className='bx bx-x'></i>
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Filtros Avançados */}
      {showFilters && (
        <div className="card bg-base-100 shadow-sm border border-base-200 animate-fadeIn">
          <div className="card-body p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold flex items-center gap-2">
                <i className='bx bx-filter text-primary'></i>
                Filtros Avançados
              </h4>
              <button 
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setShowFilters(false)}
              >
                <i className='bx bx-x'></i>
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-medium">Status</span>
                </label>
                <select
                  className="select select-bordered select-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Todos os status</option>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prioridade */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-medium">Prioridade</span>
                </label>
                <select
                  className="select select-bordered select-sm"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="all">Todas as prioridades</option>
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Departamento */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-medium">Departamento</span>
                </label>
                <select
                  className="select select-bordered select-sm"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">Todos os departamentos</option>
                  {uniqueDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Atribuído */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs font-medium">Responsável</span>
                </label>
                <select
                  className="select select-bordered select-sm"
                  value={assignedFilter}
                  onChange={(e) => setAssignedFilter(e.target.value)}
                >
                  <option value="all">Todos os responsáveis</option>
                  <option value="unassigned">⚠️ Sem responsável</option>
                  {operators.map((op) => (
                    <option key={op._id} value={op._id}>
                      {op.displayName || op.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags de filtros ativos */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-base-200">
                <span className="text-xs text-base-content/60">Filtros ativos:</span>
                {searchTerm && (
                  <span className="badge badge-sm gap-1">
                    Busca: "{searchTerm}"
                    <button onClick={() => setSearchTerm('')}>
                      <i className='bx bx-x'></i>
                    </button>
                  </span>
                )}
                {statusFilter !== 'all' && (
                  <span className="badge badge-sm gap-1">
                    Status: {STATUS_CONFIG[statusFilter]?.label}
                    <button onClick={() => setStatusFilter('all')}>
                      <i className='bx bx-x'></i>
                    </button>
                  </span>
                )}
                {priorityFilter !== 'all' && (
                  <span className="badge badge-sm gap-1">
                    Prioridade: {PRIORITY_CONFIG[priorityFilter]?.label}
                    <button onClick={() => setPriorityFilter('all')}>
                      <i className='bx bx-x'></i>
                    </button>
                  </span>
                )}
                {categoryFilter !== 'all' && (
                  <span className="badge badge-sm gap-1">
                    Depto: {categoryFilter}
                    <button onClick={() => setCategoryFilter('all')}>
                      <i className='bx bx-x'></i>
                    </button>
                  </span>
                )}
                {assignedFilter !== 'all' && (
                  <span className="badge badge-sm gap-1">
                    Responsável: {assignedFilter === 'unassigned' ? 'Sem responsável' : operators.find(o => o._id === assignedFilter)?.displayName}
                    <button onClick={() => setAssignedFilter('all')}>
                      <i className='bx bx-x'></i>
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
