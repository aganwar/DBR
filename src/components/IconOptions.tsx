// src/components/IconOptions.tsx
import React from 'react';

interface IconOptionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onClick: () => void;
  selected?: boolean;
}

function IconOption({ title, description, children, onClick, selected }: IconOptionProps) {
  return (
    <div
      className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
        selected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
      onClick={onClick}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 flex items-center justify-center">
          {children}
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

interface IconOptionsProps {
  open: boolean;
  onSelect: (iconType: string) => void;
  onClose: () => void;
}

export default function IconOptions({ open, onSelect, onClose }: IconOptionsProps) {
  const [selected, setSelected] = React.useState<string>('');

  const handleSelect = (iconType: string) => {
    setSelected(iconType);
    setTimeout(() => {
      onSelect(iconType);
      onClose();
    }, 300);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-6xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Choose OCX AI Icon
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Close icon selector"
            >
              <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Option 1: Modern Letters */}
            <IconOption
              title="Modern Letters"
              description="Clean typography with gradient"
              selected={selected === 'modern-letters'}
              onClick={() => handleSelect('modern-letters')}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">OA</span>
              </div>
            </IconOption>

            {/* Option 2: Hexagon Tech */}
            <IconOption
              title="Hexagon Tech"
              description="Geometric shape with letters"
              selected={selected === 'hexagon-tech'}
              onClick={() => handleSelect('hexagon-tech')}
            >
              <div className="w-16 h-16 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 transform rotate-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon
                      points="50,5 85,25 85,75 50,95 15,75 15,25"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">OA</span>
                </div>
              </div>
            </IconOption>

            {/* Option 3: Circuit Brain */}
            <IconOption
              title="Circuit Brain"
              description="AI brain with circuit patterns"
              selected={selected === 'circuit-brain'}
              onClick={() => handleSelect('circuit-brain')}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-pink-600 rounded-xl flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L18.5 7C18.5 7.8 18.1 8.5 17.4 9C17.7 9.6 18 10.2 18 11C18 12.1 17.1 13 16 13S14 12.1 14 11C14 10.2 14.3 9.6 14.6 9C13.9 8.5 13.5 7.8 13.5 7L10.5 7C10.5 7.8 10.1 8.5 9.4 9C9.7 9.6 10 10.2 10 11C10 12.1 9.1 13 8 13S6 12.1 6 11C6 10.2 6.3 9.6 6.6 9C5.9 8.5 5.5 7.8 5.5 7L3 7V9H5C5.6 9 6 9.4 6 10V14C6 14.6 5.6 15 5 15H3V17H5.5C5.5 16.2 5.9 15.5 6.6 15C6.3 14.4 6 13.8 6 13C6 11.9 6.9 11 8 11S10 11.9 10 13C10 13.8 9.7 14.4 9.4 15C10.1 15.5 10.5 16.2 10.5 17L13.5 17C13.5 16.2 13.9 15.5 14.6 15C14.3 14.4 14 13.8 14 13C14 11.9 14.9 11 16 11S18 11.9 18 13C18 13.8 17.7 14.4 17.4 15C18.1 15.5 18.5 16.2 18.5 17L21 17V15H19C18.4 15 18 14.6 18 14V10C18 9.4 18.4 9 19 9H21Z"/>
                </svg>
              </div>
            </IconOption>

            {/* Option 4: Cube 3D */}
            <IconOption
              title="3D Cube"
              description="Isometric cube with OCX letters"
              selected={selected === 'cube-3d'}
              onClick={() => handleSelect('cube-3d')}
            >
              <div className="w-16 h-16 relative">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <linearGradient id="topGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6"/>
                      <stop offset="100%" stopColor="#1d4ed8"/>
                    </linearGradient>
                    <linearGradient id="leftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1e40af"/>
                      <stop offset="100%" stopColor="#1e3a8a"/>
                    </linearGradient>
                    <linearGradient id="rightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2563eb"/>
                      <stop offset="100%" stopColor="#1d4ed8"/>
                    </linearGradient>
                  </defs>
                  {/* Top face */}
                  <polygon points="50,20 25,35 50,50 75,35" fill="url(#topGrad)"/>
                  {/* Left face */}
                  <polygon points="25,35 25,65 50,80 50,50" fill="url(#leftGrad)"/>
                  {/* Right face */}
                  <polygon points="50,50 50,80 75,65 75,35" fill="url(#rightGrad)"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-xs mt-2">OA</span>
                </div>
              </div>
            </IconOption>

            {/* Option 5: AI Chip */}
            <IconOption
              title="AI Microchip"
              description="Computer chip design with AI theme"
              selected={selected === 'ai-chip'}
              onClick={() => handleSelect('ai-chip')}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-700 rounded-lg p-2">
                <div className="w-full h-full bg-slate-900 rounded border-2 border-purple-400 relative">
                  <div className="absolute inset-1 bg-gradient-to-br from-purple-500 to-blue-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">OA</span>
                  </div>
                  {/* Chip pins */}
                  <div className="absolute -left-1 top-2 w-2 h-1 bg-purple-400 rounded-r"></div>
                  <div className="absolute -left-1 top-5 w-2 h-1 bg-purple-400 rounded-r"></div>
                  <div className="absolute -left-1 top-8 w-2 h-1 bg-purple-400 rounded-r"></div>
                  <div className="absolute -right-1 top-2 w-2 h-1 bg-purple-400 rounded-l"></div>
                  <div className="absolute -right-1 top-5 w-2 h-1 bg-purple-400 rounded-l"></div>
                  <div className="absolute -right-1 top-8 w-2 h-1 bg-purple-400 rounded-l"></div>
                </div>
              </div>
            </IconOption>

            {/* Option 6: Neural Network */}
            <IconOption
              title="Neural Network"
              description="Connected nodes representing AI"
              selected={selected === 'neural-network'}
              onClick={() => handleSelect('neural-network')}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center relative">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="6" cy="6" r="2"/>
                  <circle cx="18" cy="6" r="2"/>
                  <circle cx="6" cy="18" r="2"/>
                  <circle cx="18" cy="18" r="2"/>
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M8 6L10 10M16 6L14 10M8 18L10 14M16 18L14 14" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-xs mt-8">OA</span>
                </div>
              </div>
            </IconOption>

            {/* Option 7: Minimalist Circle */}
            <IconOption
              title="Minimalist Circle"
              description="Clean circular design"
              selected={selected === 'minimalist-circle'}
              onClick={() => handleSelect('minimalist-circle')}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center border-4 border-slate-300 dark:border-slate-600">
                <div className="text-center">
                  <div className="text-white font-bold text-lg leading-none">O</div>
                  <div className="text-white font-bold text-xs leading-none">A</div>
                </div>
              </div>
            </IconOption>

            {/* Option 8: Diamond Crystal */}
            <IconOption
              title="Diamond Crystal"
              description="Crystalline geometric shape"
              selected={selected === 'diamond-crystal'}
              onClick={() => handleSelect('diamond-crystal')}
            >
              <div className="w-16 h-16 relative">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b"/>
                      <stop offset="50%" stopColor="#d97706"/>
                      <stop offset="100%" stopColor="#92400e"/>
                    </linearGradient>
                  </defs>
                  <polygon points="50,10 70,30 50,90 30,30" fill="url(#diamondGrad)"/>
                  <polygon points="30,30 50,10 50,50" fill="rgba(255,255,255,0.2)"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center mt-4">
                  <span className="text-white font-bold text-sm">OA</span>
                </div>
              </div>
            </IconOption>

          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Select an icon design for OCX AI. The chosen icon will be used as the website favicon and header logo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}