import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AccountLink from './AccountLink';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
export default function AccountMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { t } = useLang();
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    function close(e) { if (!ref.current?.contains(e.target)) setOpen(false); }
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);
  return <div className="account-menu" ref={ref} onKeyDown={(e) => { if (e.key === 'Escape') { setOpen(false); ref.current?.querySelector('button')?.focus(); } }}>
    <button className="account-menu-trigger" aria-label={t('Цэс', 'Menu')} aria-expanded={open} aria-controls="account-navigation" onClick={() => setOpen(!open)}><span className="menu-icon" aria-hidden="true"><span /><span /><span /></span></button>
    {open && <nav id="account-navigation" className="account-dropdown" aria-label={t('Хэрэглэгчийн цэс', 'Account navigation')} onClick={() => setOpen(false)}><Link to="/">{t('Нүүр хуудас', 'Home')}</Link><Link to="/courses">{t('Сургалтууд', 'Courses')}</Link><Link to="/news">{t('Мэдээ', 'News')}</Link><AccountLink />{user && <button onClick={logout}>{t('Гарах', 'Log out')}</button>}</nav>}
  </div>;
}
