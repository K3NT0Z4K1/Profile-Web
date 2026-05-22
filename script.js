// ─── THEME TOGGLE ────────────────────────────────────────
const html = document.documentElement;
const toggleBtn = document.getElementById('themeToggle');

const saved = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', saved);

if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
}

// ─── GLOBE ANIMATION ─────────────────────────────────────
const canvas = document.getElementById('globeCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const DPR = window.devicePixelRatio || 1;
  const SIZE = 220;
  canvas.width  = SIZE * DPR;
  canvas.height = SIZE * DPR;
  canvas.style.width  = SIZE + 'px';
  canvas.style.height = SIZE + 'px';
  ctx.scale(DPR, DPR);

  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R  = SIZE * 0.42;

  // Generate dots on a sphere surface
  const DOTS = [];
  const DOT_COUNT = 320;
  for (let i = 0; i < DOT_COUNT; i++) {
    const phi   = Math.acos(-1 + (2 * i) / DOT_COUNT);
    const theta = Math.sqrt(DOT_COUNT * Math.PI) * phi;
    DOTS.push({ phi, theta });
  }

  // Philippines location (approx lat 12°N, lon 122°E)
  const PH_LAT = 12 * Math.PI / 180;
  const PH_LON = 122 * Math.PI / 180;

  let rot = 0;

  function project(phi, theta, rotation) {
    const x = Math.sin(phi) * Math.cos(theta + rotation);
    const y = Math.cos(phi);
    const z = Math.sin(phi) * Math.sin(theta + rotation);
    return { x, y, z };
  }

  function getThemeColors() {
    const isDark = html.getAttribute('data-theme') !== 'light';
    return {
      dot:       isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)',
      dotFade:   isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
      glow:      isDark ? 'rgba(74,222,128,0.9)'   : 'rgba(22,163,74,0.9)',
      glowHalo:  isDark ? 'rgba(74,222,128,0.25)'  : 'rgba(22,163,74,0.2)',
      rim:       isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    };
  }

  function draw() {
    ctx.clearRect(0, 0, SIZE, SIZE);
    const c = getThemeColors();

    // Subtle sphere rim
    const grad = ctx.createRadialGradient(CX - R*0.2, CY - R*0.2, R*0.1, CX, CY, R);
    grad.addColorStop(0, c.rim);
    grad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw dots
    for (const d of DOTS) {
      const { x, y, z } = project(d.phi, d.theta, rot);
      const sx = CX + x * R;
      const sy = CY - y * R;
      const visible = z > 0;
      const brightness = visible ? 0.3 + 0.7 * z : 0;
      if (brightness < 0.04) continue;

      const alpha = visible ? brightness : 0;
      const r = visible ? 1.1 + z * 0.6 : 0.5;

      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fillStyle = visible
        ? c.dot.replace('0.55', (0.15 + 0.4 * z).toFixed(2))
                .replace('0.45', (0.12 + 0.33 * z).toFixed(2))
        : c.dotFade;
      ctx.fill();
    }

    // Philippines marker
    const phVec = project(Math.PI/2 - PH_LAT, PH_LON, rot);
    if (phVec.z > 0) {
      const px = CX + phVec.x * R;
      const py = CY - phVec.y * R;

      // Halo
      const halo = ctx.createRadialGradient(px, py, 0, px, py, 10);
      halo.addColorStop(0, c.glowHalo);
      halo.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(px, py, 10, 0, Math.PI * 2);
      ctx.fillStyle = halo;
      ctx.fill();

      // Dot
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = c.glow;
      ctx.shadowColor = c.glow;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    rot += 0.003;
    requestAnimationFrame(draw);
  }

  draw();
}
