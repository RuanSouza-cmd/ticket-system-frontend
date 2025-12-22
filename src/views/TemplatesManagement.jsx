// src/views/TemplatesManagement.jsx

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { templatesAPI, handleAPIError } from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'saudacao', label: 'Saudação', icon: 'bx-hand' },
  { value: 'acompanhamento', label: 'Acompanhamento', icon: 'bx-time' },
  { value: 'solicitacao', label: 'Solicitação de Info', icon: 'bx-help-circle' },
  { value: 'resolucao', label: 'Resolução', icon: 'bx-check-circle' },
  { value: 'encerramento', label: 'Encerramento', icon: 'bx-door-open' },
  { value: 'outros', label: 'Outros', icon: 'bx-dots-horizontal' }
];

export default function TemplatesManagement({ currentUser, onLogout, onNavigate, onGoBack, canGoBack }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    shortTitle: '',
    content: '',
    category: 'outros',
    shortcut: '',
    department: ''
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await templatesAPI.getAll();
      setTemplates(response.data.templates || []);
    } catch (error) {
      toast.error('Erro ao carregar templates');
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    try {
      await templatesAPI.initialize();
      toast.success('Templates padrão criados!');
      loadTemplates();
    } catch (error) {
      toast.error(handleAPIError(error).message);
    }
  };

  const handleOpenModal = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        shortTitle: template.shortTitle,
        content: template.content,
        category: template.category,
        shortcut: template.shortcut || '',
        department: template.department || ''
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: '',
        shortTitle: '',
        content: '',
        category: 'outros',
        shortcut: '',
        department: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.shortTitle.trim() || !formData.content.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (editingTemplate) {
        await templatesAPI.update(editingTemplate._id, formData);
        toast.success('Template atualizado!');
      } else {
        await templatesAPI.create(formData);
        toast.success('Template criado!');
      }
      setShowModal(false);
      loadTemplates();
    } catch (error) {
      toast.error(handleAPIError(error).message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deseja desativar este template?')) return;
    
    try {
      await templatesAPI.delete(id);
      toast.success('Template desativado!');
      loadTemplates();
    } catch (error) {
      toast.error(handleAPIError(error).message);
    }
  };

  const filteredTemplates = filterCategory 
    ? templates.filter(t => t.category === filterCategory)
    : templates;

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar 
        currentUser={currentUser} 
        onLogout={onLogout}
        onNavigate={onNavigate}
      />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {canGoBack && (
              <button onClick={onGoBack} className="btn btn-ghost btn-sm gap-1">
                <i className='bx bx-arrow-back text-lg'></i>
                Voltar
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <i className='bx bx-message-square-dots text-primary'></i>
                Templates de Resposta
              </h1>
              <p className="text-base-content/60">Gerencie templates para agilizar respostas</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="btn btn-ghost btn-sm" onClick={handleInitialize}>
              <i className='bx bx-reset'></i>
              Criar Padrões
            </button>
            <button className="btn btn-primary btn-sm gap-1" onClick={() => handleOpenModal()}>
              <i className='bx bx-plus'></i>
              Novo Template
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button 
            className={`btn btn-sm ${!filterCategory ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilterCategory('')}
          >
            Todos ({templates.length})
          </button>
          {CATEGORIES.map(cat => {
            const count = templates.filter(t => t.category === cat.value).length;
            return (
              <button
                key={cat.value}
                className={`btn btn-sm gap-1 ${filterCategory === cat.value ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilterCategory(cat.value)}
              >
                <i className={`bx ${cat.icon}`}></i>
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Lista de Templates */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <i className='bx bx-message-square-dots text-6xl text-base-content/30 mb-4'></i>
            <p className="text-base-content/60">Nenhum template encontrado</p>
            <button className="btn btn-primary btn-sm mt-4" onClick={handleInitialize}>
              Criar Templates Padrão
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <div key={template._id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-all">
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="card-title text-lg">{template.shortTitle}</h3>
                      <p className="text-sm text-base-content/60">{template.name}</p>
                    </div>
                    <div className="dropdown dropdown-end">
                      <label tabIndex={0} className="btn btn-ghost btn-xs btn-circle">
                        <i className='bx bx-dots-vertical-rounded'></i>
                      </label>
                      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
                        <li><a onClick={() => handleOpenModal(template)}><i className='bx bx-edit'></i>Editar</a></li>
                        <li><a onClick={() => handleDelete(template._id)} className="text-error"><i className='bx bx-trash'></i>Excluir</a></li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className="badge badge-ghost badge-sm">
                      {CATEGORIES.find(c => c.value === template.category)?.label}
                    </span>
                    {template.shortcut && (
                      <span className="badge badge-primary badge-sm font-mono">
                        {template.shortcut}
                      </span>
                    )}
                    {template.usageCount > 0 && (
                      <span className="badge badge-info badge-sm">
                        {template.usageCount}x usado
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-base-content/70 mt-3 line-clamp-3">
                    {template.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Criação/Edição */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">
                {editingTemplate ? 'Editar Template' : 'Novo Template'}
              </h3>
              <button className="btn btn-ghost btn-sm btn-circle" onClick={() => setShowModal(false)}>
                <i className='bx bx-x text-xl'></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Nome Completo *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="Ex: Saudação Inicial"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Título Curto *</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="Ex: Olá"
                    value={formData.shortTitle}
                    onChange={(e) => setFormData({ ...formData, shortTitle: e.target.value })}
                    maxLength={50}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Categoria *</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Atalho</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered font-mono"
                    placeholder="Ex: /ola"
                    value={formData.shortcut}
                    onChange={(e) => setFormData({ ...formData, shortcut: e.target.value })}
                    maxLength={10}
                  />
                </div>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Conteúdo *</span>
                  <span className="label-text-alt">Variáveis: {`{{cliente}}, {{ticket}}, {{operador}}`}</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-40 font-mono text-sm"
                  placeholder="Digite o conteúdo do template..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              </div>
              
              <div className="modal-action">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className='bx bx-check'></i>
                  {editingTemplate ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop bg-black/50" onClick={() => setShowModal(false)}></div>
        </div>
      )}
    </div>
  );
}
