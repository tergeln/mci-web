import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import './account.css';

const errors = {
  name: ['Нэрээ оруулна уу (100 хүртэл тэмдэгт).', 'Enter your name (up to 100 characters).'],
  email: ['Зөв имэйл хаяг оруулна уу.', 'Enter a valid email address.'],
  password: ['Нууц үг 8–128 тэмдэгттэй байх ёстой.', 'Use a password between 8 and 128 characters.'],
  mismatch: ['Нууц үгүүд таарахгүй байна.', 'The passwords do not match.'],
  duplicate: ['Энэ имэйл бүртгэлтэй байна. Нэвтрэх хэсгээр орно уу.', 'This email is already registered. Please log in.'],
  storage: ['Бүртгэлийг хадгалж чадсангүй. Хөтчийн хадгалах зөвшөөрлийг шалгаад дахин оролдоно уу.', 'Could not save your account. Allow browser storage and try again.'],
  login: ['Имэйл эсвэл нууц үг буруу байна.', 'Incorrect email or password.'],
  unknown: ['Алдаа гарлаа. Дахин оролдоно уу.', 'Something went wrong. Please try again.'],
};

function PasswordVisibilityIcon({ visible }) {
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {visible ? <><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A11.6 11.6 0 0 1 12 5c6 0 10 7 10 7a18.4 18.4 0 0 1-3 3.7M6.5 6.5A19.2 19.2 0 0 0 2 12s4 7 10 7a11 11 0 0 0 5.5-1.5" /></> : <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>}
  </svg>;
}

export default function LoginPage({ mode = 'login' }) {
  const signingUp = mode === 'register';
  const { user, login, register } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useDocumentTitle(signingUp ? t('Бүртгүүлэх — Magic Code AI', 'Sign up — Magic Code AI') : t('Нэвтрэх — Magic Code AI', 'Log in — Magic Code AI'));
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/account'} replace />;

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setError('');
    if (signingUp && password !== confirmation) { setError('mismatch'); return; }
    setBusy(true);
    try {
      let profile;
      if (signingUp) {
        const result = await register({ name, email, password });
        if (result.error) { setError(result.error); return; }
        profile = result.profile;
      } else {
        profile = await login(email, password);
        if (!profile) { setError('login'); return; }
      }
      navigate(profile.role === 'admin' ? '/admin' : '/account', { replace: true });
    } catch {
      setError('unknown');
    } finally {
      setBusy(false);
    }
  }

  const update = (setter) => (event) => { setter(event.target.value); setError(''); };
  return <main className="account-page wrap login-layout">
    <div className="login-intro">
      <div className="eyebrow">MAGIC CODE · YOUR SPACE</div>
      <h1>{t('Үргэлжлүүлэн', 'Keep')}<br /><em>{t('бүтээцгээе.', 'creating.')}</em></h1>
      <p>{t('Хичээлээ үзэж, шинэ зүйл суралцаж, өөрийн ахиц бүрийг бүтээх орон зай.', 'Your space to learn, explore lessons and keep moving forward.')}</p>
    </div>
    <div className="account-card login-card">
      <nav className="auth-tabs" aria-label={t('Бүртгэл ба нэвтрэлт', 'Account access')}>
        <Link to="/login" state={location.state} aria-current={!signingUp ? 'page' : undefined}>{t('Нэвтрэх', 'Log in')}</Link>
        <Link to="/register" state={location.state} aria-current={signingUp ? 'page' : undefined}>{t('Бүртгүүлэх', 'Sign up')}</Link>
      </nav>
      <h2>{signingUp ? t('Хамтдаа эхэлье', 'Start your journey') : t('Тавтай морил', 'Welcome back')}</h2>
      <p>{signingUp ? t('Өөрийн суралцах орон зайг үүсгээрэй.', 'Create your own learning space.') : t('Бүртгэлээрээ нэвтрэх', 'Log in to your account')}</p>
      <form onSubmit={submit} aria-busy={busy}>
        <fieldset disabled={busy}>
          {signingUp && <div className="auth-field"><label htmlFor="auth-name">{t('Нэр', 'Name')}</label><input id="auth-name" name="name" autoComplete="name" required maxLength={100} value={name} onChange={update(setName)} /></div>}
          <div className="auth-field"><label htmlFor="login-email">{t('Имэйл хаяг', 'Email address')}</label><input id="login-email" name="email" type="email" autoComplete="username" required maxLength={254} value={email} onChange={update(setEmail)} /></div>
          <div className="auth-field"><label htmlFor="login-password">{t('Нууц үг', 'Password')}</label>
            <div className="auth-password"><input id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={signingUp ? 'new-password' : 'current-password'} required minLength={signingUp ? 8 : undefined} maxLength={128} aria-describedby={signingUp ? 'password-help' : undefined} value={password} onChange={update(setPassword)} /><button type="button" aria-label={showPassword ? t('Нууц үг нуух', 'Hide password') : t('Нууц үг харах', 'Show password')} aria-controls={signingUp ? 'login-password auth-confirm' : 'login-password'} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}><PasswordVisibilityIcon visible={showPassword} /></button></div>
            {signingUp && <small id="password-help">{t('8–128 тэмдэгт ашиглана уу.', 'Use 8–128 characters.')}</small>}
          </div>
          {signingUp && <div className="auth-field"><label htmlFor="auth-confirm">{t('Нууц үг давтах', 'Confirm password')}</label><input id="auth-confirm" name="confirmation" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={8} maxLength={128} value={confirmation} onChange={update(setConfirmation)} /></div>}
          {error && <p className="account-error" role="alert">{t(...(errors[error] || errors.unknown))}</p>}
          <button className="btn auth-submit" type="submit">{busy ? t('Түр хүлээнэ үү…', 'Please wait…') : signingUp ? t('Бүртгүүлэх →', 'Sign up →') : t('Нэвтрэх →', 'Log in →')}</button>
        </fieldset>
      </form>
      <p className="auth-switch">{signingUp ? t('Бүртгэлтэй юу?', 'Already have an account?') : t('Бүртгэлгүй юу?', 'New here?')} <Link className="text-link" to={signingUp ? '/login' : '/register'} state={location.state}>{signingUp ? t('Нэвтрэх', 'Log in') : t('Бүртгүүлэх', 'Sign up')}</Link></p>
    </div>
  </main>;
}
