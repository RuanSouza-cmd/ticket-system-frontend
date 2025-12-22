// src/components/AdvancedSearch.jsx - Pesquisa Avançada de Tickets

import { useState, useEffect } from 'react';
import { ticketsAPI, categoriesAPI, usersAPI, departmentsAPI, handleAPIError } from '../services/api';
import { STATUS_CONFIG, PRIORITY_CONFIG, formatDate } from '../constants/system';
import toast from 'react-hot-toast';

export default function AdvancedSearch({ isOpen, onClose, onResults }) {
  const [filters, setFilters] = useState({
    text: '',
    searchIn: ['title', 'description', 'ticketNumber', 'client.name', 'client.email'],
    dateFrom: '',
    dateTo: '',
    dateField: 'createdAt',
    statuses: [],
    priorities: [],
    departments: [],
    assignedTo: '',
    clientName: '',
    clientEmail: '',
    clientCompany: '',
    slaStatus: '',
    hasAttachments: '',
    source: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [loading, setLoading] = useState(false);
  const [operators, setOperators] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFilterOptions();
    }
  }, [isOpen]);

  const loadFilterOptions = async () => {
    try {
      const [operatorsRes, deptsRes] = await Promise.all([
        usersAPI.getAll(),
        departmentsAPI.getAll()
      ]);
      
      setOperators((operatorsRes.data || []).filter(u => 
        (u.role === 'operator' || u.role === 'master') && u.isActive
      ));
      setDepartments(deptsRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar opções:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Remove filtros vazios
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => {
          if (Array.isArray(v)) return v.length > 0;
          return v !== '' && v !== null && v !== undefined;
        })
      );

      // Converte hasAttachments para boolean se necessário
      if (cleanFilters.hasAttachments === 'true') cleanFilters.hasAttachments = true;
      else if (cleanFilters.hasAttachments === 'false') cleanFilters.hasAttachments = false;
      else delete cleanFilters.hasAttachments;

      const response = await ticketsAPI.searchAdvanced(cleanFilters);
      setResults(response.data);
      setShowResults(true);
      
      if (response.data.tickets.length === 0) {
        toast('Nenhum resultado encontrado', { icon: '🔍' });
      } else {
        toast.success(`${response.data.pagination.total} resultado(s) encontrado(s)`);
      }
      
      onResults?.(response.data);
    } catch (error) {
      const err = handleAPIError(error);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFilters({
      text: '',
      searchIn: ['title', 'description', 'ticketNumber', 'client.name', 'client.email'],
      dateFrom: '',
      dateTo: '',
      dateField: 'createdAt',
      statuses: [],
      priorities: [],
      departments: [],
      assignedTo: '',
      clientName: '',
      clientEmail: '',
      clientCompany: '',
      slaStatus: '',
      hasAttachments: '',
      source: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setResults(null);
    setShowResults(false);
  };

  const toggleArrayFilter = (field, value) => {
    setFilters(prev => {
      const current = prev[field] || [];
      const newArray = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [field]: newArray };
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.text) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.statuses.length > 0) count++;
    if (filters.priorities.length > 0) count++;
    if (filters.departments.length > 0) count++;
    if (filters.assignedTo) count++;
    if (filters.clientName || filters.clientEmail || filters.clientCompany) count++;
    if (filters.slaStatus) count++;
    if (filters.hasAttachments) count++;
    if (filters.source) count++;
    return count;
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-base-100 py-2 -mt-2 border-b border-base-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
              <i className='bx bx-search-alt text-2xl'></i>
            </div>
            <div>
              <h3 className="font-bold text-xl">Pesquisa Avançada</h3>
              <p className="text-sm text-base-content/60">
                {getActiveFiltersCount() > 0 
                  ? `${getActiveFiltersCount()} filtro(s) ativo(s)` 
                  : 'Configure os filtros para buscar tickets'
                }
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <i className='bx bx-x text-xl'></i>
          </button>
        </div>

        <div className="space-y-6">
          {/* Busca por Texto */}
          <div className="card bg-base-200 p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <i className='bx bx-text'></i>
              Busca por Texto
            </h4>
            <div className="form-control">
              <input
                type="text"
                className="input input-bordered"
                placeholder="Digite para buscar..."
                value={filters.text}
                onChange={(e) => setFilters({ ...filters, text: e.target.value })}
              />
            </div>
            <div className="mt-3">
              <p className="text-xs text-base-content/60 mb-2">Buscar em:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'title', label: 'Título' },
                  { id: 'description', label: 'Descrição' },
                  { id: 'ticketNumber', label: 'Número' },
                  { id: 'client.name', label: 'Nome Cliente' },
                  { id: 'client.email', label: 'Email Cliente' },
                  { id: 'comments', label: 'Comentários' }
                ].map(opt => (
                  <label key={opt.id} className="label cursor-pointer gap-2 bg-base-100 px-3 py-1 rounded-lg">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs checkbox-primary"
                      checked={filters.searchIn.includes(opt.id)}
                      onChange={() => toggleArrayFilter('searchIn', opt.id)}
                    />
                    <span className="text-xs">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Filtros de Data */}
          <div className="card bg-base-200 p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <i className='bx bx-calendar'></i>
              Período
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">Campo</span></label>
                <select
                  className="select select-bordered select-sm"
                  value={filters.dateField}
                  onChange={(e) => setFilters({ ...filters, dateField: e.target.value })}
                >
                  <option value="createdAt">Data de Criação</option>
                  <option value="updatedAt">Última Atualização</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">De</span></label>
                <input
                  type="date"
                  className="input input-bordered input-sm"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">Até</span></label>
                <input
                  type="date"
                  className="input input-bordered input-sm"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Status e Prioridade */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div className="card bg-base-200 p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <i className='bx bx-loader-circle'></i>
                Status
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    className={`badge gap-1 cursor-pointer transition-all ${
                      filters.statuses.includes(key)
                        ? config.badgeClass
                        : 'badge-ghost opacity-50 hover:opacity-100'
                    }`}
                    onClick={() => toggleArrayFilter('statuses', key)}
                  >
                    <i className={config.icon}></i>
                    {config.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Prioridade */}
            <div className="card bg-base-200 p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <i className='bx bx-flag'></i>
                Prioridade
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    className={`badge gap-1 cursor-pointer transition-all ${
                      filters.priorities.includes(key)
                        ? config.badgeClass
                        : 'badge-ghost opacity-50 hover:opacity-100'
                    }`}
                    onClick={() => toggleArrayFilter('priorities', key)}
                  >
                    <i className={config.icon}></i>
                    {config.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Departamento e Atribuição */}
          <div className="grid grid-cols-2 gap-4">
            {/* Departamento */}
            <div className="card bg-base-200 p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <i className='bx bx-buildings'></i>
                Departamento
              </h4>
              <div className="flex flex-wrap gap-2">
                {departments.map(dept => (
                  <button
                    key={dept._id}
                    className={`badge gap-1 cursor-pointer transition-all ${
                      filters.departments.includes(dept.name)
                        ? 'badge-primary'
                        : 'badge-ghost opacity-50 hover:opacity-100'
                    }`}
                    onClick={() => toggleArrayFilter('departments', dept.name)}
                    style={filters.departments.includes(dept.name) ? { backgroundColor: dept.color, borderColor: dept.color } : {}}
                  >
                    <i className={`bx ${dept.icon}`}></i>
                    {dept.displayName}
                  </button>
                ))}
              </div>
            </div>

            {/* Atribuição */}
            <div className="card bg-base-200 p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <i className='bx bx-user'></i>
                Atribuído a
              </h4>
              <select
                className="select select-bordered select-sm w-full"
                value={filters.assignedTo}
                onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
              >
                <option value="">Qualquer</option>
                <option value="unassigned">Sem atribuição</option>
                <option value="me">Meus tickets</option>
                <optgroup label="Operadores">
                  {operators.map(op => (
                    <option key={op._id} value={op._id}>
                      {op.displayName || op.email}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Filtros de Cliente */}
          <div className="card bg-base-200 p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <i className='bx bx-user-circle'></i>
              Filtros de Cliente
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">Nome</span></label>
                <input
                  type="text"
                  className="input input-bordered input-sm"
                  placeholder="Nome do cliente"
                  value={filters.clientName}
                  onChange={(e) => setFilters({ ...filters, clientName: e.target.value })}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">Email</span></label>
                <input
                  type="text"
                  className="input input-bordered input-sm"
                  placeholder="email@exemplo.com"
                  value={filters.clientEmail}
                  onChange={(e) => setFilters({ ...filters, clientEmail: e.target.value })}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">Empresa</span></label>
                <input
                  type="text"
                  className="input input-bordered input-sm"
                  placeholder="Nome da empresa"
                  value={filters.clientCompany}
                  onChange={(e) => setFilters({ ...filters, clientCompany: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Filtros Adicionais */}
          <div className="grid grid-cols-3 gap-4">
            {/* SLA */}
            <div className="form-control">
              <label className="label"><span className="label-text text-xs">Status SLA</span></label>
              <select
                className="select select-bordered select-sm"
                value={filters.slaStatus}
                onChange={(e) => setFilters({ ...filters, slaStatus: e.target.value })}
              >
                <option value="">Qualquer</option>
                <option value="ok">✅ Dentro do SLA</option>
                <option value="at-risk">⚠️ Em risco</option>
                <option value="breached">❌ Estourado</option>
              </select>
            </div>

            {/* Anexos */}
            <div className="form-control">
              <label className="label"><span className="label-text text-xs">Anexos</span></label>
              <select
                className="select select-bordered select-sm"
                value={filters.hasAttachments}
                onChange={(e) => setFilters({ ...filters, hasAttachments: e.target.value })}
              >
                <option value="">Qualquer</option>
                <option value="true">Com anexos</option>
                <option value="false">Sem anexos</option>
              </select>
            </div>

            {/* Origem */}
            <div className="form-control">
              <label className="label"><span className="label-text text-xs">Origem</span></label>
              <select
                className="select select-bordered select-sm"
                value={filters.source}
                onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              >
                <option value="">Qualquer</option>
                <option value="web">🌐 Web</option>
                <option value="email">📧 Email</option>
                <option value="api">🔗 API</option>
                <option value="phone">📞 Telefone</option>
              </select>
            </div>
          </div>

          {/* Ordenação */}
          <div className="card bg-base-200 p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <i className='bx bx-sort'></i>
              Ordenação
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">Ordenar por</span></label>
                <select
                  className="select select-bordered select-sm"
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                >
                  <option value="createdAt">Data de Criação</option>
                  <option value="updatedAt">Última Atualização</option>
                  <option value="priority">Prioridade</option>
                  <option value="status">Status</option>
                  <option value="ticketNumber">Número</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">Direção</span></label>
                <select
                  className="select select-bordered select-sm"
                  value={filters.sortOrder}
                  onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value })}
                >
                  <option value="desc">Mais recentes primeiro</option>
                  <option value="asc">Mais antigos primeiro</option>
                </select>
              </div>
            </div>
          </div>

          {/* Resultados */}
          {showResults && results && (
            <div className="card bg-success/10 border border-success/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <i className='bx bx-check-circle text-success text-2xl'></i>
                  <div>
                    <p className="font-bold text-success">{results.pagination.total} resultado(s)</p>
                    <p className="text-xs text-base-content/60">
                      Página {results.pagination.page} de {results.pagination.totalPages}
                    </p>
                  </div>
                </div>
                {results.stats && (
                  <div className="flex gap-4 text-xs">
                    {Object.entries(results.stats.byStatus || {}).slice(0, 3).map(([status, count]) => (
                      <span key={status} className="badge badge-sm">
                        {STATUS_CONFIG[status]?.label || status}: {count}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="modal-action sticky bottom-0 bg-base-100 pt-4 border-t border-base-200 mt-6 -mb-2">
          <button className="btn btn-ghost" onClick={handleClear}>
            <i className='bx bx-eraser mr-1'></i>
            Limpar
          </button>
          <button className="btn btn-ghost" onClick={onClose}>
            Fechar
          </button>
          <button 
            className="btn btn-primary gap-1" 
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <i className='bx bx-search'></i>
            )}
            Pesquisar
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
