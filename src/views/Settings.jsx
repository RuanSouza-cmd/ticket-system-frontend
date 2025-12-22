// src/views/Settings.jsx - COM AVATAR E BOTÃO VOLTAR

import { useState } from 'react';
import { authAPI, handleAPIError } from '../services/api';
import { ROLE_CONFIG } from '../constants/system';
import Navbar from '../components/Navbar';
import ThemeSelector from '../components/ThemeSelector';
import AvatarSelector, { getDiceBearUrl } from '../components/AvatarSelector';
import toast from 'react-hot-toast';

export default function Settings({ currentUser, onLogout, onNavigate, onGoBack, canGoBack }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(currentUser);
  
  const handleAvatarUpdate = (newAvatar) => {
    // Atualiza localmente
    setUser({ ...user, avatar: newAvatar });
    // Atualiza localStorage
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...storedUser, avatar: newAvatar }));
    toast.success('Avatar atualizado!');
  };
  
  return (
    <div className="flex flex-col h-screen bg-base-200">
      <Navbar currentUser={user} onLogout={onLogout} onNavigate={onNavigate} />
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              {canGoBack && (
                <button onClick={onGoBack} className="btn btn-ghost btn-sm gap-1">
                  <i className='bx bx-arrow-back text-lg'></i>
                  Voltar
                </button>
              )}
            </div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <i className='bx bx-cog text-primary'></i>
              Configurações
            </h1>
            <p className="text-base-content/60 mt-1">Gerencie suas preferências e configurações</p>
          </div>

          <div className="tabs tabs-boxed mb-6">
            <button className={`tab ${activeTab === 'profile' ? 'tab-active' : ''}`} onClick={() => setActiveTab('profile')}>
              <i className='bx bx-user mr-2'></i>Perfil
            </button>
            <button className={`tab ${activeTab === 'security' ? 'tab-active' : ''}`} onClick={() => setActiveTab('security')}>
              <i className='bx bx-shield mr-2'></i>Segurança
            </button>
            <button className={`tab ${activeTab === 'appearance' ? 'tab-active' : ''}`} onClick={() => setActiveTab('appearance')}>
              <i className='bx bx-palette mr-2'></i>Aparência
            </button>
            <button className={`tab ${activeTab === 'preferences' ? 'tab-active' : ''}`} onClick={() => setActiveTab('preferences')}>
              <i className='bx bx-cog mr-2'></i>Preferências
            </button>
          </div>

          {activeTab === 'profile' && <ProfileTab currentUser={user} onAvatarUpdate={handleAvatarUpdate} />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'appearance' && <AppearanceTab />}
          {activeTab === 'preferences' && <PreferencesTab />}
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ currentUser, onAvatarUpdate }) {
  const roleConfig = ROLE_CONFIG[currentUser.role];
  const displayName = currentUser.displayName || currentUser.name || currentUser.email?.split('@')[0] || 'Usuário';
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  
  // Avatar URL
  const avatarUrl = currentUser.avatar || getDiceBearUrl('initials', displayName);
  
  return (
    <div className="space-y-6">
      {/* Card Principal do Perfil */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Informações do Perfil</h2>
          
          <div className="flex items-start gap-6 mb-6">
            {/* Avatar com opção de editar */}
            <div className="relative group">
              <div className="avatar">
                <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 bg-primary">
                  {currentUser.avatar ? (
                    <img src={avatarUrl} alt="Avatar" className="rounded-full" />
                  ) : (
                    <span className="flex items-center justify-center w-full h-full text-4xl text-primary-content font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Botão de editar avatar */}
              <button 
                className="absolute bottom-0 right-0 btn btn-circle btn-sm btn-primary shadow-lg"
                onClick={() => setShowAvatarSelector(true)}
              >
                <i className='bx bx-camera'></i>
              </button>
            </div>
            
            <div className="flex-1">
              <h3 className="text-2xl font-bold">{displayName}</h3>
              <p className="text-base-content/60">{currentUser.email}</p>
              <div className="mt-2">
                <span className={`badge ${roleConfig.badgeClass}`}>
                  <i className={`bx ${roleConfig.icon} mr-1`}></i>
                  {roleConfig.label}
                </span>
              </div>
              
              <button 
                className="btn btn-outline btn-sm mt-3 gap-1"
                onClick={() => setShowAvatarSelector(true)}
              >
                <i className='bx bx-edit'></i>
                Alterar Avatar
              </button>
            </div>
          </div>
          
          <div className="divider"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label"><span className="label-text font-semibold">Email</span></label>
              <input type="text" value={currentUser.email} className="input input-bordered w-full" disabled />
            </div>
            <div>
              <label className="label"><span className="label-text font-semibold">Função</span></label>
              <input type="text" value={roleConfig.label} className="input input-bordered w-full" disabled />
            </div>
            <div>
              <label className="label"><span className="label-text font-semibold">Membro desde</span></label>
              <input type="text" value={currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('pt-BR') : 'N/A'} className="input input-bordered w-full" disabled />
            </div>
            <div>
              <label className="label"><span className="label-text font-semibold">Status</span></label>
              <input type="text" value={currentUser.isActive ? 'Ativo' : 'Inativo'} className="input input-bordered w-full" disabled />
            </div>
          </div>
        </div>
      </div>
      
      {/* Estatísticas */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Estatísticas Pessoais</h2>
          <div className="stats stats-vertical lg:stats-horizontal shadow mt-4">
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-figure text-primary"><i className='bx bx-file text-3xl'></i></div>
              <div className="stat-title">Tickets Criados</div>
              <div className="stat-value text-primary">--</div>
            </div>
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-figure text-success"><i className='bx bx-check-circle text-3xl'></i></div>
              <div className="stat-title">Resolvidos</div>
              <div className="stat-value text-success">--</div>
            </div>
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-figure text-warning"><i className='bx bx-time text-3xl'></i></div>
              <div className="stat-title">Em Andamento</div>
              <div className="stat-value text-warning">--</div>
            </div>
          </div>
          <div className="alert alert-info mt-4">
            <i className='bx bx-info-circle'></i>
            <span>Estatísticas detalhadas em breve!</span>
          </div>
        </div>
      </div>
      
      {/* Modal de seleção de avatar */}
      <AvatarSelector
        isOpen={showAvatarSelector}
        currentAvatar={currentUser.avatar}
        userName={displayName}
        onSelect={onAvatarUpdate}
        onClose={() => setShowAvatarSelector(false)}
      />
    </div>
  );
}

function SecurityTab() {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwords.new !== passwords.confirm) {
      setError('As senhas não coincidem');
      return;
    }

    if (passwords.new.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await authAPI.changePassword(passwords.current, passwords.new);
      setSuccess('Senha alterada com sucesso!');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      const err = handleAPIError(error);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title"><i className='bx bx-lock-alt mr-2'></i>Alterar Senha</h2>
        
        {error && (
          <div className="alert alert-error">
            <i className='bx bx-error-circle'></i>
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="alert alert-success">
            <i className='bx bx-check-circle'></i>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 mt-4">
          <div className="form-control">
            <label className="label"><span className="label-text">Senha Atual</span></label>
            <input
              type="password"
              className="input input-bordered"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              required
            />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Nova Senha</span></label>
            <input
              type="password"
              className="input input-bordered"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              required
              minLength={6}
            />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Confirmar Nova Senha</span></label>
            <input
              type="password"
              className="input input-bordered"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="loading loading-spinner"></span> : <i className='bx bx-check mr-1'></i>}
            Alterar Senha
          </button>
        </form>
      </div>
    </div>
  );
}

function AppearanceTab() {
  return (
    <div className="card bg-base-100 shadow-xl overflow-hidden">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-r from-primary to-secondary p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            <i className='bx bx-palette text-3xl text-white'></i>
          </div>
          <div className="text-white">
            <h2 className="text-xl font-bold">Aparência</h2>
            <p className="text-white/80 text-sm">Personalize a interface do sistema</p>
          </div>
        </div>
      </div>
      
      <div className="card-body">
        <ThemeSelector />
      </div>
    </div>
  );
}

function PreferencesTab() {
  const [prefs, setPrefs] = useState({
    notifications: true,
    emailAlerts: false,
    soundAlerts: true,
    compactMode: false
  });

  return (
    <div className="space-y-4">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title"><i className='bx bx-bell mr-2'></i>Notificações</h2>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Receber notificações no navegador</span>
              <input type="checkbox" className="toggle toggle-primary" checked={prefs.notifications} onChange={(e) => setPrefs({ ...prefs, notifications: e.target.checked })} />
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Alertas por email</span>
              <input type="checkbox" className="toggle toggle-primary" checked={prefs.emailAlerts} onChange={(e) => setPrefs({ ...prefs, emailAlerts: e.target.checked })} />
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Sons de notificação</span>
              <input type="checkbox" className="toggle toggle-primary" checked={prefs.soundAlerts} onChange={(e) => setPrefs({ ...prefs, soundAlerts: e.target.checked })} />
            </label>
          </div>
        </div>
      </div>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title"><i className='bx bx-layout mr-2'></i>Interface</h2>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Modo compacto</span>
              <input type="checkbox" className="toggle toggle-primary" checked={prefs.compactMode} onChange={(e) => setPrefs({ ...prefs, compactMode: e.target.checked })} />
            </label>
          </div>
          <div className="alert alert-info mt-4">
            <i className='bx bx-info-circle'></i>
            <span>Mais opções de preferências em breve!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
