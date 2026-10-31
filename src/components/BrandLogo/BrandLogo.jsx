import { lazy, Suspense } from 'react';
import './BrandLogo.css';

const Logo3D = lazy(() => import('./Logo3D'));

// Header-ийн зүүн дээд буланд байрлах 3D лого (хөдөлгөөнгүй) (өмнө нь magic-code-logo.png зураг байсан).
export default function BrandLogo() {
  return (
    <span className="brand-logo3d" aria-hidden="true">
      <Suspense fallback={null}>
        <Logo3D variant="chrome" depth={0.45} interactive={false} autoRotate={false} minHeight={0} zoom={1.5} />
      </Suspense>
    </span>
  );
}
