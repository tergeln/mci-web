import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../../context/LanguageContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { readStorage, writeStorage } from '../../hooks/useLocalStorage';
import { homeCourses } from '../../data/courses';
import MainNavbar from '../../components/MainNavbar/MainNavbar';
import Footer from '../../components/Footer/Footer';
import Chatbot from '../../components/Chatbot/Chatbot';
import EnrollDialog from '../../components/dialogs/EnrollDialog';
import CartDialog from '../../components/dialogs/CartDialog';
import ClassroomDialog from '../../components/dialogs/ClassroomDialog';
import ParticleUniverse from '../../components/canvas/ParticleUniverse';
import Universe2D from '../../components/canvas/Universe2D';
import Loader from './Loader';
import ScrollProgress from './ScrollProgress';
import CursorGlow from './CursorGlow';
import ChapterIndex from './ChapterIndex';
import Hero from './Hero/Hero';
import TechStrip from './Hero/TechStrip';
import CoursesSection from './Courses/CoursesSection';
import AboutSection from './About/AboutSection';
import Activities from './Activities';
import Merch from './Merch';
import Contact from './Contact';
import LiveStrip from './LiveStrip';
import '../../styles/home.css';

function loadCart() {
  try {
    const saved = JSON.parse(readStorage('mc-cart', '[]'));
    return Array.isArray(saved) ? saved.filter((x) => Number.isInteger(x) && x >= 0 && x < 3) : [];
  } catch {
    return [];
  }
}

export default function Home() {
  const { t } = useLang();
  const [searchParams] = useSearchParams();
  const [glReady, setGlReady] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [cart, setCart] = useState(loadCart);
  const [enrollRequest, setEnrollRequest] = useState(null);
  const [cartRequest, setCartRequest] = useState(null);
  const [classroomRequest, setClassroomRequest] = useState(null);

  useDocumentTitle(t('Magic Code AI — Суралц. Бүтээ. Хөгж.', 'Magic Code AI — Learn. Build. Become.'));

  const openCourse = useCallback((course) => setEnrollRequest((r) => ({ course, id: (r ? r.id : 0) + 1 })), []);
  const openClassroom = useCallback(() => setClassroomRequest((r) => ({ id: (r ? r.id : 0) + 1 })), []);
  const openCart = () => setCartRequest((r) => ({ id: (r ? r.id : 0) + 1 }));

  // `/?course=data-analysis` – каталог хуудсаас орж ирэхэд тухайн курсийн dialog-ийг шууд нээнэ.
  // Хуучин `/?course=0|1|2` холбоосууд ч ажиллана.
  const requested = searchParams.get('course');
  useEffect(() => {
    const index = /^[0-2]$/.test(requested ?? '') ? Number(requested) : homeCourses.findIndex((c) => c.id === requested);
    if (index !== -1) openCourse(index);
  }, [requested, openCourse]);

  const saveCart = (next) => {
    setCart(next);
    writeStorage('mc-cart', JSON.stringify(next));
  };

  return (
    <>
      <Universe2D active={glReady === false} />
      <ParticleUniverse onResult={setGlReady} />
      <Loader />
      <ScrollProgress />
      <CursorGlow />
      <ChapterIndex />
      <MainNavbar cartCount={cart.length} onCartClick={openCart} />
      <main>
        <Hero />
        <CoursesSection onSelectCourse={openCourse} />
        <AboutSection />
        <Activities />
        <Merch />
        <TechStrip />
        <Contact onOpenChat={() => setChatOpen(true)} />
      </main>
      <Footer />
      <Chatbot open={chatOpen} onOpenChange={setChatOpen} />
      <EnrollDialog request={enrollRequest} onOpenClassroom={openClassroom} />
      <CartDialog
        request={cartRequest}
        cart={cart}
        onRemove={(index) => saveCart(cart.filter((_, i) => i !== index))}
        onClear={() => saveCart([])}
      />
      <div className="toast" id="toast" hidden role="status" />
      <LiveStrip />
      <ClassroomDialog request={classroomRequest} />
    </>
  );
}
