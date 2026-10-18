import Logo3D from './Logo3D';
import './BrandLogo.css';

// Header-ийн зүүн дээд буланд байрлах 3D лого (эргэдэг) (өмнө нь magic-code-logo.png зураг байсан).
export default function BrandLogo() {
  return (
    <span className="brand-logo3d" aria-hidden="true">
      <Logo3D variant="chrome" depth={0.45} interactive={false} autoRotate={true} minHeight={0} zoom={1.5} />
    </span>
  );
}
