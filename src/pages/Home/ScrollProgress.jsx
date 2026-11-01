import { useEffect, useRef } from 'react';

export default function ScrollProgress() {
  const ref = useRef(null);

  useEffect(() => {
    let scrollRange = 1;
    const update = () => {
      const progress = Math.max(0, Math.min(1, window.scrollY / scrollRange));
      if (ref.current) ref.current.style.transform = `scaleX(${progress})`;
    };
    const measure = () => {
      scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      update();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', measure);
    };
  }, []);

  return <div id="scrollProgress" ref={ref} />;
}
