import Tr from '../Tr/Tr';
import '../../pages/Home/contact.css';
export default function Footer() {
  return <footer className="site-footer"><div className="wrap footer-inner">
    <small>© {new Date().getFullYear()} Magic Code AI. <Tr mn="Бүх эрх хуулиар хамгаалагдсан." en="All rights reserved." /></small>
  </div></footer>;
}
