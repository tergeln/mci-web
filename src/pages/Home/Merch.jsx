import Tr from '../../components/Tr/Tr';
import useReveal from '../../hooks/useReveal';
import { merch, merchImageQuery } from '../../data/merch';

function ProductCard({ product }) {
  const [infoRef, infoClass] = useReveal('product-info');
  // Эх `onerror`: эхний удаа алдаа гарвал query-гүй эх зураг руу шилжинэ.
  const onError = (e) => {
    const img = e.currentTarget;
    if (!img.dataset.fallback) {
      img.dataset.fallback = 'true';
      img.src = product.original;
    }
  };
  return (
    <article>
      <a className="product-art" href={product.href} target="_blank" rel="noopener noreferrer">
        <img
          src={product.original + merchImageQuery}
          alt={product.alt}
          width="1800"
          height="1800"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={onError}
        />
      </a>
      <div ref={infoRef} className={infoClass}>
        <div><h3><Tr text={product.title} /></h3></div>
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
            <div className="eyebrow"><Tr mn="ШИДЭТ ЦУГЛУУЛГА" en="THE MAGIC COLLECTION" /></div>
            <h2><Tr mn="Өдөр бүрт <em>багахан шид.</em>" en="A little magic, <em>every day.</em>" /></h2>
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
