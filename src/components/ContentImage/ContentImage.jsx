import { useLang } from '../../context/LanguageContext';
import { imageDelivery } from '../../assets/imageDelivery';

export default function ContentImage({ image, className, loading = 'lazy', sizes = '100vw', decorative = false, fallbackWidth = 1600, fallbackHeight = 900 }) {
  const { lang } = useLang();
  if (typeof image === 'string') image = { src: image };
  image = imageDelivery(image);
  const hasDimensions = Number.isFinite(Number(image.width)) && Number(image.width) > 0 && Number.isFinite(Number(image.height)) && Number(image.height) > 0;
  return <img
    className={className}
    src={image.src}
    srcSet={image.srcSet}
    sizes={image.srcSet ? sizes : undefined}
    alt={decorative ? '' : image.alt?.[lang] || image.alt?.mn || image.alt?.en || ''}
    width={hasDimensions ? image.width : fallbackWidth}
    height={hasDimensions ? image.height : fallbackHeight}
    style={image.position ? { objectPosition: image.position } : undefined}
    loading={loading}
    decoding="async"
  />;
}
