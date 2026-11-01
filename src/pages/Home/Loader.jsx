import { lazy, Suspense, useEffect, useState } from 'react';
import reducedMotion from '../../hooks/reducedMotion';
import useLightweightVisuals from '../../hooks/useLightweightVisuals';
import './intro.css';
const Logo3D = lazy(() => import('../../components/BrandLogo/Logo3D'));
export default function Loader() {
  const lightweight = useLightweightVisuals();
  const [visible, setVisible] = useState(() => !reducedMotion() && !window.matchMedia('(max-width:900px)').matches);
  useEffect(() => {
    if (!visible) return undefined;
    const timer = setTimeout(() => setVisible(false), 1800);
    return () => clearTimeout(timer);
  }, [visible]);
  if (!visible || lightweight) return null;
  return <div className="site-intro" aria-hidden="true"><div className="site-intro-mark">
    <div className="site-intro-logo"><Suspense fallback={null}>
      <Logo3D variant="chrome" depth={0.45} interactive={false} autoRotate minHeight={0} zoom={1.25} />
    </Suspense></div>
    <span>MAGIC CODE AI</span>
  </div></div>;
}
