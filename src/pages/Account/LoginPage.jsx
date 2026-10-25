import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { demoUsers, useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import './account.css';
export default function LoginPage() {
  const { user, login } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  useDocumentTitle(t('Нэвтрэх — Magic Code AI', 'Log in — Magic Code AI'));
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/account'} replace />;
  function submit(e) {
    e.preventDefault();
    const profile = login(email, password);
    if (!profile) { setError(t('Имэйл эсвэл нууц үг буруу байна.', 'Incorrect email or password.')); return; }
    const next = location.state?.from;
    navigate(profile.role === 'admin' ? '/admin' : (next === '/account' ? next : '/account'), { replace: true });
  }
  return <>
    <main className="account-page wrap login-layout">
      <div className="login-intro"><div className="eyebrow">MAGIC CODE · YOUR SPACE</div><h1>{t('Үргэлжлүүлэн', 'Keep')}<br /><em>{t('бүтээцгээе.', 'creating.')}</em></h1><p>{t('Хичээлээ үзэж, шинэ зүйл суралцаж, өөрийн ахиц бүрийг бүтээх орон зай.', 'Your space to learn, explore lessons and keep moving forward.')}</p><div className="account-note">{t('DEMO ОРЧИН · Бүртгэл болон захиалга энэ хөтөч дээр хадгалагдана. Бодит төлбөр хийгдэхгүй.', 'DEMO · Accounts and orders are stored in this browser. No real payments are made.')}</div></div>
      <div className="account-card"><h2>{t('Тавтай морил', 'Welcome back')}</h2><p>{t('Бүртгэлээрээ нэвтрэх', 'Log in to your account')}</p>
        <form onSubmit={submit}><label htmlFor="login-email">{t('Имэйл хаяг', 'Email address')}</label><input id="login-email" type="email" autoComplete="username" required value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} /><label htmlFor="login-password">{t('Нууц үг', 'Password')}</label><input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} />{error && <p className="account-error" role="alert">{error}</p>}<button className="btn" type="submit">{t('Нэвтрэх →', 'Log in →')}</button></form>
        <div className="demo-accounts"><small>{t('ТУРШИХ БҮРТГЭЛ СОНГОХ', 'CHOOSE A DEMO ACCOUNT')}</small>{demoUsers.map((u) => <button key={u.id} type="button" onClick={() => { setEmail(u.email); setPassword(u.password); setError(''); }}><strong>{u.role === 'admin' ? t('Админ', 'Admin') : t('Хэрэглэгч', 'User')} ↗</strong><span>{u.email}</span><code>{u.password}</code></button>)}</div>
      </div>
    </main></>;
}
