import { useEffect, useState } from 'react';

export default function useLightweightVisuals(query = '(max-width:900px), (prefers-reduced-motion:reduce)') {
  const [lightweight, setLightweight] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setLightweight(media.matches);
    media.addEventListener('change', update);
    update();
    return () => media.removeEventListener('change', update);
  }, [query]);
  return lightweight;
}
