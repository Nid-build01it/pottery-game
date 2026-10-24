import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ClayPot, MIN_HEIGHT, MAX_HEIGHT } from './clay.js';
import { HistoryManager } from './history.js';
import { TARGET_POTS, scorePot } from './scoring.js';
import { UIManager } from './ui.js';
import { soundManager } from './audio.js';

const STORAGE_KEY = 'pottery_game_saved_pot_v1';

class PotteryGame {
  constructor() {
    this.targetIndex = 0;
    this.currentTarget = TARGET_POTS[0];

    this.wheelSpinSpeed = 1.2; // default idle spin speed (rad/s)
    this.targetSpinSpeed = 1.2;
    this.currentSpinSpeed = 1.2;

    this.initThree();
    this.initScene();
    this.initInteraction();

    this.history = new HistoryManager(30);
    this.ui = new UIManager(this);

    // Initial history snapshot
    this.saveSnapshot();

    // Try load previous pot
    this.loadFromStorage();

    this.clock = new THREE.Clock();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initThree() {
    this.container = document.getElementById('canvas-container');

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      50
    );
    this.camera.position.set(0, 2.2, 5.6);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.container.appendChild(this.renderer.domElement);

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false;
    this.controls.minDistance = 3.6;
    this.controls.maxDistance = 7.5;
    this.controls.minPolarAngle = Math.PI * 0.32;
    this.controls.maxPolarAngle = Math.PI * 0.52;
    this.controls.target.set(0, 1.4, 0);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  initScene() {
    // Soft studio lighting
    // Ambient / Hemisphere light: sky blue-green, warm earth ground
    const hemiLight = new THREE.HemisphereLight(0xfffbeb, 0x1f2937, 0.95);
    this.scene.add(hemiLight);

    // Key directional light with soft shadows
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.35);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 16;
    keyLight.shadow.camera.left = -3;
    keyLight.shadow.camera.right = 3;
    keyLight.shadow.camera.top = 4;
    keyLight.shadow.camera.bottom = -2;
    keyLight.shadow.bias = -0.0006;
    this.scene.add(keyLight);

    // Soft fill rim light
    const fillLight = new THREE.DirectionalLight(0xa5f3fc, 0.45);
    fillLight.position.set(-4, 3, -3);
    this.scene.add(fillLight);

    // Potter's wheel and clay
    this.clay = new ClayPot(this.scene);
  }

  initInteraction() {
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.isDragging = false;
    this.isShapingPot = false;
    this.dragStartSlice = -1;
    this.lastPointerPos = { x: 0, y: 0 };
    this.hasModifiedInStroke = false;

    const dom = this.renderer.domElement;

    // Pointer events for mouse & touch
    dom.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    window.addEventListener('pointermove', (e) => this.onPointerMove(e));
    window.addEventListener('pointerup', () => this.onPointerUp());
    window.addEventListener('pointercancel', () => this.onPointerUp());
  }

  getRaycastHit(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObject(this.clay.mesh, false);
    return (intersects.length > 0) ? intersects[0] : null;
  }

  onPointerDown(event) {
    soundManager.init();
    const hit = this.getRaycastHit(event);

    if (hit) {
      // User tapped on the clay: disable camera OrbitControls
      this.controls.enabled = false;
      this.isShapingPot = true;
      this.isDragging = true;
      this.hasModifiedInStroke = false;

      // Save state before this stroke begins
      this.saveSnapshot();

      const localHit = this.clay.mesh.worldToLocal(hit.point.clone());
      const v = THREE.MathUtils.clamp(localHit.y / this.clay.height, 0, 1);
      const sliceIdx = Math.round(v * (this.clay.sliceCount - 1));

      this.dragStartSlice = sliceIdx;
      this.hitSide = (hit.point.x >= 0) ? 1 : -1;
      this.lastPointerPos = { x: event.clientX, y: event.clientY };

      // Tool click action
      const tool = this.ui.currentTool;
      if (tool === 'pattern') {
        this.clay.applyPatternBand(v, this.ui.selectedPattern);
        soundManager.playStamp();
        this.hasModifiedInStroke = true;
      } else if (tool === 'paint') {
        this.clay.paintGlazeBand(v, this.ui.selectedColor);
        soundManager.playBrush();
        this.hasModifiedInStroke = true;
      } else if (tool === 'eraser') {
        this.clay.eraseBand(v);
        soundManager.playBrush();
        this.hasModifiedInStroke = true;
      }
    } else {
      // User tapped background: orbit controls handle camera view
      this.controls.enabled = true;
      this.isShapingPot = false;
      this.isDragging = true;
    }
  }

  onPointerMove(event) {
    if (!this.isDragging) return;

    if (this.isShapingPot) {
      const deltaX = event.clientX - this.lastPointerPos.x;
      const deltaY = event.clientY - this.lastPointerPos.y;
      this.lastPointerPos = { x: event.clientX, y: event.clientY };

      const tool = this.ui.currentTool;

      if (tool === 'shape') {
        // Dragging top edge vertically raises or lowers height
        if (this.dragStartSlice >= this.clay.sliceCount - 6 && Math.abs(deltaY) > Math.abs(deltaX) * 1.1) {
          const deltaH = -deltaY * 0.008;
          this.clay.adjustHeight(deltaH);
          soundManager.playSquish(Math.abs(deltaY) * 0.1);
          this.hasModifiedInStroke = true;
        } else {
          // Horizontal drag adjusts slice radius with Gaussian falloff
          const deltaRadius = deltaX * 0.006 * this.hitSide;
          if (Math.abs(deltaRadius) > 0.0005) {
            this.clay.shapeRadius(this.dragStartSlice, deltaRadius);
            soundManager.playSquish(Math.abs(deltaX) * 0.1);
            this.hasModifiedInStroke = true;
          }
        }
      } else if (tool === 'smooth') {
        // Smooth local surface ripples
        this.clay.smoothSlices(this.dragStartSlice, 0.35);
        soundManager.playSquish(0.8);
        this.hasModifiedInStroke = true;
      } else if (tool === 'paint' || tool === 'eraser' || tool === 'pattern') {
        // Continuous brush along height while dragging
        const hit = this.getRaycastHit(event);
        if (hit) {
          const localHit = this.clay.mesh.worldToLocal(hit.point.clone());
          const v = THREE.MathUtils.clamp(localHit.y / this.clay.height, 0, 1);
          if (tool === 'paint') {
            this.clay.paintGlazeBand(v, this.ui.selectedColor, 0.2);
            soundManager.playBrush();
          } else if (tool === 'eraser') {
            this.clay.eraseBand(v, 0.08);
            soundManager.playBrush();
          }
          this.hasModifiedInStroke = true;
        }
      }
    }
  }

  onPointerUp() {
    this.isDragging = false;
    this.isShapingPot = false;
    this.controls.enabled = true;

    // Auto-save state to localStorage if modified
    if (this.hasModifiedInStroke) {
      this.saveToStorage();
    }
  }

  saveSnapshot() {
    const snap = this.history.createSnapshot(
      this.clay.radii,
      this.clay.height,
      this.clay.ctx,
      this.clay.canvas.width,
      this.clay.canvas.height
    );
    this.history.push(snap);
  }

  undo() {
    if (!this.history.canUndo()) return;
    const currentSnap = this.history.createSnapshot(
      this.clay.radii,
      this.clay.height,
      this.clay.ctx,
      this.clay.canvas.width,
      this.clay.canvas.height
    );
    const prev = this.history.undo(currentSnap);
    if (prev) {
      this.clay.restoreState(prev);
      this.saveToStorage();
    }
  }

  resetPot() {
    this.clay.resetToDefaultProfile();
    this.history.clear();
    this.saveSnapshot();
    this.saveToStorage();
  }

  newPot() {
    this.cycleTarget();
    this.resetPot();
  }

  cycleTarget() {
    this.targetIndex = (this.targetIndex + 1) % TARGET_POTS.length;
    this.currentTarget = TARGET_POTS[this.targetIndex];
    this.ui.updateTargetCard();
  }

  finishPot() {
    const results = scorePot(
      this.clay.radii,
      this.clay.height,
      this.currentTarget,
      this.clay.patternCount,
      this.clay.paintCount
    );
    this.ui.showSoldModal(true, results);
  }

  takeScreenshot() {
    // Hide UI overlays temporarily for a pristine 4K/HD screenshot of the player's creation
    const uiOverlay = document.getElementById('ui-layer');
    uiOverlay.style.display = 'none';

    // Render one high quality frame
    this.renderer.render(this.scene, this.camera);
    const dataUrl = this.renderer.domElement.toDataURL('image/png');

    uiOverlay.style.display = '';

    // Trigger download
    const link = document.createElement('a');
    link.download = `pottery-creation-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  }

  saveToStorage() {
    try {
      const data = {
        radii: Array.from(this.clay.radii),
        height: this.clay.height,
        targetIndex: this.targetIndex,
        texture: this.clay.canvas.toDataURL('image/webp', 0.85)
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // Storage limit fallback
    }
  }

  loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.radii && data.radii.length === this.clay.sliceCount) {
        this.clay.radii.set(data.radii);
        this.clay.height = data.height || 3.2;
        if (data.targetIndex !== undefined) {
          this.targetIndex = data.targetIndex % TARGET_POTS.length;
          this.currentTarget = TARGET_POTS[this.targetIndex];
          this.ui.updateTargetCard();
        }
        if (data.texture) {
          const img = new Image();
          img.onload = () => {
            this.clay.ctx.drawImage(img, 0, 0);
            this.clay.texture.needsUpdate = true;
          };
          img.src = data.texture;
        }
        this.clay.rebuildPositions();
      }
    } catch (e) {
      // Ignore corrupted storage
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  animate() {
    requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();

    // Wheel spin animation:
    // Spins smoothly, eases slightly during active shaping
    this.targetSpinSpeed = this.isShapingPot ? 0.75 : this.wheelSpinSpeed;
    this.currentSpinSpeed += (this.targetSpinSpeed - this.currentSpinSpeed) * 0.08;

    const spinAngle = this.currentSpinSpeed * delta;
    this.clay.group.rotation.y += spinAngle;

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

// Start game when page loads
window.addEventListener('DOMContentLoaded', () => {
  new PotteryGame();
});
