import { useEffect, useRef } from 'react';
import reducedMotion from '../../hooks/reducedMotion';

// WebGL ажиллахгүй үед ашиглагдах 2D particle fallback (#universe). WebGL ажиллаж байвал CSS-ээр нуугдах тул зурахгүй.
export default function Universe2D({ active }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const root = document.documentElement;
    const rm = reducedMotion();
    let w = window.innerWidth;
    let h = window.innerHeight;
    let time = 0;
    let mx = 0.5;
    let my = 0.5;
    let morph = 0;
    let last = 0;
    let raf = 0;
    const count = window.innerWidth < 760 ? 650 : 1600;
    const pts = Array.from({ length: count }, (_, i) => ({
      i, x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, z: Math.random(), a: i * 2.39996,
    }));
    let colors = {};
    const readColors = () => {
      const style = getComputedStyle(document.getElementById('home'));
      colors = { glow: style.getPropertyValue('--glow').trim(), acc: style.getPropertyValue('--blue').trim() };
    };
    readColors();
    const themeObserver = new MutationObserver(readColors);
    themeObserver.observe(root, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    let sectionBottoms = [];
    const measureSections = () => {
      sectionBottoms = [...document.querySelectorAll('main section')].map((section) => section.getBoundingClientRect().bottom + window.scrollY);
      onScroll();
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      const d = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * d);
      canvas.height = Math.round(h * d);
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    const onPointer = (e) => {
      mx = e.clientX / w;
      my = e.clientY / h;
    };
    const onScroll = () => {
      const sec = sectionBottoms.findIndex((bottom) => bottom - window.scrollY > h * 0.5);
      morph = Math.max(0, sec) % 6;
    };
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointer);
    window.addEventListener('scroll', onScroll, { passive: true });
    resize();
    const layoutObserver = new ResizeObserver(measureSections);
    layoutObserver.observe(document.querySelector('main'));

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden || now - last < (rm ? 160 : 30)) return;
      last = now;
      if (!rm) time += 0.009;
      ctx.clearRect(0, 0, w, h);
      const { glow, acc } = colors;
      const centerX = w < 760 ? w * 0.5 : w * 0.72;
      const centerY = h * 0.45;
      const scale = Math.min(w, h) * 0.26;
      const c = Math.cos(time * 0.2);
      const s = Math.sin(time * 0.2);
      pts.forEach((p) => {
        const f = p.i / count;
        let x;
        let y;
        let z;
        switch (morph) {
          case 1: {
            const r = 2 + Math.cos(f * Math.PI * 6);
            x = r * Math.cos(f * Math.PI * 4);
            y = r * Math.sin(f * Math.PI * 4);
            z = Math.sin(f * Math.PI * 6);
            break;
          }
          case 2:
            x = ((p.i % 40) / 40 - 0.5) * 8;
            z = (Math.floor(p.i / 40) / Math.ceil(count / 40) - 0.5) * 8;
            y = Math.sin(x * 2 + time) * Math.cos(z * 2) * 0.6;
            break;
          case 3:
            x = Math.cos(f * 38 + (p.i % 2) * Math.PI) * 1.6;
            y = (f - 0.5) * 7;
            z = Math.sin(f * 38 + (p.i % 2) * Math.PI) * 1.6;
            break;
          case 4: {
            const r = Math.sqrt(f) * 4;
            const a = r * 1.7 + (p.i % 3) * 2.094;
            x = Math.cos(a) * r;
            y = (p.z - 0.5) * 0.5;
            z = Math.sin(a) * r;
            break;
          }
          case 5:
            x = ((p.i % 12) / 12 - 0.5) * 5;
            y = ((Math.floor(p.i / 12) % 12) / 12 - 0.5) * 5;
            z = (Math.floor(p.i / 144) / Math.ceil(count / 144) - 0.5) * 5;
            break;
          default: {
            const a = f * Math.PI * 2;
            const b = (p.z - 0.5) * 0.8;
            x = Math.sin(a) * 3.4 + b * Math.cos(a / 2);
            y = Math.sin(a * 2) * 1.1 + b;
            z = Math.cos(a) * 1.8;
          }
        }
        const rx = x * c - z * s;
        const rz = x * s + z * c;
        const ry = y * Math.cos(0.3 + my * 0.3) - rz * Math.sin(0.3 + my * 0.3);
        const perspective = 8 / (8 + rz);
        const targetX = centerX + (rx + (mx - 0.5) * 0.3) * scale * 0.72 * perspective;
        const targetY = centerY + ry * scale * 0.72 * perspective;
        p.x += (targetX - p.x) * 0.055;
        p.y += (targetY - p.y) * 0.055;
        ctx.globalAlpha = (root.dataset.theme === 'dark' ? 0.52 : 0.36) * (w < 760 ? 0.6 : 1);
        ctx.fillStyle = p.i % 5 === 0 ? acc : glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, ((p.i % 3) * 0.22 + 0.65) * perspective, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      themeObserver.disconnect();
      layoutObserver.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [active]);

  return <canvas id="universe" ref={canvasRef} aria-hidden="true" />;
}
