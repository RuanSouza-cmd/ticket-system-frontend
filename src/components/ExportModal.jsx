// src/components/ExportModal.jsx

import { useState } from 'react';
import { ticketsAPI, handleAPIError } from '../services/api';
import toast from 'react-hot-toast';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../constants/system';

export default function ExportModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    department: '',
    startDate: '',
    endDate: ''
  });
  const [format, setFormat] = useState('csv');

  const handleExport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.department) params.department = filters.department;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      let response;
      if (format === 'csv') {
        response = await ticketsAPI.exportCSV(params);
      } else {
        response = await ticketsAPI.exportJSON(params);
      }

      // Cria blob e faz download
      const blob = new Blob([response.data], { 
        type: format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tickets-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Exportação concluída!');
      onClose();
    } catch (error) {
      toast.error(handleAPIError(error).message);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      department: '',
      startDate: '',
      endDate: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-xl flex items-center gap-2">
            <i className='bx bx-export text-2xl text-primary'></i>
            Exportar Relatório
          </h3>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <i className='bx bx-x text-xl'></i>
          </button>
        </div>

        <div className="space-y-4">
          {/* Formato */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Formato do Arquivo</span>
            </label>
            <div className="flex gap-4">
              <label className="label cursor-pointer gap-2">
                <input
                  type="radio"
                  name="format"
                  className="radio radio-primary"
                  checked={format === 'csv'}
                  onChange={() => setFormat('csv')}
                />
                <span className="label-text flex items-center gap-1">
                  <i className='bx bx-file text-green-500'></i>
                  CSV (Excel)
                </span>
              </label>
              <label className="label cursor-pointer gap-2">
                <input
                  type="radio"
                  name="format"
                  className="radio radio-primary"
                  checked={format === 'json'}
                  onChange={() => setFormat('json')}
                />
                <span className="label-text flex items-center gap-1">
                  <i className='bx bx-code-alt text-blue-500'></i>
                  JSON
                </span>
              </label>
            </div>
          </div>

          <div className="divider">Filtros (opcional)</div>

          {/* Status */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Status</span>
            </label>
            <select
              className="select select-bordered"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">Todos os status</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          {/* Prioridade */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Prioridade</span>
            </label>
            <select
              className="select select-bordered"
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            >
              <option value="">Todas as prioridades</option>
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          {/* Departamento */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Departamento</span>
            </label>
            <select
              className="select select-bordered"
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            >
              <option value="">Todos os departamentos</option>
              <option value="SUPORTE">Suporte</option>
              <option value="FINANCEIRO">Financeiro</option>
              <option value="INFRA">Infraestrutura</option>
              <option value="DESENVOLVIMENTO">Desenvolvimento</option>
            </select>
          </div>

          {/* Período */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Data Início</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Data Fim</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
          </div>

          {/* Resumo dos filtros */}
          {(filters.status || filters.priority || filters.department || filters.startDate || filters.endDate) && (
            <div className="alert alert-info">
              <i className='bx bx-filter-alt'></i>
              <div>
                <p className="text-sm">Filtros ativos:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {filters.status && <span className="badge badge-sm">{STATUS_CONFIG[filters.status]?.label}</span>}
                  {filters.priority && <span className="badge badge-sm">{PRIORITY_CONFIG[filters.priority]?.label}</span>}
                  {filters.department && <span className="badge badge-sm">{filters.department}</span>}
                  {filters.startDate && <span className="badge badge-sm">De: {filters.startDate}</span>}
                  {filters.endDate && <span className="badge badge-sm">Até: {filters.endDate}</span>}
                </div>
              </div>
              <button className="btn btn-ghost btn-xs" onClick={clearFilters}>
                Limpar
              </button>
            </div>
          )}
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="btn btn-primary gap-2"
            onClick={handleExport}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Exportando...
              </>
            ) : (
              <>
                <i className='bx bx-download'></i>
                Exportar {format.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/50" onClick={onClose}></div>
    </div>
  );
}
