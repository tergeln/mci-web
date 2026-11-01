import optimizedImages from './optimizedImages.json';

// Only replace bundled originals. Admin uploads and other image URLs stay intact.
export function imageDelivery(image) {
  if (!image?.src) return image;
  let key = image.src;
  if (/^https?:\/\//i.test(key)) {
    const url = new URL(key);
    if (!['mci.mn', 'www.mci.mn'].includes(url.hostname) || url.search || url.hash) return image;
    key = url.pathname;
  }
  return optimizedImages[key] ? { ...image, ...optimizedImages[key] } : image;
}
