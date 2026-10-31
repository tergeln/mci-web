import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
export default function AccountLink({ onClick }) {
  const { user } = useAuth();
  const { t } = useLang();
  return <NavLink onClick={onClick} className={({ isActive }) => `account-link${isActive ? ' is-active' : ''}`} to={user ? (user.role === 'admin' ? '/admin' : '/account') : '/login'}>{user ? (user.role === 'admin' ? 'Dashboard' : t('Миний хэсэг', 'My account')) : t('Нэвтрэх', 'Log in')} ↗</NavLink>;
}
