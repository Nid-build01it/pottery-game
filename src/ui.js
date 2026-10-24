import { PATTERNS, PATTERN_CATEGORIES, generatePatternThumbnail } from './patterns.js';
import { TARGET_POTS, drawPotSilhouette } from './scoring.js';
import { soundManager } from './audio.js';

export const GLAZE_COLORS = [
  { name: 'Terracotta', hex: '#b85d38' },
  { name: 'Ochre Orange', hex: '#ea580c' },
  { name: 'Sunshine Gold', hex: '#eab308' },
  { name: 'Emerald Green', hex: '#15803d' },
  { name: 'Aegean Teal', hex: '#0d9488' },
  { name: 'Cobalt Blue', hex: '#1d4ed8' },
  { name: 'Royal Plum', hex: '#6b21a8' },
  { name: 'Charcoal Black', hex: '#18181b' },
  { name: 'Pearl White', hex: '#f8fafc' }
];

export class UIManager {
  constructor(game) {
    this.game = game;
    this.currentTool = 'shape'; // 'shape' | 'smooth' | 'pattern' | 'paint' | 'eraser'
    this.selectedCategory = 'All';
    this.selectedPattern = PATTERNS[0];
    this.selectedColor = GLAZE_COLORS[0].hex;

    this.initDOMElements();
    this.bindEvents();
    this.renderCategoryTabs();
    this.renderPatternCards();
    this.renderColorPalette();
    this.updateTargetCard();
  }

  initDOMElements() {
    this.categoryTabsContainer = document.getElementById('category-tabs');
    this.patternBarContainer = document.getElementById('pattern-bar-cards');
    this.colorPaletteBar = document.getElementById('color-palette-bar');
    this.targetCanvas = document.getElementById('target-silhouette-canvas');
    this.targetNameEl = document.getElementById('target-pot-name');
    this.undoBtn = document.getElementById('btn-undo');
    this.exitBtn = document.getElementById('btn-exit');
    this.toolButtons = document.querySelectorAll('.tool-btn');
    this.soldModal = document.getElementById('sold-modal');
    this.exitModal = document.getElementById('exit-modal');
  }

  bindEvents() {
    // Top bar Undo & Exit
    this.undoBtn.addEventListener('click', () => {
      soundManager.playClick();
      this.game.undo();
    });

    this.exitBtn.addEventListener('click', () => {
      soundManager.playClick();
      this.showExitModal(true);
    });

    // Bottom tool buttons
    this.toolButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        soundManager.playClick();
        const tool = btn.dataset.tool;
        this.selectTool(tool);
      });
    });

    // Finish Pot button
    document.getElementById('btn-finish').addEventListener('click', () => {
      soundManager.playClick();
      this.game.finishPot();
    });

    // Screenshot button
    document.getElementById('btn-camera').addEventListener('click', () => {
      soundManager.playClick();
      this.game.takeScreenshot();
    });

    // Target Polaroid card click to cycle target
    document.getElementById('target-card').addEventListener('click', () => {
      soundManager.playClick();
      this.game.cycleTarget();
    });

    // Sold Modal actions
    document.getElementById('modal-btn-new').addEventListener('click', () => {
      soundManager.playClick();
      this.showSoldModal(false);
      this.game.newPot();
    });

    document.getElementById('modal-btn-keep').addEventListener('click', () => {
      soundManager.playClick();
      this.showSoldModal(false);
    });

    // Exit Modal actions
    document.getElementById('exit-btn-confirm').addEventListener('click', () => {
      soundManager.playClick();
      this.showExitModal(false);
      this.game.resetPot();
    });

    document.getElementById('exit-btn-cancel').addEventListener('click', () => {
      soundManager.playClick();
      this.showExitModal(false);
    });
  }

  selectTool(tool) {
    this.currentTool = tool;
    this.toolButtons.forEach(btn => {
      if (btn.dataset.tool === tool) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Show/hide color palette
    if (tool === 'paint') {
      this.colorPaletteBar.classList.remove('hidden');
    } else {
      this.colorPaletteBar.classList.add('hidden');
    }

    // Scroll pattern bar into view if pattern tool
    if (tool === 'pattern') {
      document.getElementById('pattern-strip-container').classList.remove('faded');
    }
  }

  renderCategoryTabs() {
    this.categoryTabsContainer.innerHTML = '';
    PATTERN_CATEGORIES.forEach(cat => {
      const tab = document.createElement('button');
      tab.className = `category-tab ${cat === this.selectedCategory ? 'active' : ''}`;
      tab.textContent = cat;
      tab.addEventListener('click', () => {
        soundManager.playClick();
        this.selectedCategory = cat;
        this.renderCategoryTabs();
        this.renderPatternCards();
      });
      this.categoryTabsContainer.appendChild(tab);
    });
  }

  renderPatternCards() {
    this.patternBarContainer.innerHTML = '';

    // 1. Eraser card
    const eraserCard = document.createElement('div');
    eraserCard.className = `pattern-card eraser-card ${this.currentTool === 'eraser' ? 'selected' : ''}`;
    eraserCard.innerHTML = `
      <div class="card-icon">🧹</div>
      <div class="card-label">Eraser</div>
    `;
    eraserCard.addEventListener('click', () => {
      soundManager.playClick();
      this.selectTool('eraser');
      this.renderPatternCards();
    });
    this.patternBarContainer.appendChild(eraserCard);

    // 2. Filtered patterns
    const filtered = this.selectedCategory === 'All'
      ? PATTERNS
      : PATTERNS.filter(p => p.category === this.selectedCategory);

    filtered.forEach(pattern => {
      const card = document.createElement('div');
      const isSelected = (this.currentTool === 'pattern' && this.selectedPattern.id === pattern.id);
      card.className = `pattern-card ${isSelected ? 'selected' : ''}`;

      const thumbUrl = generatePatternThumbnail(pattern, 90, 56);
      card.innerHTML = `
        <img class="card-thumb" src="${thumbUrl}" alt="${pattern.name}" />
        <div class="check-badge ${isSelected ? 'visible' : ''}">✓</div>
      `;

      card.addEventListener('click', () => {
        soundManager.playClick();
        this.selectedPattern = pattern;
        this.selectTool('pattern');
        this.renderPatternCards();
      });

      this.patternBarContainer.appendChild(card);
    });
  }

  renderColorPalette() {
    this.colorPaletteBar.innerHTML = '';
    GLAZE_COLORS.forEach((color, idx) => {
      const swatch = document.createElement('button');
      swatch.className = `color-swatch ${color.hex === this.selectedColor ? 'active' : ''}`;
      swatch.style.backgroundColor = color.hex;
      swatch.title = color.name;

      swatch.addEventListener('click', () => {
        soundManager.playClick();
        this.selectedColor = color.hex;
        this.renderColorPalette();
      });

      this.colorPaletteBar.appendChild(swatch);
    });
  }

  updateTargetCard() {
    const target = this.game.currentTarget;
    if (!target) return;
    this.targetNameEl.textContent = target.name;
    drawPotSilhouette(this.targetCanvas, target.radii, target.height);
  }

  showSoldModal(show, results = null) {
    if (show && results) {
      document.getElementById('sold-price').textContent = `$${results.price}`;
      document.getElementById('sold-target-name').textContent = results.targetName;
      document.getElementById('sold-shape-acc').textContent = `${results.shapePercent}%`;
      document.getElementById('sold-decor-bonus').textContent = `+$${results.totalBonus}`;

      // Star rendering
      const starContainer = document.getElementById('sold-stars');
      starContainer.innerHTML = '';
      for (let s = 1; s <= 5; s++) {
        const star = document.createElement('span');
        star.className = `star ${s <= results.stars ? 'filled' : 'empty'}`;
        star.textContent = '★';
        starContainer.appendChild(star);
      }

      this.soldModal.classList.remove('hidden');
      soundManager.playFanfare();
    } else {
      this.soldModal.classList.add('hidden');
    }
  }

  showExitModal(show) {
    if (show) {
      this.exitModal.classList.remove('hidden');
    } else {
      this.exitModal.classList.add('hidden');
    }
  }
}
