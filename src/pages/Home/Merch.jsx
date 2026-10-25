import Tr from '../../components/Tr/Tr';
import useReveal from '../../hooks/useReveal';
import { merch } from '../../data/merch';

function ProductCard({ product }) {
  const [infoRef, infoClass] = useReveal('product-info');
  return (
    <article>
      <div className="product-art product-art--locked">
        <img
          src={product.original}
          alt={product.alt}
          width="1800"
          height="1800"
          loading="lazy"
          decoding="async"
        />
        <div className="product-locked-overlay">
          <span className="product-locked-label">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="5" y="10" width="14" height="11" rx="3" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
            </svg>
            <Tr mn="Тун удахгүй" en="Coming soon" />
          </span>
        </div>
      </div>
      <div ref={infoRef} className={infoClass}>
        <div>
          <h3><Tr text={product.title} /></h3>
        </div>
      </div>
    </article>
  );
}

export default function Merch() {
  const [headRef, headClass] = useReveal('section-head');
  return (
    <section className="merch-section" id="merch">
      <div className="wrap">
        <div ref={headRef} className={headClass}>
          <div>
            <div className="eyebrow"><Tr mn="БҮТЭЭГДЭХҮҮН" en="PRODUCTS" /></div>
            <h2><Tr mn="Цүнхнүүд" en="Bags" /></h2>
          </div>
        </div>
        <div className="products lv-products">
          {merch.map((product) => (
            <ProductCard key={product.label} product={product} />
          ))}
        </div>
        <p className="merch-notice">
          <Tr
            mn="Түр загварын зураг · Magic Code AI-ийн худалдаалах бүтээгдэхүүн биш."
            en="Temporary design imagery · These are not products sold by Magic Code AI."
          />
        </p>
      </div>
    </section>
  );
}
