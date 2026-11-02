import './BrandLogo.css';

export default function BrandLogo() {
  return (
    <span className="brand-logo3d" aria-hidden="true">
      <img
        className="brand-logo-image"
        src="/assets/navbar-logo.webp"
        srcSet="/assets/navbar-logo-64.webp 64w, /assets/navbar-logo.webp 96w, /assets/navbar-logo-128.webp 128w, /assets/navbar-logo-192.webp 192w"
        sizes="(max-width: 359px) 56px, (max-width: 640px) 64px, (max-width: 720px) 80px, 96px"
        alt=""
        width="96"
        height="60"
        decoding="async"
      />
    </span>
  );
}
