import { useEffect, useRef } from 'react';
import * as THREE from 'three'; // төсөл three@0.128.0 ашигладаг, энэ код түүнд зориулагдсан
import { LOGO_SHAPES } from './logoShapes';

/** Градиент сонголтууд: [зүүн талын өнгө (M), баруун талын өнгө (од)] */
export const GRADIENTS = {
  aurora: ['#7df3c4', '#1f7bff'],
  ocean: ['#3ee9ff', '#3b4dff'],
  orchid: ['#ff9de2', '#6a5cff'],
  lime: ['#e6ff6a', '#12c98a'],
  sunset: ['#ffd36e', '#ff3d6e'],
  ember: ['#ffe36e', '#ff4a1c'],
};

/** Нэг өнгийн материалууд */
const SOLIDS = {
  chrome: { color: '#e9ecf2', metalness: 1, roughness: 0.1, clearcoat: 0, env: 1.25 },
  gold: { color: '#e0b049', metalness: 1, roughness: 0.18, clearcoat: 0, env: 1.2 },
  white: { color: '#f4f5f8', metalness: 0, roughness: 0.38, clearcoat: 0.8, env: 0.9 },
  onyx: { color: '#15171c', metalness: 0.85, roughness: 0.22, clearcoat: 1, env: 1.4 },
};

const GRADIENT_SURFACE = { metalness: 0.3, roughness: 0.2, clearcoat: 1, env: 1.15 };

/**
 * Хажуу ба налууг гөлгөр, хавтгай нүүрийг хавтгай, хурц ирмэгийг хурц хэвээр үлдээнэ.
 */
function smoothNormals(geo, creaseDeg) {
  const pos = geo.attributes.position;
  const count = pos.count;
  const faces = count / 3;
  const cosT = Math.cos((creaseDeg * Math.PI) / 180);
  const fn = new Float32Array(faces * 3);
  const isCap = new Uint8Array(faces);
  const buckets = new Map();
  const keyOf = (i) =>
    `${Math.round(pos.getX(i) * 1e4)}_${Math.round(pos.getY(i) * 1e4)}_${Math.round(pos.getZ(i) * 1e4)}`;

  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const n = new THREE.Vector3();
  const ab = new THREE.Vector3();
  for (let f = 0; f < faces; f++) {
    a.fromBufferAttribute(pos, f * 3);
    b.fromBufferAttribute(pos, f * 3 + 1);
    c.fromBufferAttribute(pos, f * 3 + 2);
    n.subVectors(c, b).cross(ab.subVectors(a, b));
    fn[f * 3] = n.x;
    fn[f * 3 + 1] = n.y;
    fn[f * 3 + 2] = n.z;
    const len = n.length();
    isCap[f] = len > 0 && Math.abs(n.z) / len > 0.9995 ? 1 : 0;
    for (let k = 0; k < 3; k++) {
      const key = keyOf(f * 3 + k);
      const list = buckets.get(key);
      if (list) list.push(f);
      else buckets.set(key, [f]);
    }
  }

  const out = new Float32Array(count * 3);
  const sum = new THREE.Vector3();
  const fa = new THREE.Vector3();
  const fb = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    const f0 = Math.floor(i / 3);
    fa.set(fn[f0 * 3], fn[f0 * 3 + 1], fn[f0 * 3 + 2]);
    const la = fa.length();
    sum.set(0, 0, 0);
    if (isCap[f0]) {
      sum.copy(fa);
    } else {
      for (const g of buckets.get(keyOf(i)) || []) {
        if (isCap[g]) continue;
        fb.set(fn[g * 3], fn[g * 3 + 1], fn[g * 3 + 2]);
        const lb = fb.length();
        if (la === 0 || lb === 0 || fa.dot(fb) / (la * lb) > cosT) sum.add(fb);
      }
    }
    if (sum.lengthSq() === 0) sum.copy(fa);
    sum.normalize();
    out[i * 3] = sum.x;
    out[i * 3 + 1] = sum.y;
    out[i * 3 + 2] = sum.z;
  }
  geo.setAttribute('normal', new THREE.BufferAttribute(out, 3));
}

/** Гэрэлтүүлгийн орчин: харанхуй өрөөнд цөөн тод гэрэл. Металл үүнийг тусгана. */
function buildEnvironment(renderer) {
  const env = new THREE.Scene();
  env.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(30, 30, 30),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(0.025, 0.027, 0.034), side: THREE.BackSide })
    )
  );
  const panel = (w, h, p, rgb) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(rgb[0], rgb[1], rgb[2]), side: THREE.DoubleSide })
    );
    m.position.set(p[0], p[1], p[2]);
    m.lookAt(0, 0, 0);
    env.add(m);
  };
  panel(14, 5, [0, 12, 4], [9, 9, 9.5]);
  panel(5, 12, [-12, 2, 5], [6, 6.4, 7.5]);
  panel(4, 10, [12, 0, 6], [7.5, 6.8, 6]);
  panel(12, 2.5, [0, -8, 8], [2.2, 2.2, 2.6]);
  panel(10, 4, [0, 3, -13], [4, 4, 4.5]);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.02).texture;
  pmrem.dispose();
  env.traverse((o) => {
    if (o.isMesh) {
      o.geometry.dispose();
      o.material.dispose();
    }
  });
  return tex;
}

/**
 * 3D MC лого.
 *
 * Props:
 *  - variant: 'aurora' | 'ocean' | 'orchid' | 'lime' | 'sunset' | 'ember' (градиент)
 *             эсвэл 'chrome' | 'gold' | 'white' | 'onyx' (материал)
 *  - depth: зузаан, 0.15 – 1.2
 *  - autoRotate: өөрөө эргэх эсэх
 *  - interactive: чирж эргүүлэх эсэх
 *  - zoom: камерын ойртуулалт, үндсэн утга 1 (>1 бол лого томорно)
 *  - minHeight: хамгийн бага өндөр (px), үндсэн утга 200
 *  - className: нэмэлт CSS класс
 *
 * Хэмжээг эцэг элемент тодорхойлно (width/height).
 */
export default function Logo3D({
  variant = 'aurora',
  depth = 0.5,
  autoRotate = true,
  interactive = true,
  minHeight = 200,
  zoom = 1,
  className,
}) {
  const hostRef = useRef(null);
  const apiRef = useRef(null);
  // Prop өөрчлөгдөхөд сцен дахин үүсгэхгүй, ref-ээр уншина.
  const live = useRef({ variant, depth, autoRotate, zoom });
  live.current = { variant, depth, autoRotate, zoom };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) {
      return undefined; // WebGL байхгүй төхөөрөмж
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    const canvas = renderer.domElement;
    canvas.style.cssText = `width:100%;height:100%;display:block;touch-action:pan-y;cursor:${interactive ? 'grab' : 'default'};`;
    host.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    const envTex = buildEnvironment(renderer);

    const body = new THREE.MeshPhysicalMaterial({ clearcoatRoughness: 0.08, envMap: envTex });
    const star = new THREE.MeshPhysicalMaterial({ clearcoatRoughness: 0.08, envMap: envTex });

    const logo = new THREE.Group();
    scene.add(logo);

    // Градиент x тэнхлэгээр бүх лого дундуур (M-ээс одны төгсгөл хүртэл) урсана.
    let gx0 = Infinity;
    let gx1 = -Infinity;
    for (const pts of LOGO_SHAPES) {
      for (const p of pts) {
        gx0 = Math.min(gx0, p[0]);
        gx1 = Math.max(gx1, p[0]);
      }
    }
    const c0 = new THREE.Color();
    const c1 = new THREE.Color();
    const tmp = new THREE.Color();
    const paintGradient = (geo) => {
      const pos = geo.attributes.position;
      const arr = new Float32Array(pos.count * 3);
      for (let i = 0; i < pos.count; i++) {
        const k = Math.max(0, Math.min(1, (pos.getX(i) - gx0) / (gx1 - gx0)));
        tmp.copy(c0).lerp(c1, k);
        arr[i * 3] = tmp.r;
        arr[i * 3 + 1] = tmp.g;
        arr[i * 3 + 2] = tmp.b;
      }
      geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    };

    const setVariant = (v) => {
      const grad = GRADIENTS[v];
      const solid = SOLIDS[v];
      for (const m of [body, star]) {
        if (grad) {
          m.color.set('#ffffff');
          m.metalness = GRADIENT_SURFACE.metalness;
          m.roughness = GRADIENT_SURFACE.roughness;
          m.clearcoat = GRADIENT_SURFACE.clearcoat;
          m.envMapIntensity = GRADIENT_SURFACE.env;
        } else if (solid) {
          m.color.set(solid.color);
          m.metalness = solid.metalness;
          m.roughness = solid.roughness;
          m.clearcoat = solid.clearcoat;
          m.envMapIntensity = solid.env;
        }
        m.vertexColors = !!grad;
        m.needsUpdate = true;
      }
      if (grad) {
        // three r128 өнгийг автоматаар шугаман болгодоггүй тул vertex өнгийг гараар хөрвүүлнэ.
        c0.set(grad[0]).convertSRGBToLinear();
        c1.set(grad[1]).convertSRGBToLinear();
        for (const child of logo.children) paintGradient(child.geometry);
      }
    };

    const build = (d) => {
      for (const child of [...logo.children]) {
        child.geometry.dispose();
        logo.remove(child);
      }
      LOGO_SHAPES.forEach((pts, idx) => {
        const shape = new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], p[1])));
        const geo = new THREE.ExtrudeGeometry(shape, {
          depth: d,
          bevelEnabled: true,
          bevelThickness: 0.05,
          bevelSize: 0.03,
          bevelOffset: 0,
          bevelSegments: 8,
          curveSegments: 1,
          steps: 1,
        });
        geo.translate(0, 0, -d / 2);
        smoothNormals(geo, 38);
        logo.add(new THREE.Mesh(geo, idx === 2 ? star : body));
      });
      setVariant(live.current.variant);
    };

    build(live.current.depth);
    apiRef.current = { setVariant, setDepth: build };

    // Чирж эргүүлэх, чөлөөлөхөд инерцээр удааширна.
    const reduce = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
    const st = { yaw: -0.5, pitch: 0.12, vyaw: 0, vpitch: 0, dragging: false, lx: 0, ly: 0 };
    const onDown = (e) => {
      if (!interactive) return;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
      st.dragging = true;
      st.lx = e.clientX;
      st.ly = e.clientY;
      st.vyaw = st.vpitch = 0;
    };
    const onMove = (e) => {
      if (!st.dragging) return;
      st.vyaw = (e.clientX - st.lx) * 0.006;
      st.vpitch = (e.clientY - st.ly) * 0.004;
      st.lx = e.clientX;
      st.ly = e.clientY;
      st.yaw += st.vyaw;
      st.pitch = Math.max(-1.2, Math.min(1.2, st.pitch + st.vpitch));
    };
    const onUp = () => {
      st.dragging = false;
      canvas.style.cursor = interactive ? 'grab' : 'default';
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    // Дэлгэцээс гарсан үед зурахаа зогсооно (батарей, гүйцэтгэл).
    let visible = true;
    const io = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
    });
    io.observe(host);

    let raf = 0;
    let t0 = performance.now();
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - t0) / 1000);
      t0 = now;
      if (!visible) return;
      if (!st.dragging) {
        st.yaw += st.vyaw;
        st.pitch = Math.max(-1.2, Math.min(1.2, st.pitch + st.vpitch));
        st.vyaw *= 0.93;
        st.vpitch *= 0.93;
        if (live.current.autoRotate && !reduce) st.yaw += dt * 0.45;
      }
      logo.rotation.set(st.pitch, st.yaw, 0);
      camera.position.set(0, 0, Math.max(8, 9.6 / camera.aspect) / live.current.zoom);
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      for (const child of logo.children) child.geometry.dispose();
      body.dispose();
      star.dispose();
      envTex.dispose();
      renderer.dispose();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      apiRef.current = null;
    };
  }, [interactive]);

  useEffect(() => {
    if (apiRef.current) apiRef.current.setVariant(variant);
  }, [variant]);
  useEffect(() => {
    if (apiRef.current) apiRef.current.setDepth(depth);
  }, [depth]);

  return <div ref={hostRef} className={className} style={{ width: '100%', height: '100%', minHeight }} />;
}
