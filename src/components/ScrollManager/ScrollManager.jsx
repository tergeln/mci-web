import { useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// Route шилжихэд дээш гүйлгэж, browser back/forward үед хадгалсан scroll байрлалыг сэргээнэ.
export default function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const positions = useRef(new Map());

  useLayoutEffect(() => {
    let frame;
    let tries = 0;
    let timer;
    if (location.hash) {
      const go = () => {
        const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (el) el.scrollIntoView();
        else if (tries++ < 20) timer = setTimeout(go, 50);
      };
      go();
    } else {
      const saved = navigationType === 'POP' ? positions.current.get(location.key) : null;
      if (saved) {
        frame = requestAnimationFrame(() => {
          window.scrollTo({ top: saved.top, left: saved.left, behavior: 'instant' });
        });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    }

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      positions.current.set(location.key, { top: window.scrollY, left: window.scrollX });
    };
  }, [location.key, location.pathname, location.hash, navigationType]);

  return null;
}
