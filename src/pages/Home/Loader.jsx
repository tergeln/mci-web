import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import reducedMotion from '../../hooks/reducedMotion';
import './intro.css';
const Logo3D = lazy(() => import('../../components/BrandLogo/Logo3D'));
export default function Loader({ onComplete }) {
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;
  const [reduce] = useState(reducedMotion);
  const [visible, setVisible] = useState(!reduce);
  const [ready, setReady] = useState(reduce);
  useEffect(() => {
    if (!ready) return undefined;
    const timer = setTimeout(() => setVisible(false), 1800);
    return () => clearTimeout(timer);
  }, [ready]);
  // Never leave the entrance covering the page if WebGL cannot initialize.
  useEffect(() => {
    if (ready) return undefined;
    const timer = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(timer);
  }, [ready]);
  useEffect(() => {
    if (!visible) completeRef.current?.();
  }, [visible]);
  if (!visible) return null;
  return <div className={`site-intro${ready ? ' is-ready' : ''}`} aria-hidden="true"><div className="site-intro-mark">
    <div className="site-intro-logo">{!reduce && <Suspense fallback={null}>
      <Logo3D variant="chrome" depth={0.45} interactive={false} autoRotate minHeight={0} zoom={1.25} onReady={() => setReady(true)} />
    </Suspense>}</div>
    <span>MAGIC CODE AI</span>
  </div></div>;
}
