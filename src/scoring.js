/**
 * Target Reference Pots and Scoring Engine
 * Compares the player's 3D pot profile with target silhouettes,
 * awards star ratings (1-5 stars), and calculates selling price.
 */

export const SLICE_COUNT = 64;

/**
 * Generate a smooth profile array from anchor points using Catmull-Rom or cubic interpolation.
 */
function interpolateProfile(controlPoints, count = SLICE_COUNT) {
  const radii = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    // Find segment
    let segment = 0;
    for (let s = 0; s < controlPoints.length - 1; s++) {
      if (t >= controlPoints[s].t && t <= controlPoints[s + 1].t) {
        segment = s;
        break;
      }
    }
    const p0 = controlPoints[Math.max(0, segment - 1)];
    const p1 = controlPoints[segment];
    const p2 = controlPoints[Math.min(controlPoints.length - 1, segment + 1)];
    const p3 = controlPoints[Math.min(controlPoints.length - 1, segment + 2)];

    const segLength = p2.t - p1.t || 1e-4;
    const localT = (t - p1.t) / segLength;

    // Catmull-Rom spline
    const t2 = localT * localT;
    const t3 = t2 * localT;
    const r = 0.5 * (
      (2 * p1.r) +
      (-p0.r + p2.r) * localT +
      (2 * p0.r - 5 * p1.r + 4 * p2.r - p3.r) * t2 +
      (-p0.r + 3 * p1.r - 3 * p2.r + p3.r) * t3
    );
    radii[i] = Math.max(0.25, r);
  }
  return radii;
}

export const TARGET_POTS = [
  {
    id: 'amphora',
    name: 'Grecian Amphora',
    description: 'Narrow base, voluptuous belly, slender neck, flaring rim.',
    height: 3.3,
    basePrice: 280,
    radii: interpolateProfile([
      { t: 0.0, r: 0.7 },
      { t: 0.25, r: 1.6 },
      { t: 0.55, r: 1.35 },
      { t: 0.78, r: 0.65 },
      { t: 0.92, r: 0.75 },
      { t: 1.0, r: 1.05 }
    ])
  },
  {
    id: 'dynasty_vase',
    name: 'Ming Dynastic Vase',
    description: 'Stately flared base, high round shoulder, tapered lip.',
    height: 3.5,
    basePrice: 350,
    radii: interpolateProfile([
      { t: 0.0, r: 0.85 },
      { t: 0.15, r: 0.8 },
      { t: 0.6, r: 1.7 },
      { t: 0.85, r: 0.65 },
      { t: 1.0, r: 0.95 }
    ])
  },
  {
    id: 'round_urn',
    name: 'Terracotta Seed Urn',
    description: 'Squat globular body with a tight rolled rim.',
    height: 2.5,
    basePrice: 220,
    radii: interpolateProfile([
      { t: 0.0, r: 0.8 },
      { t: 0.45, r: 1.9 },
      { t: 0.8, r: 1.2 },
      { t: 0.95, r: 0.6 },
      { t: 1.0, r: 0.7 }
    ])
  },
  {
    id: 'fluted_chalice',
    name: 'Fluted Ceramic Chalice',
    description: 'Slender stem rising into an expansive fluted bowl.',
    height: 3.1,
    basePrice: 310,
    radii: interpolateProfile([
      { t: 0.0, r: 1.1 },
      { t: 0.15, r: 0.5 },
      { t: 0.4, r: 0.45 },
      { t: 0.75, r: 1.4 },
      { t: 1.0, r: 1.85 }
    ])
  },
  {
    id: 'desert_bottle',
    name: 'Caravan Oil Bottle',
    description: 'Solid cylindrical base, tapered cone, and tall neck.',
    height: 3.4,
    basePrice: 260,
    radii: interpolateProfile([
      { t: 0.0, r: 1.05 },
      { t: 0.45, r: 1.1 },
      { t: 0.7, r: 0.9 },
      { t: 0.85, r: 0.45 },
      { t: 1.0, r: 0.55 }
    ])
  }
];

/**
 * Draw a mini silhouette / shaded preview of a pot profile on a canvas.
 */
export function drawPotSilhouette(canvas, radii, height, color = '#2c3e50') {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Soft gradient backdrop for the Polaroid frame
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#f1f5f9');
  bg.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Centering & scale
  const maxRadius = Math.max(...radii, 1.8);
  const scaleX = (w * 0.38) / maxRadius;
  const scaleY = (h * 0.78) / 3.8;
  const centerX = w * 0.5;
  const baseY = h * 0.88;

  // Draw shadow on wheel pedestal
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.beginPath();
  ctx.ellipse(centerX, baseY + 6, radii[0] * scaleX + 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw pot silhouette path
  ctx.beginPath();
  // Right side from bottom to top
  for (let i = 0; i < radii.length; i++) {
    const t = i / (radii.length - 1);
    const y = baseY - t * height * scaleY;
    const x = centerX + radii[i] * scaleX;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  // Left side from top to bottom
  for (let i = radii.length - 1; i >= 0; i--) {
    const t = i / (radii.length - 1);
    const y = baseY - t * height * scaleY;
    const x = centerX - radii[i] * scaleX;
    ctx.lineTo(x, y);
  }
  ctx.closePath();

  // Subtle shaded gradient (ceramic 3D look)
  const potGrad = ctx.createLinearGradient(centerX - maxRadius * scaleX, 0, centerX + maxRadius * scaleX, 0);
  potGrad.addColorStop(0, '#334155');
  potGrad.addColorStop(0.35, '#64748b');
  potGrad.addColorStop(0.65, '#94a3b8');
  potGrad.addColorStop(1, '#1e293b');
  ctx.fillStyle = potGrad;
  ctx.fill();

  // Highlight stroke
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#0f172a';
  ctx.stroke();
}

/**
 * Score the player's pot against the target pot.
 */
export function scorePot(playerRadii, playerHeight, targetPot, patternCount = 0, paintCount = 0) {
  const targetRadii = targetPot.radii;
  const count = Math.min(playerRadii.length, targetRadii.length);

  // 1. Mean absolute difference in radii
  let totalDiff = 0;
  let targetSum = 0;
  for (let i = 0; i < count; i++) {
    totalDiff += Math.abs(playerRadii[i] - targetRadii[i]);
    targetSum += targetRadii[i];
  }
  const meanDiff = totalDiff / count;
  const avgTargetRadius = targetSum / count;

  // Normalized shape accuracy [0, 1]
  const shapeAccuracy = Math.max(0, 1 - (meanDiff / (avgTargetRadius * 0.75)));

  // 2. Height accuracy [0, 1]
  const heightRatio = Math.abs(playerHeight - targetPot.height) / targetPot.height;
  const heightAccuracy = Math.max(0, 1 - heightRatio * 1.5);

  // Overall shape match percentage
  const combinedShapeScore = Math.min(1, shapeAccuracy * 0.75 + heightAccuracy * 0.25);
  const shapePercent = Math.round(combinedShapeScore * 100);

  // 3. Decoration bonuses
  const patternBonus = Math.min(patternCount * 45, 180);
  const paintBonus = Math.min(paintCount * 35, 140);
  const totalBonus = patternBonus + paintBonus;

  // 4. Star Rating Calculation (1 to 5)
  let stars = 1;
  if (shapePercent >= 86) stars = 5;
  else if (shapePercent >= 74) stars = 4;
  else if (shapePercent >= 60) stars = 3;
  else if (shapePercent >= 44) stars = 2;
  else stars = 1;

  // Star bonus for great decoration
  if (patternCount >= 2 && paintCount >= 1 && stars < 5 && shapePercent >= 70) {
    stars += 1;
  }

  // 5. Final Selling Price ($)
  const price = Math.round(
    targetPot.basePrice * (0.4 + combinedShapeScore * 0.9) + totalBonus
  );

  return {
    stars,
    shapePercent,
    heightPercent: Math.round(heightAccuracy * 100),
    patternCount,
    paintCount,
    totalBonus,
    price,
    targetName: targetPot.name
  };
}
