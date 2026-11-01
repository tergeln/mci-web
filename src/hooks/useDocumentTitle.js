import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { pageSeo, site } from '../data/seo';

function setMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.content = content;
}

export default function useDocumentTitle(title, options = {}) {
  const { pathname } = useLocation();
  const { lang } = useLang();
  const { description, image, noindex } = options;
  useEffect(() => {
    const page = pageSeo(pathname, lang);
    const pageDescription = description || page.description;
    const pageImage = image ? new URL(image, site.url).href : page.image;
    document.title = title;
    setMeta('name', 'description', pageDescription);
    setMeta('name', 'robots', (noindex ?? page.noindex) ? 'noindex,follow' : 'index,follow');
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.append(canonical);
    }
    canonical.href = page.canonical;
    for (const [key, value] of Object.entries({ title, description: pageDescription, url: page.canonical, image: pageImage, site_name: site.name, type: 'website' })) setMeta('property', `og:${key}`, value);
    for (const [key, value] of Object.entries({ title, description: pageDescription, image: pageImage, card: 'summary' })) setMeta('name', `twitter:${key}`, value);
  }, [title, pathname, lang, description, image, noindex]);
}
