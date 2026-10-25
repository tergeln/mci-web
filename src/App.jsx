import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/Account/LoginPage';
import AccountPage from './pages/Account/AccountPage';
import AdminDashboard from './pages/Account/AdminDashboard';
import './pages/Account/account.css';
import { Route, Routes } from 'react-router-dom';
import ScrollManager from './components/ScrollManager/ScrollManager';
import Home from './pages/Home/Home';
import CoursesPage from './pages/Courses/CoursesPage';
import NewsPage from './pages/News/NewsPage';
import NewsDetailPage from './pages/NewsDetail/NewsDetailPage';

export default function App() {
  return (
    <>
      <AuthProvider>
      <ScrollManager />
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
      </AuthProvider>
    </>
  );
}
