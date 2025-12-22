// src/views/DepartmentsManagement.jsx - Gerenciamento de Departamentos

import { useState, useEffect } from 'react';
import { departmentsAPI, handleAPIError } from '../services/api';
import Navbar from '../components/Navbar';

// Cores disponíveis para departamentos
const DEPARTMENT_COLORS = [
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Roxo', value: '#8b5cf6' },
  { name: 'Verde', value: '#10b981' },
  { name: 'Laranja', value: '#f59e0b' },
  { name: 'Vermelho', value: '#ef4444' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Ciano', value: '#06b6d4' },
  { name: 'Índigo', value: '#6366f1' }
];

// Ícones disponíveis
const DEPARTMENT_ICONS = [
  { name: 'Suporte', value: 'bx-support' },
  { name: 'Servidor', value: 'bx-server' },
  { name: 'Dinheiro', value: 'bx-dollar-circle' },
  { name: 'Código', value: 'bx-code-alt' },
  { name: 'Prédio', value: 'bx-buildings' },
  { name: 'Usuários', value: 'bx-group' },
  { name: 'Engrenagem', value: 'bx-cog' },
  { name: 'Gráfico', value: 'bx-bar-chart-alt-2' },
  { name: 'Escudo', value: 'bx-shield' },
  { name: 'Rede', value: 'bx-network-chart' },
  { name: 'Nuvem', value: 'bx-cloud' },
  { name: 'Documento', value: 'bx-file' }
];

export default function DepartmentsManagement({ currentUser, onLogout, onNavigate, onGoBack, canGoBack }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  
  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await departmentsAPI.getAllIncludingInactive();
      setDepartments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      const err = handleAPIError(error);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (deptId) => {
    if (!confirm('Deseja realmente desativar este departamento?')) return;
    
    try {
      await departmentsAPI.delete(deptId);
      setSuccess('Departamento desativado com sucesso!');
      loadDepartments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      const err = handleAPIError(error);
      setError(err.message);
    }
  };

  const handleToggleActive = async (dept) => {
    try {
      await departmentsAPI.update(dept._id, { isActive: !dept.isActive });
      setSuccess(`Departamento ${dept.isActive ? 'desativado' : 'ativado'} com sucesso!`);
      loadDepartments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      const err = handleAPIError(error);
      setError(err.message);
    }
  };

  const handleInitialize = async () => {
    try {
      setLoading(true);
      await departmentsAPI.initialize();
      setSuccess('Departamentos padrão criados!');
      loadDepartments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      const err = handleAPIError(error);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-base-200">
      <Navbar currentUser={currentUser} onLogout={onLogout} onNavigate={onNavigate} />
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              {canGoBack && (
                <button onClick={onGoBack} className="btn btn-ghost btn-sm gap-1 mb-2">
                  <i className='bx bx-arrow-back text-lg'></i>
                  Voltar
                </button>
              )}
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <i className='bx bx-buildings text-primary'></i>
                Gerenciar Departamentos
              </h1>
              <p className="text-base-content/60 mt-1">
                Configure os departamentos para organizar sua equipe
              </p>
            </div>
            
            <div className="flex gap-2">
              {departments.length === 0 && (
                <button 
                  className="btn btn-outline gap-2"
                  onClick={handleInitialize}
                  disabled={loading}
                >
                  <i className='bx bx-reset'></i>
                  Criar Padrões
                </button>
              )}
              <button 
                className="btn btn-primary gap-2"
                onClick={() => setShowCreateModal(true)}
              >
                <i className='bx bx-plus text-xl'></i>
                Novo Departamento
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <i className='bx bx-error-circle text-xl'></i>
              <span>{error}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setError('')}>✕</button>
            </div>
          )}
          
          {success && (
            <div className="alert alert-success mb-4">
              <i className='bx bx-check-circle text-xl'></i>
              <span>{success}</span>
            </div>
          )}

          {/* Lista de Departamentos */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : departments.length === 0 ? (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center py-12">
                <i className='bx bx-buildings text-6xl text-base-content/30 mb-4'></i>
                <h3 className="text-xl font-bold">Nenhum departamento cadastrado</h3>
                <p className="text-base-content/60 mb-4">
                  Crie departamentos para organizar sua equipe e chamados
                </p>
                <button 
                  className="btn btn-primary gap-2"
                  onClick={handleInitialize}
                >
                  <i className='bx bx-magic-wand'></i>
                  Criar Departamentos Padrão
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {departments.map((dept, index) => (
                <div 
                  key={dept._id}
                  className={`card bg-base-100 shadow-lg ${!dept.isActive ? 'opacity-60' : ''}`}
                >
                  <div className="card-body p-4">
                    <div className="flex items-center gap-4">
                      {/* Ícone do departamento */}
                      <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0"
                        style={{ backgroundColor: dept.color }}
                      >
                        <i className={`bx ${dept.icon} text-3xl`}></i>
                      </div>
                      
                      {/* Informações */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg">{dept.displayName}</h3>
                          <span className="badge badge-sm">{dept.name}</span>
                          {!dept.isActive && (
                            <span className="badge badge-error badge-sm">Inativo</span>
                          )}
                        </div>
                        <p className="text-sm text-base-content/60 line-clamp-1">
                          {dept.description || 'Sem descrição'}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-base-content/50">
                          <span className="flex items-center gap-1">
                            <i className='bx bx-user'></i>
                            {dept.userCount || 0} usuários
                          </span>
                          <span className="flex items-center gap-1">
                            <i className='bx bx-file'></i>
                            {dept.ticketCount || 0} chamados
                          </span>
                        </div>
                      </div>
                      
                      {/* Ações */}
                      <div className="flex gap-2">
                        <button
                          className="btn btn-ghost btn-sm tooltip"
                          data-tip="Editar"
                          onClick={() => {
                            setSelectedDept(dept);
                            setShowEditModal(true);
                          }}
                        >
                          <i className='bx bx-edit text-lg'></i>
                        </button>
                        <button
                          className={`btn btn-ghost btn-sm tooltip ${dept.isActive ? 'text-warning' : 'text-success'}`}
                          data-tip={dept.isActive ? 'Desativar' : 'Ativar'}
                          onClick={() => handleToggleActive(dept)}
                        >
                          <i className={`bx ${dept.isActive ? 'bx-pause' : 'bx-play'} text-lg`}></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Box */}
          <div className="mt-6 rounded-xl p-4 bg-gradient-to-r from-info/10 to-primary/10 border border-info/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-info to-primary flex items-center justify-center text-white flex-shrink-0">
                <i className='bx bx-bulb text-xl'></i>
              </div>
              <div>
                <p className="font-semibold">Como funcionam os departamentos?</p>
                <ul className="text-sm text-base-content/60 mt-2 space-y-1">
                  <li>• Cada operador pertence a um departamento</li>
                  <li>• Operadores só veem chamados do seu departamento</li>
                  <li>• Masters veem todos os chamados</li>
                  <li>• Ao categorizar um chamado, ele é enviado ao departamento correspondente</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <DepartmentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            setSuccess('Departamento criado com sucesso!');
            loadDepartments();
            setTimeout(() => setSuccess(''), 3000);
          }}
        />
      )}
      
      {showEditModal && selectedDept && (
        <DepartmentModal
          isOpen={showEditModal}
          department={selectedDept}
          onClose={() => {
            setShowEditModal(false);
            setSelectedDept(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedDept(null);
            setSuccess('Departamento atualizado com sucesso!');
            loadDepartments();
            setTimeout(() => setSuccess(''), 3000);
          }}
        />
      )}
    </div>
  );
}

// Modal de Criar/Editar Departamento
function DepartmentModal({ isOpen, department, onClose, onSuccess }) {
  const isEdit = !!department;
  
  const [formData, setFormData] = useState({
    name: department?.name || '',
    displayName: department?.displayName || '',
    description: department?.description || '',
    color: department?.color || '#3b82f6',
    icon: department?.icon || 'bx-buildings',
    email: department?.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        await departmentsAPI.update(department._id, formData);
      } else {
        await departmentsAPI.create(formData);
      }
      onSuccess();
    } catch (error) {
      const err = handleAPIError(error);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div 
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg"
            style={{ backgroundColor: formData.color }}
          >
            <i className={`bx ${formData.icon} text-3xl`}></i>
          </div>
          <div>
            <h3 className="font-bold text-xl">
              {isEdit ? 'Editar Departamento' : 'Novo Departamento'}
            </h3>
            <p className="text-sm text-base-content/60">
              {isEdit ? 'Atualize as informações do departamento' : 'Crie um novo departamento para sua equipe'}
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <i className='bx bx-error-circle'></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Código (ID) *</span>
              </label>
              <input
                type="text"
                className="input input-bordered uppercase"
                placeholder="Ex: SUPORTE"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                required
                disabled={loading || isEdit}
              />
              <label className="label">
                <span className="label-text-alt">Usado internamente</span>
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Nome de Exibição *</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="Ex: Suporte Técnico"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Descrição</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              placeholder="Descreva a função deste departamento..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={loading}
              rows={2}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Email do Departamento</span>
            </label>
            <input
              type="email"
              className="input input-bordered"
              placeholder="suporte@empresa.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={loading}
            />
            <label className="label">
              <span className="label-text-alt">Opcional - para notificações</span>
            </label>
          </div>

          {/* Cor */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Cor do Departamento</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {DEPARTMENT_COLORS.map(color => (
                <button
                  key={color.value}
                  type="button"
                  className={`w-10 h-10 rounded-lg transition-all ${
                    formData.color === color.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  disabled={loading}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Ícone */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Ícone</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {DEPARTMENT_ICONS.map(icon => (
                <button
                  key={icon.value}
                  type="button"
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    formData.icon === icon.value 
                      ? 'bg-primary text-white ring-2 ring-offset-2 ring-primary' 
                      : 'bg-base-200 hover:bg-base-300'
                  }`}
                  onClick={() => setFormData({ ...formData, icon: icon.value })}
                  disabled={loading}
                  title={icon.name}
                >
                  <i className={`bx ${icon.value} text-xl`}></i>
                </button>
              ))}
            </div>
          </div>

          {/* Info sobre SLA */}
          <div className="bg-info/10 border border-info/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <i className='bx bx-info-circle text-info text-lg'></i>
              <div className="text-sm">
                <p className="font-medium text-info">Sobre o SLA</p>
                <p className="text-base-content/60">
                  O SLA é configurado por <strong>categoria</strong>, não por departamento.
                  Acesse Categorias para configurar os tempos de resposta e resolução.
                </p>
              </div>
            </div>
          </div>

          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  {isEdit ? 'Salvando...' : 'Criando...'}
                </>
              ) : (
                isEdit ? 'Salvar' : 'Criar Departamento'
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
