import { useEffect, useRef } from 'react';
import { useLang } from '../../context/LanguageContext';
import reducedMotion from '../../hooks/reducedMotion';
import { skills } from '../../data/skills';

// Ур чадварын оддын зураглал (2D canvas). Оддыг дарж сонгоно.
export default function Constellation({ selected, onSelect }) {
  const { lang, t } = useLang();
  const canvasRef = useRef(null);
  const positions = useRef([]);
  const live = useRef({ selected, lang });
  live.current = { selected, lang };

  useEffect(() => {
    const cv = canvasRef.current;
    const cx = cv.getContext('2d');
    const rm = reducedMotion();
    let w = window.innerWidth;
    let d = 1;
    let time = 0;
    let last = 0;
    let raf = 0;
    let cw = 0;
    let ch = 0;
    let visible = false;
    let colors = {};
    const readColors = () => {
      const style = getComputedStyle(document.getElementById('home'));
      colors = Object.fromEntries(['--glow', '--blue', '--ink'].map((name) => [name, style.getPropertyValue(name).trim()]));
    };
    readColors();
    const themeObserver = new MutationObserver(readColors);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });

    const resize = ([entry]) => {
      w = window.innerWidth;
      d = Math.min(window.devicePixelRatio || 1, 2);
      cw = entry.contentRect.width;
      ch = entry.contentRect.height;
      cv.width = Math.round(cw * d);
      cv.height = Math.round(ch * d);
      cx.setTransform(d, 0, 0, d, 0, 0);
    };
    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(cv);
    const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    visibilityObserver.observe(cv);

    const onDown = (e) => {
      const r = cv.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      let nearest = -1;
      let dist = 48;
      positions.current.forEach((p, i) => {
        const v = Math.hypot(p[0] - x, p[1] - y);
        if (v < dist) {
          nearest = i;
          dist = v;
        }
      });
      if (nearest >= 0) onSelect(nearest);
    };
    cv.addEventListener('pointerdown', onDown);

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden || !visible || !cw || !ch || now - last < (rm ? 160 : 30)) return;
      last = now;
      if (!rm) time += 0.009;
      const { selected: sel, lang: currentLang } = live.current;
      const glow = colors['--glow'];
      const acc = colors['--blue'];
      cx.clearRect(0, 0, cw, ch);
      const pos = skills.map((n, i) => [
        (w < 760 ? 0.1 + n.x * 0.8 : n.x) * cw + Math.sin(time + i * 1.7) * 10,
        n.y * ch * (w < 760 ? 0.8 : 1) + Math.cos(time * 0.8 + i * 2.1) * 10,
      ]);
      positions.current = pos;
      pos.forEach((a, i) => pos.forEach((b, j) => {
        if (j <= i) return;
        const distance = Math.hypot(a[0] - b[0], a[1] - b[1]);
        const max = Math.max(cw, ch) * 0.3;
        if (distance < max) {
          cx.strokeStyle = glow;
          cx.globalAlpha = (1 - distance / max) * 0.5;
          cx.beginPath();
          cx.moveTo(...a);
          cx.lineTo(...b);
          cx.stroke();
          const u = (time * 0.5 + i * 0.37 + j * 0.21) % 1;
          cx.fillStyle = acc;
          cx.globalAlpha = 0.85;
          cx.beginPath();
          cx.shadowColor = acc;
          cx.shadowBlur = 8;
          cx.arc(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, 2.6, 0, 7);
          cx.fill();
          cx.shadowBlur = 0;
        }
      }));
      pos.forEach((p, i) => {
        const halo = cx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 24);
        halo.addColorStop(0, i === sel ? acc : glow);
        halo.addColorStop(1, 'transparent');
        cx.globalAlpha = 0.3;
        cx.fillStyle = halo;
        cx.beginPath();
        cx.arc(...p, 24, 0, 7);
        cx.fill();
        cx.globalAlpha = 1;
        cx.fillStyle = i === sel ? acc : colors['--ink'];
        cx.beginPath();
        cx.arc(...p, i === sel ? 5.5 : 3.5, 0, 7);
        cx.fill();
        cx.globalAlpha = 0.7;
        cx.font = "300 14px 'Roboto',sans-serif";
        cx.fillText(skills[i][currentLang][0], p[0] + 13, p[1] + 5);
        if (i === sel) {
          cx.strokeStyle = acc;
          cx.beginPath();
          cx.arc(...p, 14 + Math.sin(time * 4) * 2, 0, 7);
          cx.stroke();
        }
      });
      cx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      sizeObserver.disconnect();
      visibilityObserver.disconnect();
      themeObserver.disconnect();
      cv.removeEventListener('pointerdown', onDown);
    };
  }, [onSelect]);

  return (
    <canvas
      id="constellation"
      ref={canvasRef}
      aria-label={t('Ур чадварын оддын зураглалыг судлах', 'Explore the skills constellation')}
    />
  );
}
