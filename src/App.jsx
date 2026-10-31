import { AuthProvider } from './context/AuthContext';
import { lazy, Suspense, useState } from 'react';
import './pages/Account/account.css';
import './styles/subpage.css';
import { Route, Routes } from 'react-router-dom';
import MainNavbar from './components/MainNavbar/MainNavbar';
import CartDialog from './components/dialogs/CartDialog';
import ScrollManager from './components/ScrollManager/ScrollManager';

const LoginPage = lazy(() => import('./pages/Account/LoginPage'));
const AccountPage = lazy(() => import('./pages/Account/AccountPage'));
const AdminDashboard = lazy(() => import('./pages/Account/AdminDashboard'));
const Home = lazy(() => import('./pages/Home/Home'));
const CoursesPage = lazy(() => import('./pages/Courses/CoursesPage'));
const NewsPage = lazy(() => import('./pages/News/NewsPage'));
const NewsDetailPage = lazy(() => import('./pages/NewsDetail/NewsDetailPage'));

export default function App() {
  const [cartRequest, setCartRequest] = useState(null);
  const openCart = () => setCartRequest((previous) => ({ id: (previous?.id || 0) + 1 }));
  return (
    <>
      <AuthProvider>
      <ScrollManager />
      <MainNavbar cartCount={0} onCartClick={openCart} />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<NewsDetailPage />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
      <CartDialog request={cartRequest} />
      </AuthProvider>
    </>
  );
}
