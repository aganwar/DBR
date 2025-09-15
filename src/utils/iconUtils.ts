// src/utils/iconUtils.ts

export function updateFavicon(iconType: string) {
  // Create a canvas to draw the icon
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const size = 32;
  canvas.width = size;
  canvas.height = size;

  // Clear canvas
  ctx.clearRect(0, 0, size, size);

  switch (iconType) {
    case 'modern-letters':
      // Gradient background
      const gradient1 = ctx.createLinearGradient(0, 0, size, size);
      gradient1.addColorStop(0, '#2563eb');
      gradient1.addColorStop(1, '#7c3aed');
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, size, size);

      // Text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('OA', size/2, size/2);
      break;

    case 'hexagon-tech':
      // Hexagon
      const centerX = size / 2;
      const centerY = size / 2;
      const radius = size * 0.4;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      const gradient2 = ctx.createLinearGradient(0, 0, size, size);
      gradient2.addColorStop(0, '#10b981');
      gradient2.addColorStop(1, '#0d9488');
      ctx.fillStyle = gradient2;
      ctx.fill();

      // Text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 8px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('OA', centerX, centerY);
      break;

    case 'circuit-brain':
      // Background
      const gradient3 = ctx.createLinearGradient(0, 0, size, size);
      gradient3.addColorStop(0, '#4f46e5');
      gradient3.addColorStop(1, '#ec4899');
      ctx.fillStyle = gradient3;
      ctx.fillRect(0, 0, size, size);

      // Simple circuit pattern
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(4, size/2);
      ctx.lineTo(size-4, size/2);
      ctx.moveTo(size/2, 4);
      ctx.lineTo(size/2, size-4);
      ctx.stroke();

      // Text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('OA', size/2, size/2);
      break;

    case 'minimalist-circle':
      // Circle background
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2 - 2, 0, 2 * Math.PI);
      const gradient4 = ctx.createLinearGradient(0, 0, size, size);
      gradient4.addColorStop(0, '#475569');
      gradient4.addColorStop(1, '#1e293b');
      ctx.fillStyle = gradient4;
      ctx.fill();

      // Border
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('O', size/2, size/2 - 3);
      ctx.font = 'bold 8px Arial';
      ctx.fillText('A', size/2, size/2 + 5);
      break;

    default:
      // Default modern letters
      const defaultGradient = ctx.createLinearGradient(0, 0, size, size);
      defaultGradient.addColorStop(0, '#2563eb');
      defaultGradient.addColorStop(1, '#7c3aed');
      ctx.fillStyle = defaultGradient;
      ctx.fillRect(0, 0, size, size);

      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('OA', size/2, size/2);
  }

  // Convert to data URL and update favicon
  const dataURL = canvas.toDataURL('image/png');

  // Remove existing favicon
  const existingFavicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (existingFavicon) {
    existingFavicon.href = dataURL;
  } else {
    // Create new favicon link
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/png';
    favicon.href = dataURL;
    document.head.appendChild(favicon);
  }
}

export function initializeFavicon() {
  const savedIcon = localStorage.getItem('ocx-ai-icon') || 'modern-letters';
  updateFavicon(savedIcon);
}