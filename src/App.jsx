import { CommerceProvider, useCommerce } from './context/CommerceContext';
import { useNavigate } from 'react-router-dom';
import ClassroomDialog from './components/dialogs/ClassroomDialog';
import { AuthProvider } from './context/AuthContext';
import { lazy, Suspense } from 'react';
import './pages/Account/account.css';
import './styles/subpage.css';
import { Route, Routes } from 'react-router-dom';
import MainNavbar from './components/MainNavbar/MainNavbar';
import ScrollManager from './components/ScrollManager/ScrollManager';

const CartPage = lazy(() => import('./pages/Cart/CartPage'));
const LoginPage = lazy(() => import('./pages/Account/LoginPage'));
const AccountPage = lazy(() => import('./pages/Account/AccountPage'));
const Home = lazy(() => import('./pages/Home/Home'));
const CoursesPage = lazy(() => import('./pages/Courses/CoursesPage'));
const NewsPage = lazy(() => import('./pages/News/NewsPage'));
const NewsDetailPage = lazy(() => import('./pages/NewsDetail/NewsDetailPage'));

export default function App() {
  return <AuthProvider><CommerceProvider><SiteRoutes /></CommerceProvider></AuthProvider>;
}

function SiteRoutes() {
  const { cart, classroomRequest } = useCommerce();
  const navigate = useNavigate();
  const openCart = () => navigate('/cart');
  return (
    <>
      <ScrollManager />
      <MainNavbar cartCount={cart.length} onCartClick={openCart} />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/login" element={<LoginPage key="login" />} />
          <Route path="/register" element={<LoginPage key="register" mode="register" />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<NewsDetailPage />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
      <ClassroomDialog request={classroomRequest} />
    </>
  );
}
