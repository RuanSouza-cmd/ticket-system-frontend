// src/views/CategoriesManagement.jsx - COM BOTÃO VOLTAR

import { useState, useEffect } from 'react';
import { categoriesAPI, handleAPIError } from '../services/api';
import Navbar from '../components/Navbar';

export default function CategoriesManagement({ currentUser, onLogout, onNavigate, onGoBack, canGoBack }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await categoriesAPI.getAll();
      const data = Array.isArray(response.data) ? response.data : [];
      setCategories(data);
    } catch (error) {
      const err = handleAPIError(error);
      setError(err.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!confirm('Deseja realmente excluir esta categoria?')) return;
    
    setError('');
    
    try {
      await categoriesAPI.delete(categoryId);
      setSuccess('Categoria excluída com sucesso!');
      loadCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      const err = handleAPIError(error);
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-base-200">
      <Navbar currentUser={currentUser} onLogout={onLogout} onNavigate={onNavigate} />
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header com botão voltar */}
          <div className="flex items-center justify-between mb-6">
            <div>
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
                <i className='bx bx-category text-primary'></i>
                Gerenciar Categorias
              </h1>
              <p className="text-base-content/60 mt-1">
                Configure categorias e SLAs do sistema
              </p>
            </div>
            
            <button 
              className="btn btn-primary gap-2"
              onClick={() => setShowCreateModal(true)}
            >
              <i className='bx bx-plus text-xl'></i>
              Nova Categoria
            </button>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <i className='bx bx-error-circle text-xl'></i>
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="alert alert-success mb-4">
              <i className='bx bx-check-circle text-xl'></i>
              <span>{success}</span>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-figure text-primary">
                <i className='bx bx-folder text-4xl'></i>
              </div>
              <div className="stat-title">Total</div>
              <div className="stat-value text-primary">{Array.isArray(categories) ? categories.length : 0}</div>
            </div>
            
            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-figure text-success">
                <i className='bx bx-check-circle text-4xl'></i>
              </div>
              <div className="stat-title">Ativas</div>
              <div className="stat-value text-success">
                {Array.isArray(categories) ? categories.filter(c => c.isActive).length : 0}
              </div>
            </div>
            
            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-figure text-warning">
                <i className='bx bx-lock text-4xl'></i>
              </div>
              <div className="stat-title">Restritas</div>
              <div className="stat-value text-warning">
                {Array.isArray(categories) ? categories.filter(c => c.isMasterOnly).length : 0}
              </div>
            </div>
            
            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-figure text-info">
                <i className='bx bx-time text-4xl'></i>
              </div>
              <div className="stat-title">SLA Médio</div>
              <div className="stat-value text-info">
                {Array.isArray(categories) && categories.length > 0 
                  ? Math.round(categories.reduce((acc, c) => acc + (c.sla?.resolutionHours || 0), 0) / categories.length)
                  : 0}h
              </div>
            </div>
          </div>

          {/* Tabela de Categorias */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-12 text-base-content/60">
                  <i className='bx bx-folder-x text-6xl mb-4'></i>
                  <p>Nenhuma categoria cadastrada</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Categoria</th>
                        <th>Departamento</th>
                        <th>SLA</th>
                        <th>Restrições</th>
                        <th>Status</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
                        <tr key={category._id} className={!category.isActive ? 'opacity-50' : ''}>
                          <td>
                            <div>
                              <div className="font-bold">
                                {category.type} - {category.system}
                              </div>
                              <div className="text-xs opacity-70">
                                {category.description}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="badge badge-primary">
                              {category.department}
                            </div>
                          </td>
                          <td>
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <i className='bx bx-time-five'></i>
                                Resposta: {category.sla?.firstResponseHours || 0}h
                              </div>
                              <div className="flex items-center gap-1">
                                <i className='bx bx-check-circle'></i>
                                Resolução: {category.sla?.resolutionHours || 0}h
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="flex flex-col gap-1">
                              {category.isMasterOnly && (
                                <span className="badge badge-warning badge-xs gap-1">
                                  <i className='bx bx-lock'></i>
                                  Master Only
                                </span>
                              )}
                              {!category.allowManualCreation && (
                                <span className="badge badge-ghost badge-xs gap-1">
                                  <i className='bx bx-block'></i>
                                  Sem criação manual
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            {category.isActive ? (
                              <span className="badge badge-success gap-1">
                                <i className='bx bx-check-circle'></i>
                                Ativa
                              </span>
                            ) : (
                              <span className="badge badge-error gap-1">
                                <i className='bx bx-x-circle'></i>
                                Inativa
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => {
                                  setSelectedCategory(category);
                                  setShowEditModal(true);
                                }}
                                title="Editar"
                              >
                                <i className='bx bx-edit text-lg'></i>
                              </button>
                              <button
                                className="btn btn-ghost btn-xs text-error"
                                onClick={() => handleDelete(category._id)}
                                title="Excluir"
                              >
                                <i className='bx bx-trash text-lg'></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CategoryModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            setSuccess('Categoria criada com sucesso!');
            loadCategories();
            setTimeout(() => setSuccess(''), 3000);
          }}
        />
      )}

      {showEditModal && selectedCategory && (
        <CategoryModal
          isOpen={showEditModal}
          category={selectedCategory}
          isEdit={true}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCategory(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedCategory(null);
            setSuccess('Categoria atualizada com sucesso!');
            loadCategories();
            setTimeout(() => setSuccess(''), 3000);
          }}
        />
      )}
    </div>
  );
}

function CategoryModal({ isOpen, category = null, isEdit = false, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    department: category?.department || '',
    type: category?.type || '',
    system: category?.system || '',
    description: category?.description || '',
    sla: {
      firstResponseHours: category?.sla?.firstResponseHours || 4,
      resolutionHours: category?.sla?.resolutionHours || 24
    },
    isMasterOnly: category?.isMasterOnly || false,
    allowManualCreation: category?.allowManualCreation !== false,
    isActive: category?.isActive !== false,
    responsibleTeam: category?.responsibleTeam || '',
    displayOrder: category?.displayOrder || 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit && category) {
        await categoriesAPI.update(category._id, formData);
      } else {
        await categoriesAPI.create(formData);
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
        <h3 className="font-bold text-lg mb-4">
          {isEdit ? 'Editar Categoria' : 'Nova Categoria'}
        </h3>

        {error && (
          <div className="alert alert-error mb-4">
            <i className='bx bx-error-circle'></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Departamento *</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="Ex: TI"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Tipo *</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="Ex: Erro"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Sistema *</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="Ex: Website"
                value={formData.system}
                onChange={(e) => setFormData({ ...formData, system: e.target.value })}
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
              placeholder="Descreva esta categoria..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={loading}
              rows={2}
            />
          </div>

          <div className="divider">SLA (Service Level Agreement)</div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Primeira Resposta (horas) *</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={formData.sla.firstResponseHours}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  sla: { ...formData.sla, firstResponseHours: parseFloat(e.target.value) }
                })}
                required
                disabled={loading}
                min="0.5"
                step="0.5"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Resolução (horas) *</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={formData.sla.resolutionHours}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  sla: { ...formData.sla, resolutionHours: parseFloat(e.target.value) }
                })}
                required
                disabled={loading}
                min="1"
                step="1"
              />
            </div>
          </div>

          <div className="divider">Configurações Avançadas</div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Equipe Responsável</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              placeholder="Ex: Time de Infraestrutura"
              value={formData.responsibleTeam}
              onChange={(e) => setFormData({ ...formData, responsibleTeam: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Ordem de Exibição</span>
            </label>
            <input
              type="number"
              className="input input-bordered"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={formData.isMasterOnly}
                  onChange={(e) => setFormData({ ...formData, isMasterOnly: e.target.checked })}
                  disabled={loading}
                />
                <div>
                  <span className="label-text font-semibold">Apenas Master</span>
                  <p className="text-xs text-base-content/60">
                    Apenas Masters podem criar tickets nesta categoria
                  </p>
                </div>
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={formData.allowManualCreation}
                  onChange={(e) => setFormData({ ...formData, allowManualCreation: e.target.checked })}
                  disabled={loading}
                />
                <div>
                  <span className="label-text font-semibold">Permitir Criação Manual</span>
                  <p className="text-xs text-base-content/60">
                    Usuários podem criar tickets manualmente nesta categoria
                  </p>
                </div>
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  disabled={loading}
                />
                <div>
                  <span className="label-text font-semibold">Categoria Ativa</span>
                  <p className="text-xs text-base-content/60">
                    Categoria visível e disponível para uso
                  </p>
                </div>
              </label>
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
                isEdit ? 'Salvar' : 'Criar Categoria'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
