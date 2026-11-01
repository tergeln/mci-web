import { useEffect, useRef, useState } from 'react';
// Fetch section content shortly before it enters the viewport.
export default function useNearViewport() {
 const ref = useRef(null);
 const [enabled, setEnabled] = useState(false);
 useEffect(() => {
  if (!ref.current || !('IntersectionObserver' in window)) { setEnabled(true); return; }
  const observer = new IntersectionObserver(([entry]) => {
   if (entry.isIntersecting) { setEnabled(true); observer.disconnect(); }
  }, { rootMargin: '300px' });
  observer.observe(ref.current);
  return () => observer.disconnect();
 }, []);
 return [ref, enabled];
}
