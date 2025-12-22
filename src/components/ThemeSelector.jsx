// src/components/ThemeSelector.jsx - MELHORADO COM PREVIEW BONITO

import { useTheme } from '../contexts/ThemeContext';

export default function ThemeSelector() {
  const { theme, changeTheme, themes } = useTheme();

  const themeGroups = {
    'Claro': ['light', 'cupcake', 'bumblebee', 'emerald', 'corporate', 'fantasy', 'cmyk', 'autumn', 'acid', 'lemonade', 'winter', 'pastel', 'lofi'],
    'Escuro': ['dark', 'synthwave', 'halloween', 'forest', 'black', 'luxury', 'dracula', 'business', 'night', 'coffee', 'dim', 'sunset'],
    'Especiais': ['retro', 'cyberpunk', 'valentine', 'garden', 'aqua', 'wireframe', 'nord']
  };

  return (
    <div className="space-y-6">
      {/* Tema atual com preview */}
      <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 p-6 border border-primary/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
            <i className={`bx ${themes[theme]?.icon || 'bx-palette'} text-3xl text-white`}></i>
          </div>
          <div>
            <p className="text-sm text-base-content/60 mb-1">Tema atual</p>
            <h3 className="text-2xl font-bold">{themes[theme]?.name || 'Desconhecido'}</h3>
          </div>
        </div>
        
        {/* Preview do tema */}
        <div className="mt-4 p-4 rounded-xl bg-base-100 shadow-inner" data-theme={theme}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge badge-primary">Primary</span>
            <span className="badge badge-secondary">Secondary</span>
            <span className="badge badge-accent">Accent</span>
            <span className="badge badge-success">Success</span>
            <span className="badge badge-warning">Warning</span>
            <span className="badge badge-error">Error</span>
            <span className="badge badge-info">Info</span>
          </div>
          <div className="flex gap-2 mt-3">
            <button className="btn btn-primary btn-sm">Primário</button>
            <button className="btn btn-secondary btn-sm">Secundário</button>
            <button className="btn btn-accent btn-sm">Accent</button>
          </div>
        </div>
      </div>

      {/* Grupos de temas */}
      {Object.entries(themeGroups).map(([groupName, themeList]) => (
        <div key={groupName}>
          <h4 className="font-bold mb-4 text-base-content/80 flex items-center gap-2">
            <i className={`bx ${groupName === 'Claro' ? 'bx-sun' : groupName === 'Escuro' ? 'bx-moon' : 'bx-star'} text-primary`}></i>
            {groupName}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {themeList.map((themeKey) => {
              const themeInfo = themes[themeKey];
              if (!themeInfo) return null;

              const isSelected = theme === themeKey;

              return (
                <button
                  key={themeKey}
                  onClick={() => changeTheme(themeKey)}
                  className={`
                    relative overflow-hidden rounded-xl p-1 transition-all duration-200
                    ${isSelected 
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-base-100 shadow-lg' 
                      : 'hover:shadow-md hover:scale-[1.02]'
                    }
                  `}
                  data-theme={themeKey}
                >
                  {/* Preview mini do tema */}
                  <div className="bg-base-100 rounded-lg p-3">
                    {/* Header simulado */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <div className="h-2 bg-base-content/20 rounded flex-1"></div>
                    </div>
                    
                    {/* Content simulado */}
                    <div className="flex gap-1 mb-2">
                      <div className="h-8 bg-primary/20 rounded flex-1"></div>
                      <div className="h-8 bg-secondary/20 rounded flex-1"></div>
                    </div>
                    
                    {/* Badges */}
                    <div className="flex gap-1">
                      <div className="h-2 w-8 bg-primary rounded-full"></div>
                      <div className="h-2 w-6 bg-secondary rounded-full"></div>
                      <div className="h-2 w-4 bg-accent rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Nome do tema */}
                  <div className={`
                    flex items-center justify-center gap-2 py-2 text-sm font-semibold
                    ${isSelected ? 'text-primary' : 'text-base-content/70'}
                  `}>
                    <i className={`bx ${themeInfo.icon}`}></i>
                    <span>{themeInfo.name}</span>
                    {isSelected && (
                      <i className='bx bx-check-circle text-primary'></i>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Dica */}
      <div className="rounded-xl p-4 bg-gradient-to-r from-info/10 to-primary/10 border border-info/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-info to-primary flex items-center justify-center text-white shadow-md flex-shrink-0">
            <i className='bx bx-bulb text-xl'></i>
          </div>
          <div>
            <p className="font-semibold text-base-content">Dica</p>
            <p className="text-sm text-base-content/60">
              O tema é salvo automaticamente e aplicado em todas as páginas. 
              Escolha o tema que mais combina com você!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
