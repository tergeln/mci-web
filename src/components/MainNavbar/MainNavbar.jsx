import AccountLink from '../AccountLink';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { navLinks } from '../../data/navLinks';
import Tr from '../Tr/Tr';
import PouchIcon from './PouchIcon';
import BrandLogo from '../BrandLogo/BrandLogo';

const hoverCapable = () => window.matchMedia('(hover:hover) and (pointer:fine)').matches;

export default function MainNavbar({ cartCount, onCartClick }) {
  const { pathname, hash } = useLocation();
  const { lang, t, toggleLang } = useLang();
  const { toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const timer = useRef(0);

  const setMenu = (value) => {
    clearTimeout(timer.current);
    setOpen(value);
  };
  const navigateSection = (target) => {
    setMenu(false);
    if (pathname === '/') document.getElementById(target.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    clearTimeout(timer.current);
    setOpen(false);
  }, [pathname, hash]);
  const enter = () => {
    if (!hoverCapable()) return;
    clearTimeout(timer.current);
    if (!open) timer.current = setTimeout(() => setOpen(true), 180);
  };
  const leave = () => {
    if (hoverCapable()) {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setOpen(false), 240);
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenu(false);
        if (menuRef.current?.contains(document.activeElement)) triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      clearTimeout(timer.current);
    };
  }, []);

  const onBlur = () => {
    setTimeout(() => {
      const active = document.activeElement;
      if (menuRef.current && !menuRef.current.contains(active) && active !== triggerRef.current) setMenu(false);
    }, 0);
  };

  return (
    <header className={`main-header${open ? ' menu-open' : ''}`} onBlur={onBlur}>
      <div className="wrap">
        <Link className="brand" to="/#home" onClick={() => navigateSection('#home')} aria-label="Magic Code AI">
          <BrandLogo />
        </Link>
        <nav
          id="nav"
          ref={menuRef}
          className={open ? 'open' : undefined}
          aria-label={t('Үндсэн цэс', 'Main navigation')}
          aria-hidden={!open}
          inert={open ? undefined : ''}
          onPointerEnter={enter}
          onPointerLeave={leave}
          onFocus={() => setMenu(true)}
        >
          {navLinks.map((link) => (
            <Link key={link.hash} to={`/${link.hash}`} onClick={() => navigateSection(link.hash)}>
              <Tr text={link} />
            </Link>
          ))}
          <AccountLink onClick={() => setMenu(false)} />
        </nav>
        <div className="tools">
          <button id="themeToggle" aria-label={t('Өдрийн болон шөнийн горим солих', 'Switch light or dark theme')} onClick={toggleTheme}>
            <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="M12 3a9 9 0 0 0 0 18Z" fill="currentColor" />
            </svg>
          </button>
          <button
            className="language"
            id="language"
            role="switch"
            aria-checked={lang === 'en'}
            aria-label={t('Хэл солих', 'Switch language')}
            onClick={toggleLang}
          >
            <span className={`lang-option${lang === 'mn' ? ' active' : ''}`}>MN</span>
            <span className={`lang-option${lang === 'en' ? ' active' : ''}`}>EN</span>
          </button>
          <button className="language" id="cartBtn" aria-label={t('Сонирхсон бүтээгдэхүүн', 'Shopping bag')} onClick={onCartClick}>
            <PouchIcon />
            {cartCount > 0 && <span className="cart-count" id="count" aria-live="polite">{cartCount}</span>}
          </button>
          <Link to="/#courses" className="btn" onClick={() => navigateSection('#courses')}><Tr mn="Элсэх" en="Get started" /></Link>
          <button
            className="mobile"
            id="menuBtn"
            ref={triggerRef}
            aria-label={open ? t('Цэс хаах', 'Close menu') : t('Цэс нээх', 'Open menu')}
            aria-expanded={open}
            aria-controls="nav"
            onPointerEnter={enter}
            onPointerLeave={leave}
            onClick={() => setMenu(!open)}
          >
            <span className="menu-icon" aria-hidden="true"><span /><span /><span /></span>
          </button>
        </div>
      </div>
    </header>
  );
}
