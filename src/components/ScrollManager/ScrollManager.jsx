import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Route солигдоход дээш гүйлгэнэ; #hash байвал тухайн элемент рүү (CSS-ийн scroll-behavior:smooth-аар) гүйлгэнэ.
export default function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return undefined;
    }
    let tries = 0;
    let timer;
    const go = () => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) el.scrollIntoView();
      else if (tries++ < 20) timer = setTimeout(go, 50);
    };
    go();
    return () => clearTimeout(timer);
  }, [pathname, hash]);

  return null;
}
