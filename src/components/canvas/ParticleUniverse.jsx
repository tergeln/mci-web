import { useEffect } from 'react';
import * as THREE from 'three';
import reducedMotion from '../../hooks/reducedMotion';
import { LOGO_SHAPES } from '../BrandLogo/logoShapes';
import { particleLayout } from './particleLayout';

// section id -> particle хэлбэрийн индекс
const SHAPE_BY_SECTION = { home: 0, courses: 0, about: 1, activities: 5, method: 3, journey: 2, merch: 4, contact: 5 };
const OPACITY = [0.95, 0.6, 0.55, 0.5, 0.7, 0.6];

const polyArea = (pts) => {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % pts.length];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return Math.abs(a) / 2;
};

const inPoly = (x, y, pts) => {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i];
    const b = pts[j];
    if (a[1] > y !== b[1] > y && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
};

// MC логоны контур доторх цэгүүдийг талбайн харьцаагаар тарааж, [x,y,z]-ийн Float32Array буцаана.
function sampleLogoPoints(n, scale, thickness) {
  const areas = LOGO_SHAPES.map(polyArea);
  const total = areas.reduce((s, a) => s + a, 0);
  const out = new Float32Array(n * 3);
  let k = 0;
  LOGO_SHAPES.forEach((pts, si) => {
    const count = si === LOGO_SHAPES.length - 1 ? n - k : Math.round((areas[si] / total) * n);
    let x0 = Infinity;
    let x1 = -Infinity;
    let y0 = Infinity;
    let y1 = -Infinity;
    pts.forEach(([x, y]) => {
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    });
    for (let c = 0; c < count && k < n; ) {
      const x = x0 + Math.random() * (x1 - x0);
      const y = y0 + Math.random() * (y1 - y0);
      if (!inPoly(x, y, pts)) continue;
      out[k * 3] = x * scale;
      out[k * 3 + 1] = y * scale;
      out[k * 3 + 2] = (Math.random() - 0.5) * thickness;
      k++;
      c++;
    }
  });
  return out;
}

// Нэг <canvas id="pg"> үүсгэж, 7000 цэгтэй Three.js particle universe-ийг зурна.
// Unmount үед animation, listener, observer, geometry, material, renderer болон canvas-ыг бүгдийг цэвэрлэнэ.
export default function ParticleUniverse({ onResult }) {
  useEffect(() => {
    const RM = reducedMotion();
    let compact = window.innerWidth <= 900;
    const N = 7000;

    const canvas = document.createElement('canvas');
    canvas.id = 'pg';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    } catch (e) {
      canvas.remove();
      onResult(false);
      return undefined;
    }
    document.documentElement.classList.add('original-universe-ready');
    onResult(true);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 9;

    const P = new Float32Array(N * 3);
    const C = new Float32Array(N * 3);
    const T = [0, 1, 2, 3, 4, 5].map(() => new Float32Array(N * 3));
    const ca = new THREE.Color(0x3a5bff);
    const cb = new THREE.Color(0xe8d5a3);
    const cc = new THREE.Color();
    const g0 = Math.ceil(Math.sqrt(N));
    const n3 = Math.round(Math.cbrt(N));

    const logoPts = sampleLogoPoints(N, 1.85, 0.3);

    for (let i = 0; i < N; i++) {
      const j = i * 3;
      const f = i / N;
      T[0].set(logoPts.subarray(j, j + 3), j);
      const u = f * 6.2832;
      const v = i * 2.4;
      const q = 2 + Math.cos(3 * u);
      T[1].set([q * Math.cos(2 * u) * 1.1 + Math.cos(v) * 0.35, q * Math.sin(2 * u) * 1.1 + Math.sin(v) * 0.35, Math.sin(3 * u) * 1.4], j);
      const gx = (i % g0) / g0 - 0.5;
      const gz = Math.floor(i / g0) / g0 - 0.5;
      T[2].set([gx * 13, Math.sin(gx * 14) * Math.cos(gz * 14) * 0.9 - 1, gz * 13], j);
      const t = f * 38 + (i % 2) * Math.PI;
      T[3].set([Math.cos(t) * 1.8, (f - 0.5) * 9, Math.sin(t) * 1.8], j);
      const gr = Math.sqrt(f) * 5.6;
      const ga = gr * 1.7 + (i % 3) * 2.094 + (Math.random() - 0.5) * 0.4;
      T[4].set([Math.cos(ga) * gr, (Math.random() - 0.5) * 0.4 * (1.3 - gr / 6), Math.sin(ga) * gr], j);
      const lx = (i % n3) / n3 - 0.5;
      const ly2 = (Math.floor(i / n3) % n3) / n3 - 0.5;
      const lz = (Math.floor(i / (n3 * n3)) % n3) / n3 - 0.5;
      const tw = ly2 * 2.2;
      T[5].set([(lx * Math.cos(tw) - lz * Math.sin(tw)) * 5.5, ly2 * 5.5, (lx * Math.sin(tw) + lz * Math.cos(tw)) * 5.5], j);
      P.set([(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30], j);
      cc.copy(ca).lerp(cb, ((Math.sin(i * 0.37) + 1) / 2) * (0.4 + f * 0.6));
      C.set([cc.r, cc.g, cc.b], j);
    }

    const shapeBounds = T.map((target) => {
      let x = 0;
      let y = 0;
      let radiusSquared = 0;
      for (let i = 0; i < target.length; i += 3) {
        x = Math.max(x, Math.abs(target[i]));
        y = Math.max(y, Math.abs(target[i + 1]));
        radiusSquared = Math.max(radiusSquared, target[i] ** 2 + target[i + 1] ** 2 + target[i + 2] ** 2);
      }
      return { width: x * 2, height: y * 2, diameter: Math.sqrt(radiusSquared) * 2 };
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(P, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(C, 3));
    const material = new THREE.PointsMaterial({ size: compact ? 0.032 : 0.05, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const size = () => {
      compact = window.innerWidth <= 900;
      material.size = compact ? 0.032 : 0.05;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.5 : 2));
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', size);
    size();

    let ti = 0;
    let go = false;
    let mx = 0;
    let my = 0;
    let ly = window.scrollY;
    let vel = 0;
    let k = 0;
    const startTimer = setTimeout(() => {
      go = true;
    }, 1100);
    const onPointer = (e) => {
      if (e.pointerType === 'touch') return;
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener('pointermove', onPointer);

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) ti = SHAPE_BY_SECTION[e.target.id];
      }),
      { rootMargin: '-45% 0px -45% 0px' },
    );
    Object.keys(SHAPE_BY_SECTION).forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    let raf = 0;
    let lastFrame = 0;
    const loop = (now = 0) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden || (compact && now - lastFrame < 1000 / 30)) return;
      lastFrame = now;
      const L = go ? (compact ? 0.088 : 0.045) : 0;
      const target = T[ti];
      for (let i = 0; i < N * 3; i++) P[i] += (target[i] - P[i]) * L;
      geometry.attributes.position.needsUpdate = true;
      vel += ((window.scrollY - ly) - vel) * 0.1;
      ly = window.scrollY;
      if (!RM) k += compact ? 0.006 : 0.003;
      // Лого (хэлбэр 0) урдаасаа харагдаж, зөвхөн бага зэрэг найгана. Бусад хэлбэр бүтэн эргэнэ.
      const targetRotY = ti === 0 ? Math.sin(k * 4) * 0.28 + mx * 0.35 : k + mx * 1.2 + vel * 0.02;
      const targetRotX = ti === 0 ? my * 0.25 : (ti === 2 || ti === 4) ? 0.9 : my * 0.6;
      points.rotation.y += (targetRotY - points.rotation.y) * 0.05;
      points.rotation.x += (targetRotX - points.rotation.x) * 0.04;
      camera.position.z = compact ? 9 : 9 - Math.min(Math.abs(vel) * 0.05, 2);
      const layout = particleLayout({ width: window.innerWidth, height: window.innerHeight,
        fov: camera.fov, distance: compact ? camera.position.z : 9, shape: ti, bounds: shapeBounds[ti] });
      points.scale.setScalar(layout.scale);
      // Resize immediately into the compact viewport; desktop movement remains eased.
      if (compact) points.position.set(layout.x, layout.y, 0);
      else {
        points.position.x += (layout.x - points.position.x) * 0.04;
        points.position.y += (layout.y - points.position.y) * 0.04;
      }
      material.opacity += ((compact ? OPACITY[ti] * 0.72 : OPACITY[ti]) - material.opacity) * 0.05;
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(startTimer);
      observer.disconnect();
      window.removeEventListener('resize', size);
      window.removeEventListener('pointermove', onPointer);
      scene.remove(points);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      document.documentElement.classList.remove('original-universe-ready');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
