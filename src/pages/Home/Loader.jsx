import { lazy, Suspense, useEffect, useState } from 'react';
import reducedMotion from '../../hooks/reducedMotion';

const Logo3D = lazy(() => import('../../components/BrandLogo/Logo3D'));

export default function Loader() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setDone(true), reducedMotion() ? 100 : 1800);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className={`immersive-loader${done ? ' done' : ''}`} id="immersiveLoad" aria-hidden="true">
      {!done && <div className="loader-logo3d"><Suspense fallback={null}><Logo3D variant="chrome" depth={0.45} interactive={false} autoRotate minHeight={0} zoom={1.25} /></Suspense></div>}
    </div>
  );
}
