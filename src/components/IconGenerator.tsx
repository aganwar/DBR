// src/components/IconGenerator.tsx
import React from 'react';

interface IconGeneratorProps {
  iconType: string;
  size?: number;
  className?: string;
}

export default function IconGenerator({ iconType, size = 32, className = '' }: IconGeneratorProps) {
  const baseStyle = { width: size, height: size };

  switch (iconType) {
    case 'modern-letters':
      return (
        <div
          className={`bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center ${className}`}
          style={baseStyle}
        >
          <span className="text-white font-bold" style={{ fontSize: size * 0.375 }}>OA</span>
        </div>
      );

    case 'hexagon-tech':
      return (
        <div className={`relative ${className}`} style={baseStyle}>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon
                points="50,5 85,25 85,75 50,95 15,75 15,25"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold" style={{ fontSize: size * 0.25 }}>OA</span>
          </div>
        </div>
      );

    case 'circuit-brain':
      return (
        <div
          className={`bg-gradient-to-br from-indigo-600 to-pink-600 rounded-xl flex items-center justify-center ${className}`}
          style={baseStyle}
        >
          <svg className="text-white" style={{ width: size * 0.625, height: size * 0.625 }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L18.5 7C18.5 7.8 18.1 8.5 17.4 9C17.7 9.6 18 10.2 18 11C18 12.1 17.1 13 16 13S14 12.1 14 11C14 10.2 14.3 9.6 14.6 9C13.9 8.5 13.5 7.8 13.5 7L10.5 7C10.5 7.8 10.1 8.5 9.4 9C9.7 9.6 10 10.2 10 11C10 12.1 9.1 13 8 13S6 12.1 6 11C6 10.2 6.3 9.6 6.6 9C5.9 8.5 5.5 7.8 5.5 7L3 7V9H5C5.6 9 6 9.4 6 10V14C6 14.6 5.6 15 5 15H3V17H5.5C5.5 16.2 5.9 15.5 6.6 15C6.3 14.4 6 13.8 6 13C6 11.9 6.9 11 8 11S10 11.9 10 13C10 13.8 9.7 14.4 9.4 15C10.1 15.5 10.5 16.2 10.5 17L13.5 17C13.5 16.2 13.9 15.5 14.6 15C14.3 14.4 14 13.8 14 13C14 11.9 14.9 11 16 11S18 11.9 18 13C18 13.8 17.7 14.4 17.4 15C18.1 15.5 18.5 16.2 18.5 17L21 17V15H19C18.4 15 18 14.6 18 14V10C18 9.4 18.4 9 19 9H21Z"/>
          </svg>
        </div>
      );

    case 'cube-3d':
      return (
        <div className={`relative ${className}`} style={baseStyle}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id={`topGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6"/>
                <stop offset="100%" stopColor="#1d4ed8"/>
              </linearGradient>
              <linearGradient id={`leftGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e40af"/>
                <stop offset="100%" stopColor="#1e3a8a"/>
              </linearGradient>
              <linearGradient id={`rightGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563eb"/>
                <stop offset="100%" stopColor="#1d4ed8"/>
              </linearGradient>
            </defs>
            <polygon points="50,20 25,35 50,50 75,35" fill={`url(#topGrad-${size})`}/>
            <polygon points="25,35 25,65 50,80 50,50" fill={`url(#leftGrad-${size})`}/>
            <polygon points="50,50 50,80 75,65 75,35" fill={`url(#rightGrad-${size})`}/>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold" style={{ fontSize: size * 0.25, marginTop: size * 0.125 }}>OA</span>
          </div>
        </div>
      );

    case 'ai-chip':
      return (
        <div
          className={`bg-gradient-to-br from-purple-600 to-blue-700 rounded-lg ${className}`}
          style={baseStyle}
        >
          <div className="w-full h-full p-1">
            <div className="w-full h-full bg-slate-900 rounded border border-purple-400 relative">
              <div className="absolute inset-0.5 bg-gradient-to-br from-purple-500 to-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold" style={{ fontSize: size * 0.25 }}>OA</span>
              </div>
              {/* Chip pins */}
              <div className="absolute -left-0.5 top-1/4 w-1 h-0.5 bg-purple-400 rounded-r"></div>
              <div className="absolute -left-0.5 top-1/2 w-1 h-0.5 bg-purple-400 rounded-r"></div>
              <div className="absolute -left-0.5 top-3/4 w-1 h-0.5 bg-purple-400 rounded-r"></div>
              <div className="absolute -right-0.5 top-1/4 w-1 h-0.5 bg-purple-400 rounded-l"></div>
              <div className="absolute -right-0.5 top-1/2 w-1 h-0.5 bg-purple-400 rounded-l"></div>
              <div className="absolute -right-0.5 top-3/4 w-1 h-0.5 bg-purple-400 rounded-l"></div>
            </div>
          </div>
        </div>
      );

    case 'neural-network':
      return (
        <div
          className={`bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center relative ${className}`}
          style={baseStyle}
        >
          <svg className="text-white" style={{ width: size * 0.75, height: size * 0.75 }} fill="currentColor" viewBox="0 0 24 24">
            <circle cx="6" cy="6" r="2"/>
            <circle cx="18" cy="6" r="2"/>
            <circle cx="6" cy="18" r="2"/>
            <circle cx="18" cy="18" r="2"/>
            <circle cx="12" cy="12" r="3"/>
            <path d="M8 6L10 10M16 6L14 10M8 18L10 14M16 18L14 14" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
            <span className="text-white font-bold" style={{ fontSize: size * 0.2 }}>OA</span>
          </div>
        </div>
      );

    case 'minimalist-circle':
      return (
        <div
          className={`bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center border-2 border-slate-300 dark:border-slate-600 ${className}`}
          style={baseStyle}
        >
          <div className="text-center">
            <div className="text-white font-bold leading-none" style={{ fontSize: size * 0.375 }}>O</div>
            <div className="text-white font-bold leading-none" style={{ fontSize: size * 0.25 }}>A</div>
          </div>
        </div>
      );

    case 'diamond-crystal':
      return (
        <div className={`relative ${className}`} style={baseStyle}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id={`diamondGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b"/>
                <stop offset="50%" stopColor="#d97706"/>
                <stop offset="100%" stopColor="#92400e"/>
              </linearGradient>
            </defs>
            <polygon points="50,10 70,30 50,90 30,30" fill={`url(#diamondGrad-${size})`}/>
            <polygon points="30,30 50,10 50,50" fill="rgba(255,255,255,0.2)"/>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center" style={{ marginTop: size * 0.25 }}>
            <span className="text-white font-bold" style={{ fontSize: size * 0.3 }}>OA</span>
          </div>
        </div>
      );

    default:
      return (
        <div
          className={`bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center ${className}`}
          style={baseStyle}
        >
          <span className="text-white font-bold" style={{ fontSize: size * 0.375 }}>OA</span>
        </div>
      );
  }
}