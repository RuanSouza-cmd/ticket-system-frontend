// src/views/UsersManagement.jsx - COM SUPORTE A DEPARTAMENTOS

import { useState, useEffect } from 'react';
import { usersAPI, departmentsAPI, handleAPIError } from '../services/api';
import { ROLE_CONFIG, USER_ROLES } from '../constants/system';
import Navbar from '../components/Navbar';

export default function UsersManagement({ currentUser, onLogout, onNavigate, onGoBack, canGoBack }) {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Filtros
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterRole, setFilterRole] = useState('');
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [usersRes, deptsRes] = await Promise.all([
        usersAPI.getAll(),
        departmentsAPI.getAll()
      ]);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setDepartments(Array.isArray(deptsRes.data) ? deptsRes.data : []);
    } catch (error) {
      const err = handleAPIError(error);
      setError(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Deseja realmente excluir este usuário?')) return;
    
    try {
      await usersAPI.delete(userId);
      setSuccess('Usuário excluído com sucesso!');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      const err = handleAPIError(error);
      setError(err.message);
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      await usersAPI.toggleActive(userId);
      setSuccess('Status do usuário alterado!');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      const err = handleAPIError(error);
      setError(err.message);
    }
  };
  
  // Filtrar usuários
  const filteredUsers = users.filter(user => {
    if (filterDepartment && user.departmentId?._id !== filterDepartment) return false;
    if (filterRole && user.role !== filterRole) return false;
    return true;
  });

  // Agrupar por departamento
  const usersByDepartment = {};
  filteredUsers.forEach(user => {
    const deptName = user.departmentId?.displayName || 'Sem Departamento';
    if (!usersByDepartment[deptName]) {
      usersByDepartment[deptName] = [];
    }
    usersByDepartment[deptName].push(user);
  });

  return (
    <div className="flex flex-col h-screen bg-base-200">
      <Navbar currentUser={currentUser} onLogout={onLogout} onNavigate={onNavigate} />
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
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
                <i className='bx bx-user-circle text-primary'></i>
                Gerenciar Usuários
              </h1>
              <p className="text-base-content/60 mt-1">
                Crie, edite e gerencie usuários do sistema por departamento
              </p>
            </div>
            
            <button 
              className="btn btn-primary gap-2"
              onClick={() => setShowCreateModal(true)}
            >
              <i className='bx bx-plus text-xl'></i>
              Novo Usuário
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

          {/* Filtros */}
          <div className="card bg-base-100 shadow-lg mb-6">
            <div className="card-body py-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="form-control">
                  <label className="label py-0">
                    <span className="label-text text-xs">Departamento</span>
                  </label>
                  <select
                    className="select select-bordered select-sm"
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                  >
                    <option value="">Todos</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept._id}>{dept.displayName}</option>
                    ))}
                    <option value="none">Sem Departamento</option>
                  </select>
                </div>
                
                <div className="form-control">
                  <label className="label py-0">
                    <span className="label-text text-xs">Função</span>
                  </label>
                  <select
                    className="select select-bordered select-sm"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                  >
                    <option value="">Todas</option>
                    <option value="master">Master</option>
                    <option value="operator">Operador</option>
                    <option value="agent">Agente</option>
                  </select>
                </div>
                
                <div className="flex-1"></div>
                
                <div className="text-sm text-base-content/60">
                  {filteredUsers.length} usuário(s)
                </div>
              </div>
            </div>
          </div>

          {/* Stats por departamento */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {departments.map(dept => (
              <div key={dept._id} className="stat bg-base-100 rounded-xl shadow p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: dept.color }}
                  >
                    <i className={`bx ${dept.icon}`}></i>
                  </div>
                  <span className="font-semibold text-sm">{dept.displayName}</span>
                </div>
                <div className="stat-value text-2xl">
                  {users.filter(u => u.departmentId?._id === dept._id).length}
                </div>
                <div className="stat-desc">usuários</div>
              </div>
            ))}
          </div>

          {/* Tabela de Usuários */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-base-content/60">
                  <i className='bx bx-user-x text-6xl mb-4'></i>
                  <p>Nenhum usuário encontrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Usuário</th>
                        <th>Email</th>
                        <th>Departamento</th>
                        <th>Função</th>
                        <th>Status</th>
                        <th>Criado em</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => {
                        const roleConfig = ROLE_CONFIG[user.role];
                        const dept = user.departmentId;
                        return (
                          <tr key={user._id} className={!user.isActive ? 'opacity-50' : ''}>
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="avatar placeholder">
                                  <div 
                                    className="rounded-full w-10 text-white"
                                    style={{ backgroundColor: dept?.color || '#6b7280' }}
                                  >
                                    <span>
                                      {(user.displayName || user.email)?.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <div className="font-bold">
                                    {user.displayName || 'Sem nome'}
                                  </div>
                                  {!user.isActive && (
                                    <div className="text-xs opacity-50">Inativo</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>{user.email}</td>
                            <td>
                              {dept ? (
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-6 h-6 rounded flex items-center justify-center text-white text-xs"
                                    style={{ backgroundColor: dept.color }}
                                  >
                                    <i className={`bx ${dept.icon}`}></i>
                                  </div>
                                  <span className="text-sm">{dept.displayName}</span>
                                </div>
                              ) : (
                                <span className="text-base-content/40 text-sm">-</span>
                              )}
                            </td>
                            <td>
                              <div className={`badge ${roleConfig?.badgeClass} gap-1`}>
                                <i className={`bx ${roleConfig?.icon}`}></i>
                                {roleConfig?.label}
                              </div>
                            </td>
                            <td>
                              {user.isActive ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/30">
                                  <i className='bx bx-check-circle'></i>
                                  Ativo
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md shadow-red-500/30">
                                  <i className='bx bx-x-circle'></i>
                                  Inativo
                                </span>
                              )}
                            </td>
                            <td>
                              {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                            </td>
                            <td>
                              <div className="flex gap-1">
                                <button
                                  className="btn btn-ghost btn-xs tooltip"
                                  data-tip="Editar"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowEditModal(true);
                                  }}
                                >
                                  <i className='bx bx-edit text-lg'></i>
                                </button>
                                <button
                                  className="btn btn-ghost btn-xs tooltip"
                                  data-tip="Resetar Senha"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowPasswordModal(true);
                                  }}
                                >
                                  <i className='bx bx-key text-lg'></i>
                                </button>
                                <button
                                  className={`btn btn-ghost btn-xs tooltip ${user.isActive ? 'text-warning' : 'text-success'}`}
                                  data-tip={user.isActive ? 'Desativar' : 'Ativar'}
                                  onClick={() => handleToggleActive(user._id)}
                                >
                                  <i className={`bx ${user.isActive ? 'bx-pause' : 'bx-play'} text-lg`}></i>
                                </button>
                                <button
                                  className="btn btn-ghost btn-xs text-error tooltip"
                                  data-tip="Excluir"
                                  onClick={() => handleDelete(user._id)}
                                >
                                  <i className='bx bx-trash text-lg'></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal
          isOpen={showCreateModal}
          departments={departments}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            setSuccess('Usuário criado com sucesso!');
            loadData();
            setTimeout(() => setSuccess(''), 3000);
          }}
        />
      )}
      
      {showEditModal && selectedUser && (
        <EditUserModal
          isOpen={showEditModal}
          user={selectedUser}
          departments={departments}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            setSuccess('Usuário atualizado com sucesso!');
            loadData();
            setTimeout(() => setSuccess(''), 3000);
          }}
        />
      )}
      
      {showPasswordModal && selectedUser && (
        <ResetPasswordModal
          isOpen={showPasswordModal}
          user={selectedUser}
          onClose={() => {
            setShowPasswordModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowPasswordModal(false);
            setSelectedUser(null);
            setSuccess('Senha resetada com sucesso!');
            setTimeout(() => setSuccess(''), 3000);
          }}
        />
      )}
    </div>
  );
}

// Modal de Criação de Usuário
function CreateUserModal({ isOpen, departments, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    displayName: '',
    name: '',
    email: '',
    password: '',
    role: 'operator',
    departmentId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await usersAPI.create({
        ...formData,
        departmentId: formData.departmentId || null
      });
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
      <div className="modal-box">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
            <i className='bx bx-user-plus text-2xl'></i>
          </div>
          <div>
            <h3 className="font-bold text-lg">Criar Novo Usuário</h3>
            <p className="text-sm text-base-content/60">Adicione um novo membro à equipe</p>
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
                <span className="label-text">Nome de Exibição *</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="Ex: João Silva"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Nome Completo</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="Nome completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Email *</span>
            </label>
            <input
              type="email"
              className="input input-bordered"
              placeholder="usuario@exemplo.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Senha *</span>
            </label>
            <input
              type="password"
              className="input input-bordered"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Função *</span>
              </label>
              <select
                className="select select-bordered"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                disabled={loading}
              >
                <option value="agent">Agente</option>
                <option value="operator">Operador</option>
                <option value="master">Master</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Departamento</span>
              </label>
              <select
                className="select select-bordered"
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                disabled={loading}
              >
                <option value="">Nenhum (Master)</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>
                    {dept.displayName}
                  </option>
                ))}
              </select>
              <label className="label">
                <span className="label-text-alt text-base-content/50">
                  Masters podem não ter departamento
                </span>
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
                  Criando...
                </>
              ) : (
                'Criar Usuário'
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}

// Modal de Edição de Usuário
function EditUserModal({ isOpen, user, departments, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    displayName: user.displayName || '',
    name: user.name || '',
    email: user.email,
    role: user.role,
    departmentId: user.departmentId?._id || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await usersAPI.update(user._id, {
        ...formData,
        departmentId: formData.departmentId || null
      });
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
      <div className="modal-box">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-info to-primary flex items-center justify-center text-white">
            <i className='bx bx-edit text-2xl'></i>
          </div>
          <div>
            <h3 className="font-bold text-lg">Editar Usuário</h3>
            <p className="text-sm text-base-content/60">{user.email}</p>
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
                <span className="label-text">Nome de Exibição *</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Nome Completo</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Email *</span>
            </label>
            <input
              type="email"
              className="input input-bordered"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Função *</span>
              </label>
              <select
                className="select select-bordered"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                disabled={loading}
              >
                <option value="agent">Agente</option>
                <option value="operator">Operador</option>
                <option value="master">Master</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Departamento</span>
              </label>
              <select
                className="select select-bordered"
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                disabled={loading}
              >
                <option value="">Nenhum (Master)</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>
                    {dept.displayName}
                  </option>
                ))}
              </select>
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
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}

// Modal de Reset de Senha
function ResetPasswordModal({ isOpen, user, onClose, onSuccess }) {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await usersAPI.resetPassword(user._id, newPassword);
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
      <div className="modal-box">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning to-orange-500 flex items-center justify-center text-white">
            <i className='bx bx-key text-2xl'></i>
          </div>
          <div>
            <h3 className="font-bold text-lg">Resetar Senha</h3>
            <p className="text-sm text-base-content/60">{user.displayName || user.email}</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <i className='bx bx-error-circle'></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Nova Senha *</span>
            </label>
            <input
              type="password"
              className="input input-bordered"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-warning" disabled={loading}>
              {loading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Resetando...
                </>
              ) : (
                'Resetar Senha'
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
