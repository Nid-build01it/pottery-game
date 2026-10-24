/**
 * Procedural Pottery Decorative Patterns
 * Generates cultural and geometric decorative bands seamlessly using HTML5 Canvas.
 * No external image files needed.
 */

export const PATTERN_CATEGORIES = ['All', 'African', 'Egyptian', 'American', 'Geometric'];

export const PATTERNS = [
  // African Patterns
  {
    id: 'afr_silhouette',
    name: 'Serengeti Dancers',
    category: 'African',
    draw(ctx, w, h) {
      // Warm sunset gradient background
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(0.5, '#ea580c');
      grad.addColorStop(1, '#9a3412');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Black ground trim lines
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, w, 4);
      ctx.fillRect(0, h - 5, w, 5);

      const repeats = 16;
      const step = w / repeats;
      for (let i = 0; i < repeats; i++) {
        const x = i * step;

        // Silhouette figure
        ctx.fillStyle = '#1c1917';
        // Head
        ctx.beginPath();
        ctx.arc(x + step * 0.35, h * 0.28, h * 0.09, 0, Math.PI * 2);
        ctx.fill();
        // Torso & limbs
        ctx.beginPath();
        ctx.moveTo(x + step * 0.35, h * 0.35);
        ctx.lineTo(x + step * 0.37, h * 0.68);
        ctx.lineTo(x + step * 0.22, h * 0.94);
        ctx.moveTo(x + step * 0.37, h * 0.68);
        ctx.lineTo(x + step * 0.48, h * 0.94);
        // Raised arms carrying urn
        ctx.moveTo(x + step * 0.35, h * 0.42);
        ctx.lineTo(x + step * 0.22, h * 0.25);
        ctx.lineTo(x + step * 0.3, h * 0.16);
        ctx.moveTo(x + step * 0.35, h * 0.42);
        ctx.lineTo(x + step * 0.48, h * 0.25);
        ctx.lineTo(x + step * 0.4, h * 0.16);
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#1c1917';
        ctx.stroke();

        // Small water pot on head
        ctx.beginPath();
        ctx.ellipse(x + step * 0.35, h * 0.15, step * 0.08, h * 0.07, 0, 0, Math.PI * 2);
        ctx.fill();

        // Stylized acacia tree
        const tx = x + step * 0.78;
        ctx.beginPath();
        ctx.moveTo(tx, h * 0.94);
        ctx.lineTo(tx, h * 0.45);
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(tx, h * 0.42, step * 0.16, h * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },
  {
    id: 'afr_chevron_orange',
    name: 'Tribal Chevron',
    category: 'African',
    draw(ctx, w, h) {
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(0, 0, w, h);

      // Top and bottom borders
      ctx.fillStyle = '#1e1b18';
      ctx.fillRect(0, 0, w, 6);
      ctx.fillRect(0, h - 6, w, 6);

      const repeats = 24;
      const step = w / repeats;
      for (let i = 0; i < repeats; i++) {
        const x = i * step;

        // Black outer chevron
        ctx.beginPath();
        ctx.moveTo(x, h - 6);
        ctx.lineTo(x + step * 0.5, 6);
        ctx.lineTo(x + step, h - 6);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#1e1b18';
        ctx.stroke();

        // Cream inner triangle
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.moveTo(x + step * 0.15, h - 8);
        ctx.lineTo(x + step * 0.5, 14);
        ctx.lineTo(x + step * 0.85, h - 8);
        ctx.closePath();
        ctx.fill();

        // Horizontal striped ladder in triangle
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 2.5;
        for (let s = 1; s <= 4; s++) {
          const y = 14 + s * ((h - 22) / 5);
          const ratio = (y - 14) / (h - 22);
          const halfWidth = ratio * (step * 0.35);
          ctx.beginPath();
          ctx.moveTo(x + step * 0.5 - halfWidth, y);
          ctx.lineTo(x + step * 0.5 + halfWidth, y);
          ctx.stroke();
        }
      }
    }
  },
  {
    id: 'afr_diamonds_beads',
    name: 'Kikuyu Diamonds',
    category: 'African',
    draw(ctx, w, h) {
      ctx.fillStyle = '#451a03';
      ctx.fillRect(0, 0, w, h);

      const repeats = 20;
      const step = w / repeats;
      for (let i = 0; i < repeats; i++) {
        const x = i * step;
        const cx = x + step * 0.5;
        const cy = h * 0.5;

        // Big outer diamond
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.moveTo(cx, 6);
        ctx.lineTo(x + step - 4, cy);
        ctx.lineTo(cx, h - 6);
        ctx.lineTo(x + 4, cy);
        ctx.closePath();
        ctx.fill();

        // Inner black diamond
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.moveTo(cx, h * 0.25);
        ctx.lineTo(cx + step * 0.28, cy);
        ctx.lineTo(cx, h * 0.75);
        ctx.lineTo(cx - step * 0.28, cy);
        ctx.closePath();
        ctx.fill();

        // Center turquoise bead
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(cx, cy, h * 0.12, 0, Math.PI * 2);
        ctx.fill();

        // Corner white dots
        ctx.fillStyle = '#fafaf9';
        ctx.beginPath();
        ctx.arc(x, cy, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },
  {
    id: 'afr_dots_band',
    name: 'Omo Valley Dots',
    category: 'African',
    draw(ctx, w, h) {
      ctx.fillStyle = '#292524';
      ctx.fillRect(0, 0, w, h);

      // Ochre central lane
      ctx.fillStyle = '#b45309';
      ctx.fillRect(0, h * 0.28, w, h * 0.44);

      const repeats = 32;
      const step = w / repeats;
      for (let i = 0; i < repeats; i++) {
        const x = i * step + step * 0.5;

        // Center white dot
        ctx.fillStyle = '#f5f5f4';
        ctx.beginPath();
        ctx.arc(x, h * 0.5, h * 0.14, 0, Math.PI * 2);
        ctx.fill();

        // Outer small terracotta dots
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(x, h * 0.14, 4, 0, Math.PI * 2);
        ctx.arc(x, h * 0.86, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },

  // Egyptian Patterns
  {
    id: 'egy_lotus_arches',
    name: 'Nile Lotus Arches',
    category: 'Egyptian',
    draw(ctx, w, h) {
      ctx.fillStyle = '#fef08a'; // Pale gold
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, 5);
      ctx.fillRect(0, h - 5, w, 5);

      const repeats = 20;
      const step = w / repeats;
      for (let i = 0; i < repeats; i++) {
        const x = i * step;

        // Teal rounded arch
        ctx.fillStyle = '#0d9488';
        ctx.beginPath();
        ctx.moveTo(x + 4, h - 5);
        ctx.arcTo(x + step * 0.5, 8, x + step - 4, h - 5, step * 0.45);
        ctx.lineTo(x + step - 4, h - 5);
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#0f172a';
        ctx.stroke();

        // Vertical fluted reeds inside arch
        ctx.strokeStyle = '#042f2e';
        ctx.lineWidth = 2.5;
        for (let r = 1; r <= 3; r++) {
          const rx = x + r * (step / 4);
          ctx.beginPath();
          ctx.moveTo(rx, h - 6);
          ctx.lineTo(rx, 22);
          ctx.stroke();
        }
      }
    }
  },
  {
    id: 'egy_lapis_crescent',
    name: 'Pharaoh Lapis',
    category: 'Egyptian',
    draw(ctx, w, h) {
      ctx.fillStyle = '#1e3a8a'; // Deep lapis blue
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#eab308'; // Gold trims
      ctx.fillRect(0, 0, w, 7);
      ctx.fillRect(0, h - 7, w, 7);

      const repeats = 24;
      const step = w / repeats;
      for (let i = 0; i < repeats; i++) {
        const cx = i * step + step * 0.5;

        // Gold crescent
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(cx, h * 0.5, h * 0.28, 0, Math.PI);
        ctx.fill();

        // Inlaid turquoise bead
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(cx, h * 0.5, h * 0.16, 0, Math.PI * 2);
        ctx.fill();

        // Accent black dot
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(cx, h * 0.5, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },
  {
    id: 'egy_papyrus_columns',
    name: 'Papyrus Reeds',
    category: 'Egyptian',
    draw(ctx, w, h) {
      ctx.fillStyle = '#fef9c3';
      ctx.fillRect(0, 0, w, h);

      const repeats = 36;
      const step = w / repeats;
      for (let i = 0; i < repeats; i++) {
        const x = i * step;

        ctx.fillStyle = (i % 2 === 0) ? '#166534' : '#15803d';
        ctx.beginPath();
        ctx.roundRect(x + 2, 8, step - 4, h - 16, 4);
        ctx.fill();

        ctx.fillStyle = '#eab308';
        ctx.fillRect(x + 2, h * 0.42, step - 4, 5);
      }
    }
  },

  // American Patterns (Navajo / Southwest / Aztec)
  {
    id: 'ame_sawtooth_bw',
    name: 'Navajo Sawtooth',
    category: 'American',
    draw(ctx, w, h) {
      ctx.fillStyle = '#fafaf9';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#18181b';
      const repeats = 20;
      const step = w / repeats;
      for (let i = 0; i < repeats; i++) {
        const x = i * step;

        // Top triangle
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + step * 0.5, h * 0.5);
        ctx.lineTo(x + step, 0);
        ctx.closePath();
        ctx.fill();

        // Bottom triangle
        ctx.beginPath();
        ctx.moveTo(x + step * 0.5, h * 0.5);
        ctx.lineTo(x + step, h);
        ctx.lineTo(x, h);
        ctx.closePath();
        ctx.fill();
      }
    }
  },
  {
    id: 'ame_stepped_fret',
    name: 'Southwest Stepped Fret',
    category: 'American',
    draw(ctx, w, h) {
      ctx.fillStyle = '#991b1b'; // Deep Southwest red
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, w, 5);
      ctx.fillRect(0, h - 5, w, 5);

      const repeats = 18;
      const step = w / repeats;
      for (let i = 0; i < repeats; i++) {
        const x = i * step;

        // Turquoise stepped terraced pyramid
        ctx.fillStyle = '#2dd4bf';
        ctx.beginPath();
        ctx.rect(x + step * 0.1, h * 0.65, step * 0.8, h * 0.25);
        ctx.rect(x + step * 0.25, h * 0.4, step * 0.5, h * 0.25);
        ctx.rect(x + step * 0.38, h * 0.15, step * 0.24, h * 0.25);
        ctx.fill();

        // Pale cream center highlight
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(x + step * 0.5, h * 0.5, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },
  {
    id: 'ame_sunburst_arrows',
    name: 'Aztec Sunburst',
    category: 'American',
    draw(ctx, w, h) {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, 0, w, h);

      const repeats = 24;
      const step = w / repeats;
      for (let i = 0; i < repeats; i++) {
        const x = i * step;

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(x, h * 0.5);
        ctx.lineTo(x + step * 0.5, 8);
        ctx.lineTo(x + step, h * 0.5);
        ctx.lineTo(x + step * 0.5, h - 8);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(x + step * 0.5, h * 0.5, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },

  // Geometric / Classical Patterns
  {
    id: 'geo_greek_key',
    name: 'Greek Meander',
    category: 'Geometric',
    draw(ctx, w, h) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 4;
      ctx.lineCap = 'square';
      ctx.lineJoin = 'miter';

      const repeats = 24;
      const step = w / repeats;
      const padY = h * 0.18;
      const lowY = h - padY;
      const midLowY = h * 0.65;
      const midHighY = h * 0.35;
      const highY = padY;

      for (let i = 0; i < repeats; i++) {
        const x = i * step;
        ctx.beginPath();
        ctx.moveTo(x, lowY);
        ctx.lineTo(x + step * 0.7, lowY);
        ctx.lineTo(x + step * 0.7, highY);
        ctx.lineTo(x + step * 0.25, highY);
        ctx.lineTo(x + step * 0.25, midLowY);
        ctx.lineTo(x + step * 0.5, midLowY);
        ctx.lineTo(x + step * 0.5, midHighY);
        ctx.stroke();
      }
    }
  },
  {
    id: 'geo_running_wave',
    name: 'Running Wave',
    category: 'Geometric',
    draw(ctx, w, h) {
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, w, 5);
      ctx.fillRect(0, h - 5, w, 5);

      const repeats = 20;
      const step = w / repeats;
      ctx.fillStyle = '#e0f2fe';

      for (let i = 0; i < repeats; i++) {
        const x = i * step;
        ctx.beginPath();
        ctx.moveTo(x, h - 6);
        ctx.bezierCurveTo(x + step * 0.4, h - 6, x + step * 0.6, 12, x + step * 0.95, 12);
        ctx.bezierCurveTo(x + step * 0.75, 12, x + step * 0.6, h * 0.5, x + step * 0.75, h * 0.6);
        ctx.bezierCurveTo(x + step * 0.85, h * 0.68, x + step * 0.9, h * 0.55, x + step * 0.85, h * 0.45);
        ctx.lineTo(x + step, h - 6);
        ctx.closePath();
        ctx.fill();
      }
    }
  },
  {
    id: 'geo_beaded_rings',
    name: 'Pearl Strings',
    category: 'Geometric',
    draw(ctx, w, h) {
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.3);
      ctx.lineTo(w, h * 0.3);
      ctx.moveTo(0, h * 0.7);
      ctx.lineTo(w, h * 0.7);
      ctx.stroke();

      const repeats = 36;
      const step = w / repeats;
      for (let i = 0; i < repeats; i++) {
        const cx = i * step + step * 0.5;

        // Big center pearl
        const grad = ctx.createRadialGradient(cx - 2, h * 0.5 - 2, 1, cx, h * 0.5, 9);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.7, '#e2e8f0');
        grad.addColorStop(1, '#64748b');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, h * 0.5, 9, 0, Math.PI * 2);
        ctx.fill();

        // Upper & lower small beads
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(cx, h * 0.22, 3, 0, Math.PI * 2);
        ctx.arc(cx, h * 0.78, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
];

/**
 * Generate a thumbnail data URL for a given pattern to render in the pattern bar.
 */
export function generatePatternThumbnail(pattern, width = 80, height = 52) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  // Draw pattern across thumbnail width
  pattern.draw(ctx, width, height);
  return canvas.toDataURL('image/png');
}
