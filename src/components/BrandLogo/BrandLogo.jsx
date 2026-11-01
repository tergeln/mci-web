import { lazy, Suspense } from 'react';
import './BrandLogo.css';
import useLightweightVisuals from '../../hooks/useLightweightVisuals';

const Logo3D = lazy(() => import('./Logo3D'));

// Header-ийн зүүн дээд буланд байрлах 3D лого (хөдөлгөөнгүй) (өмнө нь magic-code-logo.png зураг байсан).
export default function BrandLogo() {
  const lightweight = useLightweightVisuals();
  const fallback = <img className="brand-logo-static" src="/assets/contact-logo.svg" width="96" height="60" alt="" />;
  return (
    <span className="brand-logo3d" aria-hidden="true">
      {lightweight ? fallback : <Suspense fallback={fallback}>
        <Logo3D variant="chrome" depth={0.45} interactive={false} autoRotate={false} minHeight={0} zoom={1.5} />
      </Suspense>}
    </span>
  );
}
