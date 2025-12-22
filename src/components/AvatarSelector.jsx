// src/components/AvatarSelector.jsx - Seletor de Avatar com DiceBear

import { useState } from 'react';

// Estilos DiceBear disponíveis
const AVATAR_STYLES = [
  { id: 'avataaars', name: 'Avataaars', icon: 'bx-user' },
  { id: 'lorelei', name: 'Lorelei', icon: 'bx-smile' },
  { id: 'micah', name: 'Micah', icon: 'bx-face' },
  { id: 'adventurer', name: 'Adventurer', icon: 'bx-walk' },
  { id: 'pixel-art', name: 'Pixel Art', icon: 'bx-grid-small' },
  { id: 'bottts', name: 'Robôs', icon: 'bx-bot' },
  { id: 'fun-emoji', name: 'Emojis', icon: 'bx-happy' },
  { id: 'thumbs', name: 'Thumbs', icon: 'bx-like' },
  { id: 'initials', name: 'Iniciais', icon: 'bx-text' },
  { id: 'shapes', name: 'Formas', icon: 'bx-shape-circle' }
];

// Seeds pré-definidos para variedade
const PRESET_SEEDS = [
  'avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5',
  'avatar6', 'avatar7', 'avatar8', 'avatar9', 'avatar10',
  'happy', 'cool', 'smart', 'tech', 'pro',
  'alpha', 'beta', 'gamma', 'delta', 'omega'
];

// Gera URL do DiceBear
export const getDiceBearUrl = (style, seed, size = 128) => {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&size=${size}`;
};

export default function AvatarSelector({ 
  currentAvatar, 
  userName, 
  onSelect, 
  onClose,
  isOpen 
}) {
  const [selectedStyle, setSelectedStyle] = useState('avataaars');
  const [selectedSeed, setSelectedSeed] = useState(userName || 'default');
  const [customSeed, setCustomSeed] = useState('');
  const [previewUrl, setPreviewUrl] = useState(currentAvatar || getDiceBearUrl('avataaars', userName || 'default'));

  const handleStyleChange = (style) => {
    setSelectedStyle(style);
    const seed = customSeed || selectedSeed;
    setPreviewUrl(getDiceBearUrl(style, seed));
  };

  const handleSeedChange = (seed) => {
    setSelectedSeed(seed);
    setCustomSeed('');
    setPreviewUrl(getDiceBearUrl(selectedStyle, seed));
  };

  const handleCustomSeedChange = (e) => {
    const seed = e.target.value;
    setCustomSeed(seed);
    if (seed) {
      setPreviewUrl(getDiceBearUrl(selectedStyle, seed));
    }
  };

  const handleRandomize = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setCustomSeed(randomSeed);
    setPreviewUrl(getDiceBearUrl(selectedStyle, randomSeed));
  };

  const handleConfirm = () => {
    onSelect(previewUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
            <i className='bx bx-user-circle text-2xl'></i>
          </div>
          <div>
            <h3 className="font-bold text-xl">Escolher Avatar</h3>
            <p className="text-sm text-base-content/60">Personalize seu perfil com um avatar único</p>
          </div>
          <button 
            className="btn btn-ghost btn-sm btn-circle ml-auto" 
            onClick={onClose}
          >
            <i className='bx bx-x text-xl'></i>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Preview */}
          <div className="col-span-1">
            <div className="sticky top-0">
              <p className="text-sm font-semibold mb-3 text-center">Preview</p>
              <div className="flex flex-col items-center gap-4">
                <div className="avatar">
                  <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 bg-base-200">
                    <img 
                      src={previewUrl} 
                      alt="Avatar Preview"
                      className="rounded-full"
                      onError={(e) => {
                        e.target.src = getDiceBearUrl('initials', userName || 'U');
                      }}
                    />
                  </div>
                </div>
                
                <button 
                  className="btn btn-outline btn-sm gap-1"
                  onClick={handleRandomize}
                >
                  <i className='bx bx-shuffle'></i>
                  Aleatório
                </button>
              </div>
            </div>
          </div>

          {/* Opções */}
          <div className="col-span-2 space-y-4">
            {/* Estilos */}
            <div>
              <p className="text-sm font-semibold mb-2">Estilo</p>
              <div className="grid grid-cols-5 gap-2">
                {AVATAR_STYLES.map((style) => (
                  <button
                    key={style.id}
                    className={`
                      flex flex-col items-center gap-1 p-2 rounded-lg transition-all
                      ${selectedStyle === style.id 
                        ? 'bg-primary text-primary-content ring-2 ring-primary ring-offset-2' 
                        : 'bg-base-200 hover:bg-base-300'
                      }
                    `}
                    onClick={() => handleStyleChange(style.id)}
                    title={style.name}
                  >
                    <i className={`bx ${style.icon} text-xl`}></i>
                    <span className="text-xs truncate w-full text-center">{style.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Seeds pré-definidos */}
            <div>
              <p className="text-sm font-semibold mb-2">Variações</p>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_SEEDS.slice(0, 10).map((seed) => (
                  <button
                    key={seed}
                    className={`
                      p-1 rounded-lg transition-all overflow-hidden
                      ${selectedSeed === seed && !customSeed
                        ? 'ring-2 ring-primary ring-offset-2' 
                        : 'hover:ring-2 hover:ring-base-300'
                      }
                    `}
                    onClick={() => handleSeedChange(seed)}
                  >
                    <img 
                      src={getDiceBearUrl(selectedStyle, seed, 64)} 
                      alt={seed}
                      className="w-full h-full rounded"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Seed personalizado */}
            <div>
              <p className="text-sm font-semibold mb-2">Personalizado</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input input-bordered input-sm flex-1"
                  placeholder="Digite um texto para gerar avatar único..."
                  value={customSeed}
                  onChange={handleCustomSeedChange}
                />
              </div>
              <p className="text-xs text-base-content/50 mt-1">
                Qualquer texto gera um avatar único e consistente
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary gap-1" onClick={handleConfirm}>
            <i className='bx bx-check'></i>
            Usar este Avatar
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}

// Componente de exibição de avatar
export function UserAvatar({ user, size = 'md', className = '' }) {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  const avatarUrl = user?.avatar || getDiceBearUrl('initials', user?.displayName || user?.email || 'U');
  const initial = (user?.displayName || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <div className={`avatar ${className}`}>
      <div className={`rounded-full ${sizeClasses[size]} bg-primary`}>
        {user?.avatar ? (
          <img 
            src={avatarUrl} 
            alt={user?.displayName || 'Avatar'}
            className="rounded-full"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <span 
          className={`
            ${user?.avatar ? 'hidden' : 'flex'} 
            items-center justify-center w-full h-full text-primary-content font-bold
            ${size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : size === 'xl' ? 'text-2xl' : 'text-base'}
          `}
        >
          {initial}
        </span>
      </div>
    </div>
  );
}
