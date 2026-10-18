import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
export default function AccountLink({ onClick }) {
  const { user } = useAuth();
  const { t } = useLang();
  return <Link onClick={onClick} className="account-link" to={user ? (user.role === 'admin' ? '/admin' : '/account') : '/login'}>{user ? (user.role === 'admin' ? t('Удирдлага', 'Admin') : t('Миний хэсэг', 'My account')) : t('Нэвтрэх', 'Log in')} ↗</Link>;
}
