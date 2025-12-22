// src/components/CreateTicketModal.jsx

import { useState, useEffect } from 'react';
import { categoriesAPI, ticketsAPI, handleAPIError } from '../services/api';
import { PRIORITY_CONFIG, PRIORITY } from '../constants/system';

export default function CreateTicketModal({ isOpen, onClose, onSuccess, currentUser }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client: {
      name: '',
      email: '',
      company: ''
    },
    categoryId: '',
    priority: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [groupedCategories, setGroupedCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      resetForm();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getForCreation();
      const data = response.data;
      
      setCategories(data.categories || []);
      setGroupedCategories(data.grouped || {});
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      const err = handleAPIError(error);
      setErrors([err.message]);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      client: {
        name: '',
        email: '',
        company: ''
      },
      categoryId: '',
      priority: ''
    });
    setSelectedCategory(null);
    setErrors([]);
  };

  const handleCategoryChange = (categoryId) => {
    const category = categories.find(c => c._id === categoryId);
    setSelectedCategory(category);
    setFormData({ ...formData, categoryId });
  };

  const validateForm = () => {
    const newErrors = [];
    
    // Título
    if (!formData.title.trim()) {
      newErrors.push('Título é obrigatório');
    } else if (formData.title.length > 200) {
      newErrors.push('Título não pode ter mais de 200 caracteres');
    }
    
    // Descrição
    if (!formData.description.trim()) {
      newErrors.push('Descrição é obrigatória');
    }
    
    // Solicitante
    if (!formData.client.name.trim()) {
      newErrors.push('Nome do solicitante é obrigatório');
    }
    
    if (!formData.client.email.trim()) {
      newErrors.push('Email do solicitante é obrigatório');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.client.email)) {
        newErrors.push('Email inválido');
      }
    }
    
    // Categoria
    if (!formData.categoryId) {
      newErrors.push('Categoria é obrigatória');
    }
    
    // Prioridade é automática - não precisa validar
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors([]);
    
    try {
      await ticketsAPI.create(formData);
      
      onSuccess?.();
      onClose();
      resetForm();
    } catch (error) {
      const err = handleAPIError(error);
      setErrors(err.errors.length > 0 ? err.errors : [err.message]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-xl flex items-center gap-2">
            <i className='bx bx-plus-circle text-2xl'></i>
            Criar Novo Chamado
          </h3>
          <button 
            className="btn btn-sm btn-circle btn-ghost" 
            onClick={onClose}
            disabled={loading}
          >
            <i className='bx bx-x text-xl'></i>
          </button>
        </div>
        
        {/* Alertas de erro */}
        {errors.length > 0 && (
          <div className="alert alert-error mb-4">
            <i className='bx bx-error-circle text-xl'></i>
            <div>
              {errors.map((error, i) => (
                <div key={i}>{error}</div>
              ))}
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                Título <span className="text-error">*</span>
              </span>
              <span className="label-text-alt">{formData.title.length}/200</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              placeholder="Descreva brevemente o problema"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              maxLength={200}
              disabled={loading}
            />
          </div>
          
          {/* Descrição */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                Descrição <span className="text-error">*</span>
              </span>
            </label>
            <textarea
              className="textarea textarea-bordered h-32"
              placeholder="Descreva detalhadamente o problema, incluindo passos para reproduzir se aplicável"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={loading}
            />
          </div>
          
          {/* Categoria - Prioridade é automática */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                Categoria <span className="text-error">*</span>
              </span>
            </label>
            <select
              className="select select-bordered"
              value={formData.categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              disabled={loading}
            >
              <option value="">Selecione a categoria...</option>
              {Object.entries(groupedCategories).map(([department, cats]) => (
                <optgroup key={department} label={department}>
                  {cats.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.type} - {cat.system}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            
            {/* Info da categoria selecionada */}
            {selectedCategory && (
              <div className="mt-3 p-3 bg-base-200 rounded-lg">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <i className='bx bx-flag text-primary'></i>
                    <span className="text-base-content/70">Prioridade:</span>
                    <span className="font-semibold capitalize">
                      {PRIORITY_CONFIG[selectedCategory.defaultPriority]?.label || 'Média'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <i className='bx bx-time text-primary'></i>
                    <span className="text-base-content/70">SLA:</span>
                    <span className="font-semibold">
                      {selectedCategory.sla.firstResponseHours}h resposta, {selectedCategory.sla.resolutionHours}h resolução
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Divider */}
          <div className="divider">
            <i className='bx bx-user'></i>
            Dados do Solicitante
          </div>
          
          {/* Grid: Nome e Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Nome <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="Nome completo"
                value={formData.client.name}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  client: { ...formData.client, name: e.target.value }
                })}
                disabled={loading}
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Email <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="email"
                className="input input-bordered"
                placeholder="email@exemplo.com"
                value={formData.client.email}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  client: { ...formData.client, email: e.target.value }
                })}
                disabled={loading}
              />
            </div>
          </div>
          
          {/* Empresa (opcional) */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Empresa (opcional)</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              placeholder="Nome da empresa"
              value={formData.client.company}
              onChange={(e) => setFormData({ 
                ...formData, 
                client: { ...formData.client, company: e.target.value }
              })}
              disabled={loading}
            />
          </div>
          
          {/* Botões */}
          <div className="modal-action">
            <button 
              type="button" 
              className="btn btn-ghost" 
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Criando...
                </>
              ) : (
                <>
                  <i className='bx bx-plus'></i>
                  Criar Chamado
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}