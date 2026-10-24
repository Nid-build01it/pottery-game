import * as THREE from 'three';
import { SLICE_COUNT } from './scoring.js';

export const MIN_RADIUS = 0.26;
export const MAX_RADIUS = 2.45;
export const MIN_HEIGHT = 1.8;
export const MAX_HEIGHT = 4.4;

export const DEFAULT_CLAY_COLOR = '#e5dfd3';
export const POT_CANVAS_WIDTH = 2048;
export const POT_CANVAS_HEIGHT = 1024;

export class ClayPot {
  constructor(scene) {
    this.scene = scene;
    this.sliceCount = SLICE_COUNT;
    this.segments = 48;

    // Radii array for the outer pot wall
    this.radii = new Float32Array(this.sliceCount);
    this.height = 3.2;

    // Decoration stats for scoring
    this.patternCount = 0;
    this.paintCount = 0;

    // Precompute sine/cosine tables for fast position updates
    this.sinTable = new Float32Array(this.segments + 1);
    this.cosTable = new Float32Array(this.segments + 1);
    for (let i = 0; i <= this.segments; i++) {
      const phi = (i / this.segments) * Math.PI * 2;
      this.sinTable[i] = Math.sin(phi);
      this.cosTable[i] = Math.cos(phi);
    }

    // Canvas texture setup
    this.initTextureCanvas();

    // Procedural bump map for throwing rings
    this.bumpTexture = this.createThrowingRingsBumpMap();

    // Group containing wheel and pot
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Build wheel and pot
    this.initWheel();
    this.initGeometry();
    this.resetToDefaultProfile();
  }

  /**
   * Procedural canvas for diffuse paint & patterns.
   */
  initTextureCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = POT_CANVAS_WIDTH;
    this.canvas.height = POT_CANVAS_HEIGHT;
    this.ctx = this.canvas.getContext('2d');

    // Base background canvas for eraser restore
    this.baseCanvas = document.createElement('canvas');
    this.baseCanvas.width = POT_CANVAS_WIDTH;
    this.baseCanvas.height = POT_CANVAS_HEIGHT;
    this.baseCtx = this.baseCanvas.getContext('2d');

    this.renderBaseClayTexture();

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.wrapS = THREE.RepeatWrapping;
    this.texture.wrapT = THREE.ClampToEdgeWrapping;
    this.texture.generateMipmaps = true;
    this.texture.minFilter = THREE.LinearMipmapLinearFilter;
  }

  renderBaseClayTexture() {
    const ctx = this.ctx;
    const w = POT_CANVAS_WIDTH;
    const h = POT_CANVAS_HEIGHT;

    // Smooth stoneware gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#f2ece4');
    grad.addColorStop(0.3, '#ebe3d8');
    grad.addColorStop(0.7, '#e4dacf');
    grad.addColorStop(1, '#dbd0c4');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle throwing rings shading in diffuse
    ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
    for (let y = 0; y < h; y += 4) {
      if (Math.sin(y * 0.15) > 0) {
        ctx.fillRect(0, y, w, 2);
      }
    }

    // Save base for eraser
    this.baseCtx.drawImage(this.canvas, 0, 0);
  }

  /**
   * Procedural throwing rings + grain bump map
   */
  createThrowingRingsBumpMap() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      // Horizontal ceramic grooves
      const wave1 = Math.sin((y / size) * Math.PI * 48) * 16;
      const wave2 = Math.sin((y / size) * Math.PI * 110) * 8;
      const wave3 = Math.sin((y / size) * Math.PI * 220) * 4;
      const groove = wave1 + wave2 + wave3;

      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const noise = (Math.random() - 0.5) * 14;
        const val = Math.min(255, Math.max(0, 128 + groove + noise));
        data[idx] = val;
        data[idx + 1] = val;
        data[idx + 2] = val;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 6);
    return texture;
  }

  /**
   * Create the spinning potter's wheel with paint splatters.
   */
  initWheel() {
    const wheelGroup = new THREE.Group();

    // Wheel top canvas texture (wood/iron turntable with centering rings and colorful splatters)
    const wheelCanvas = document.createElement('canvas');
    wheelCanvas.width = 1024;
    wheelCanvas.height = 1024;
    const ctx = wheelCanvas.getContext('2d');

    // Turntable stone/metal gradient
    const grad = ctx.createRadialGradient(512, 512, 20, 512, 512, 512);
    grad.addColorStop(0, '#e5e7eb');
    grad.addColorStop(0.65, '#cbd5e1');
    grad.addColorStop(0.95, '#94a3b8');
    grad.addColorStop(1, '#64748b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Concentric potter's centering rings
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
    ctx.lineWidth = 3;
    const ringRadii = [80, 160, 240, 320, 400, 460];
    ringRadii.forEach(r => {
      ctx.beginPath();
      ctx.arc(512, 512, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Splatters of colorful glazes from previous pots (matching game look)
    const splatterColors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6'];
    for (let s = 0; s < 45; s++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 180 + Math.random() * 300;
      const sx = 512 + Math.cos(angle) * dist;
      const sy = 512 + Math.sin(angle) * dist;
      const radius = 6 + Math.random() * 22;
      ctx.fillStyle = splatterColors[s % splatterColors.length];
      ctx.globalAlpha = 0.55 + Math.random() * 0.35;

      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Droplet streaks
      for (let d = 0; d < 4; d++) {
        const dripAngle = Math.random() * Math.PI * 2;
        const dripDist = radius + Math.random() * 20;
        ctx.beginPath();
        ctx.arc(sx + Math.cos(dripAngle) * dripDist, sy + Math.sin(dripAngle) * dripDist, 2 + Math.random() * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1.0;

    const wheelTex = new THREE.CanvasTexture(wheelCanvas);
    const wheelMat = new THREE.MeshStandardMaterial({
      map: wheelTex,
      roughness: 0.65,
      metalness: 0.15
    });

    // Turntable disk
    const diskGeo = new THREE.CylinderGeometry(2.7, 2.75, 0.22, 48);
    this.wheelDisk = new THREE.Mesh(diskGeo, wheelMat);
    this.wheelDisk.position.y = 0.11;
    this.wheelDisk.receiveShadow = true;
    wheelGroup.add(this.wheelDisk);

    // Pedestal base
    const baseGeo = new THREE.CylinderGeometry(1.6, 2.1, 0.45, 36);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.85
    });
    const pedestal = new THREE.Mesh(baseGeo, baseMat);
    pedestal.position.y = -0.22;
    pedestal.receiveShadow = true;
    wheelGroup.add(pedestal);

    // Soft contact shadow disk underneath wheel
    const shadowGeo = new THREE.CircleGeometry(3.2, 36);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sctx = shadowCanvas.getContext('2d');
    const sgrad = sctx.createRadialGradient(64, 64, 10, 64, 64, 64);
    sgrad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
    sgrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
    sgrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sctx.fillStyle = sgrad;
    sctx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.44;
    wheelGroup.add(shadowMesh);

    this.group.add(wheelGroup);
  }

  /**
   * Initializes the lathe geometry.
   * Total profile points = Outer Wall (64) + Lip (1) + Inner Wall (64) + Floor (2) = 131 points.
   */
  initGeometry() {
    this.profilePointsCount = this.sliceCount + 1 + this.sliceCount + 2;
    this.cachedPointsX = new Float32Array(this.profilePointsCount);
    this.cachedPointsY = new Float32Array(this.profilePointsCount);

    // Dummy points array to instantiate LatheGeometry
    const initialPoints = [];
    for (let i = 0; i < this.profilePointsCount; i++) {
      initialPoints.push(new THREE.Vector2(1.0, (i / this.profilePointsCount) * this.height));
    }

    this.geometry = new THREE.LatheGeometry(initialPoints, this.segments);

    // Customize UV coordinates:
    // Outer wall (slices 0..63) maps 0->1 vertically across the decorative canvas.
    // Rim and inner hollow cavity map to the bottom neutral baseline.
    const uvAttr = this.geometry.attributes.uv;
    const uvs = uvAttr.array;
    const M = this.profilePointsCount;

    for (let i = 0; i <= this.segments; i++) {
      const u = i / this.segments;
      for (let j = 0; j < M; j++) {
        const uvIdx = (i * M + j) * 2;
        uvs[uvIdx] = u;
        if (j < this.sliceCount) {
          // Outer pot wall
          uvs[uvIdx + 1] = j / (this.sliceCount - 1);
        } else {
          // Interior clay
          uvs[uvIdx + 1] = 0.01;
        }
      }
    }
    uvAttr.needsUpdate = true;

    // Material with bump map & high roughness for authentic clay feel
    this.material = new THREE.MeshStandardMaterial({
      map: this.texture,
      bumpMap: this.bumpTexture,
      bumpScale: 0.024,
      roughness: 0.8,
      metalness: 0.04
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.position.y = 0.22; // sits flush on top of the turntable disk
    this.group.add(this.mesh);
  }

  /**
   * Resets clay to a classic workable vase shape
   */
  resetToDefaultProfile() {
    for (let i = 0; i < this.sliceCount; i++) {
      const t = i / (this.sliceCount - 1);
      // Gentle vase profile
      if (t < 0.2) {
        this.radii[i] = 0.85 + t * 1.5;
      } else if (t < 0.6) {
        this.radii[i] = 1.15 + Math.sin((t - 0.2) * Math.PI * 1.25) * 0.4;
      } else if (t < 0.85) {
        this.radii[i] = 1.15 - ((t - 0.6) / 0.25) * 0.45;
      } else {
        this.radii[i] = 0.7 + ((t - 0.85) / 0.15) * 0.35;
      }
    }
    this.height = 3.2;
    this.patternCount = 0;
    this.paintCount = 0;

    this.renderBaseClayTexture();
    this.texture.needsUpdate = true;
    this.rebuildPositions();
  }

  /**
   * Rebuild ONLY the position attributes of LatheGeometry without recreating the mesh or geometry!
   */
  rebuildPositions() {
    const N = this.sliceCount;
    const M = this.profilePointsCount;
    const H = this.height;
    const wallThick = 0.22;

    // 1. Calculate profile curve (outer wall + lip + inner wall + base)
    for (let k = 0; k < N; k++) {
      this.cachedPointsX[k] = this.radii[k];
      this.cachedPointsY[k] = (k / (N - 1)) * H;
    }

    // Top lip
    const lipIdx = N;
    this.cachedPointsX[lipIdx] = Math.max(0.14, this.radii[N - 1] - wallThick * 0.5);
    this.cachedPointsY[lipIdx] = H + 0.04;

    // Inner cavity wall (curling down to the bottom)
    for (let k = 0; k < N; k++) {
      const innerIdx = lipIdx + 1 + k;
      const outerIdx = N - 1 - k;
      const outerR = this.radii[outerIdx];
      const outerY = (outerIdx / (N - 1)) * H;
      this.cachedPointsX[innerIdx] = Math.max(0.12, outerR - wallThick);
      this.cachedPointsY[innerIdx] = Math.max(0.18, outerY);
    }

    // Floor
    const floorInIdx = lipIdx + 1 + N;
    this.cachedPointsX[floorInIdx] = 0.001;
    this.cachedPointsY[floorInIdx] = 0.18;

    const floorOutIdx = floorInIdx + 1;
    this.cachedPointsX[floorOutIdx] = 0.001;
    this.cachedPointsY[floorOutIdx] = 0.0;

    // 2. Write vertices into position buffer
    const pos = this.geometry.attributes.position.array;
    for (let i = 0; i <= this.segments; i++) {
      const sin = this.sinTable[i];
      const cos = this.cosTable[i];
      const offset = i * M * 3;

      for (let j = 0; j < M; j++) {
        const vIdx = offset + j * 3;
        pos[vIdx] = this.cachedPointsX[j] * sin;
        pos[vIdx + 1] = this.cachedPointsY[j];
        pos[vIdx + 2] = this.cachedPointsX[j] * cos;
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.computeVertexNormals();
  }

  /**
   * Shape tool: adjusts slice radii with Gaussian falloff
   */
  shapeRadius(centerSlice, deltaRadius, brushSigma = 5.5) {
    const N = this.sliceCount;
    for (let i = 0; i < N; i++) {
      const dist = Math.abs(i - centerSlice);
      const falloff = Math.exp(-(dist * dist) / (2 * brushSigma * brushSigma));
      if (falloff > 0.005) {
        let newR = this.radii[i] + deltaRadius * falloff;
        // Clamp bounds: base must remain stable, walls must never invert or blow up
        const minR = (i === 0) ? 0.6 : MIN_RADIUS;
        newR = Math.max(minR, Math.min(MAX_RADIUS, newR));
        this.radii[i] = newR;
      }
    }
    this.rebuildPositions();
  }

  /**
   * Smooth tool: irons out ripples using local weighted neighborhood averaging
   */
  smoothSlices(centerSlice, strength = 0.45, brushSigma = 6.0) {
    const N = this.sliceCount;
    const tempRadii = new Float32Array(this.radii);

    for (let i = 1; i < N - 1; i++) {
      const dist = Math.abs(i - centerSlice);
      const falloff = Math.exp(-(dist * dist) / (2 * brushSigma * brushSigma));
      if (falloff > 0.01) {
        const avg = (this.radii[i - 1] + this.radii[i] * 2 + this.radii[i + 1]) / 4;
        tempRadii[i] += (avg - this.radii[i]) * strength * falloff;
      }
    }
    this.radii.set(tempRadii);
    this.rebuildPositions();
  }

  /**
   * Adjust overall pot height (when dragging near the top rim)
   */
  adjustHeight(deltaH) {
    this.height = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, this.height + deltaH));
    this.rebuildPositions();
  }

  /**
   * Apply a decorative pattern band at normalized height v [0, 1]
   */
  applyPatternBand(v, pattern, bandHeightRatio = 0.13) {
    const w = POT_CANVAS_WIDTH;
    const h = POT_CANVAS_HEIGHT;
    const bandH = Math.round(h * bandHeightRatio);
    // In canvas coordinates, 0 is top, h is bottom. Pot v=1 is top, v=0 is bottom.
    const centerY = Math.round((1 - v) * h);
    const startY = Math.max(0, centerY - Math.round(bandH / 2));

    // Render pattern to temporary strip
    const stripCanvas = document.createElement('canvas');
    stripCanvas.width = w;
    stripCanvas.height = bandH;
    const stripCtx = stripCanvas.getContext('2d');
    pattern.draw(stripCtx, w, bandH);

    // Feathered blending onto the main pot canvas
    this.ctx.drawImage(stripCanvas, 0, startY, w, bandH);

    this.texture.needsUpdate = true;
    this.patternCount++;
  }

  /**
   * Paint tool: glaze tint band at normalized height v
   */
  paintGlazeBand(v, colorHex, opacity = 0.35, brushRatio = 0.08) {
    const w = POT_CANVAS_WIDTH;
    const h = POT_CANVAS_HEIGHT;
    const bandH = Math.round(h * brushRatio);
    const centerY = Math.round((1 - v) * h);
    const startY = Math.max(0, centerY - Math.round(bandH / 2));

    const grad = this.ctx.createLinearGradient(0, startY, 0, startY + bandH);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.2, colorHex);
    grad.addColorStop(0.5, colorHex);
    grad.addColorStop(0.8, colorHex);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, startY, w, bandH);
    this.ctx.restore();

    this.texture.needsUpdate = true;
    this.paintCount++;
  }

  /**
   * Eraser tool: restore original stoneware clay at normalized height v
   */
  eraseBand(v, brushRatio = 0.1) {
    const w = POT_CANVAS_WIDTH;
    const h = POT_CANVAS_HEIGHT;
    const bandH = Math.round(h * brushRatio);
    const centerY = Math.round((1 - v) * h);
    const startY = Math.max(0, centerY - Math.round(bandH / 2));

    // Copy base canvas back over this strip
    this.ctx.drawImage(this.baseCanvas, 0, startY, w, bandH, 0, startY, w, bandH);
    this.texture.needsUpdate = true;
  }

  /**
   * Restore full pot state from a history snapshot
   */
  restoreState(snapshot) {
    if (!snapshot) return;
    this.radii.set(snapshot.radii);
    this.height = snapshot.height;
    if (snapshot.textureData) {
      this.ctx.putImageData(snapshot.textureData, 0, 0);
      this.texture.needsUpdate = true;
    }
    this.rebuildPositions();
  }
}
