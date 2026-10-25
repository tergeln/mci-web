import { useLang } from '../../context/LanguageContext';

export default function ContentImage({ image, className, loading = 'lazy', sizes = '100vw', decorative = false }) {
  const { lang } = useLang();
  return <img
    className={className}
    src={image.src}
    srcSet={image.srcSet}
    sizes={image.srcSet ? sizes : undefined}
    alt={decorative ? '' : image.alt?.[lang] || image.alt?.mn || image.alt?.en || ''}
    width={image.width}
    height={image.height}
    loading={loading}
    decoding="async"
  />;
}
