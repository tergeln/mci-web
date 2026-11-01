import { useLang } from '../../context/LanguageContext';
import { imageDelivery } from '../../assets/imageDelivery';

export default function ContentImage({ image, className, loading = 'lazy', sizes = '100vw', decorative = false }) {
  const { lang } = useLang();
  image = imageDelivery(image);
  return <img
    className={className}
    src={image.src}
    srcSet={image.srcSet}
    sizes={image.srcSet ? sizes : undefined}
    alt={decorative ? '' : image.alt?.[lang] || image.alt?.mn || image.alt?.en || ''}
    width={image.width}
    height={image.height}
    style={image.position ? { objectPosition: image.position } : undefined}
    loading={loading}
    decoding="async"
  />;
}
