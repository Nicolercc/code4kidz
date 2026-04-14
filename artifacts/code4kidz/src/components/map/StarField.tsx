import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/** Static star backdrop — no WebGL, no network (CSS only). */
function StarFieldStatic() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden
      style={{
        background: [
          'radial-gradient(ellipse 100% 60% at 50% 20%, rgba(155,114,240,0.12) 0%, transparent 55%)',
          'radial-gradient(1px 1px at 8% 12%, rgba(255,255,255,0.45), transparent)',
          'radial-gradient(1px 1px at 22% 35%, rgba(255,255,255,0.35), transparent)',
          'radial-gradient(1px 1px at 38% 8%, rgba(255,255,255,0.3), transparent)',
          'radial-gradient(1px 1px at 55% 42%, rgba(200,180,255,0.45), transparent)',
          'radial-gradient(1px 1px at 72% 18%, rgba(255,255,255,0.35), transparent)',
          'radial-gradient(1px 1px at 88% 55%, rgba(255,255,255,0.28), transparent)',
          'radial-gradient(1px 1px at 15% 78%, rgba(255,255,255,0.32), transparent)',
          'radial-gradient(1px 1px at 48% 88%, rgba(200,180,255,0.35), transparent)',
          'radial-gradient(1px 1px at 91% 82%, rgba(255,255,255,0.25), transparent)',
          'radial-gradient(1px 1px at 33% 62%, rgba(255,255,255,0.3), transparent)',
          'radial-gradient(1px 1px at 66% 68%, rgba(255,255,255,0.28), transparent)',
        ].join(', '),
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        opacity: 0.95,
      }}
    />
  );
}

const TARGET_FPS = 30;
const FRAME_MS = 1000 / TARGET_FPS;

function makeDotTexture(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = 32;
  c.height = 32;
  const ctx = c.getContext('2d');
  if (!ctx) {
    const fallback = new THREE.Texture();
    fallback.needsUpdate = true;
    return fallback;
  }

  const r = 16;
  const g = ctx.createRadialGradient(r, r, 0, r, r, r);
  // soft circular dot
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.75, 'rgba(255,255,255,0.15)');
  g.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

function createLayer(
  count: number,
  sizePx: number,
  color: THREE.ColorRepresentation,
  opacity: number,
  zMin: number,
  zMax: number,
  spread: number,
  map: THREE.Texture
): THREE.Points {
  const geom = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 2 * spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2 * spread;
    positions[i * 3 + 2] = zMin + Math.random() * (zMax - zMin);
  }
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color,
    size: sizePx,
    transparent: true,
    opacity,
    map,
    alphaTest: 0.2,
    depthTest: false,
    depthWrite: false,
    sizeAttenuation: true,
  });
  return new THREE.Points(geom, mat);
}

function StarFieldWebGL() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let rafId = 0;
    let lastFrameTime = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'low-power',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const spread = 55;
    // IMPORTANT: keep dots subtle. Never compete with foreground content.
    const dotMap = makeDotTexture();
    // Opacity targets (visibility test @ ~2ft): far 0.1–0.15, mid 0.2–0.3, near 0.35–0.45.
    const g1 = createLayer(400, 0.8, 0xffffff, 0.13, -30, -10, spread, dotMap);
    const g2 = createLayer(200, 1.2, new THREE.Color(0xc8b4ff), 0.25, -15, -5, spread, dotMap); // ~rgb(200,180,255)
    const g3 = createLayer(80, 2, 0xffffff, 0.4, -8, -1, spread, dotMap);

    const layer1 = new THREE.Group();
    const layer2 = new THREE.Group();
    const layer3 = new THREE.Group();
    layer1.add(g1);
    layer2.add(g2);
    layer3.add(g3);
    scene.add(layer1, layer2, layer3);

    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    for (const g of [g1, g2, g3]) {
      geometries.push(g.geometry as THREE.BufferGeometry);
      materials.push(g.material as THREE.Material);
    }

    const onMove = (event: MouseEvent) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * 2;
      targetY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const resize = () => {
      const w = wrap.clientWidth || window.innerWidth;
      const h = wrap.clientHeight || window.innerHeight;
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const onWinResize = () => resize();

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('resize', onWinResize);
    resize();

    const animate = (time: number) => {
      rafId = window.requestAnimationFrame(animate);
      if (lastFrameTime > 0 && time - lastFrameTime < FRAME_MS) return;
      lastFrameTime = time;

      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      layer1.position.x = currentX * 0.005;
      layer1.position.y = -currentY * 0.005;
      layer2.position.x = currentX * 0.012;
      layer2.position.y = -currentY * 0.012;
      layer3.position.x = currentX * 0.025;
      layer3.position.y = -currentY * 0.025;

      scene.rotation.y += 0.0001;
      scene.rotation.x += 0.00005;

      renderer.render(scene, camera);
    };

    rafId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onWinResize);
      renderer.dispose();
      dotMap.dispose();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    };
  }, []);

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0 z-0">
      <canvas ref={canvasRef} className="block h-full w-full" aria-hidden />
    </div>
  );
}

/**
 * Parallax star field (vanilla Three.js). When `prefers-reduced-motion: reduce`,
 * WebGL is not used — static CSS stars only (no extra network).
 */
export default function StarField() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  if (reduced) return <StarFieldStatic />;
  return <StarFieldWebGL />;
}
