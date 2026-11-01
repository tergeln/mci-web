import { useMemo } from 'react';
import useLightweightVisuals from '../../../hooks/useLightweightVisuals';

// Эх JS-ийн seed-тэй (2047) санамсаргүй тоо – од бүр үргэлж ижил байрлалтай.
function makeStars() {
  let seed = 2047;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  return Array.from({ length: 170 }, (_, i) => ({
    key: i,
    style: {
      left: `${random() * 100}%`,
      top: `${random() * 100}%`,
      '--star-size': `${0.8 + random() * 1.8}px`,
      '--star-opacity': (0.12 + random() * 0.24).toFixed(2),
    },
  }));
}

export default function HeroBackdrop() {
  const mobile = useLightweightVisuals('(max-width:900px)');
  const stars = useMemo(makeStars, []);
  const visibleStars = mobile ? stars.slice(0, 40) : stars;
  return (
    <>
      <div className="hero-static-stars" aria-hidden="true">
        {visibleStars.map((s) => (
          <i key={s.key} style={s.style} />
        ))}
      </div>
      <div className="hero-color-clouds" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
    </>
  );
}
