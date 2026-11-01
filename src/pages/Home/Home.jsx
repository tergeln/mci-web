import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../../context/LanguageContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { homeCourses } from '../../data/courses';
import Footer from '../../components/Footer/Footer';
import { useCommerce } from '../../context/CommerceContext';
import Universe2D from '../../components/canvas/Universe2D';
import ScrollProgress from './ScrollProgress';
import CursorGlow from './CursorGlow';
import ChapterIndex from './ChapterIndex';
import Hero from './Hero/Hero';
import TechStrip from './Hero/TechStrip';
import CoursesSection from './Courses/CoursesSection';
import AboutSection from './About/AboutSection';
import Activities from './Activities';
import Contact from './Contact';
import LiveStrip from './LiveStrip';
import '../../styles/home.css';

const ParticleUniverse = lazy(() => import('../../components/canvas/ParticleUniverse'));

export default function Home() {
  const { t } = useLang();
  const [searchParams] = useSearchParams();
  const [glReady, setGlReady] = useState(null);
  const { openCourse: showCourse } = useCommerce();

  useDocumentTitle(t('Magic Code AI', 'Magic Code AI'));

  const openCourse = useCallback((index) => showCourse(homeCourses[index].id), [showCourse]);

  // `/?course=data-analysis` – каталог хуудсаас орж ирэхэд тухайн курсийн dialog-ийг шууд нээнэ.
  // Хуучин `/?course=0|1|2` холбоосууд ч ажиллана.
  const requested = searchParams.get('course');
  useEffect(() => {
    const index = /^[0-2]$/.test(requested ?? '') ? Number(requested) : homeCourses.findIndex((c) => c.id === requested);
    if (index !== -1) openCourse(index);
  }, [requested, openCourse]);

  return (
    <>
      <Universe2D active={glReady === false} />
      <Suspense fallback={null}>
        <ParticleUniverse onResult={setGlReady} />
      </Suspense>
      <ScrollProgress />
      <CursorGlow />
      <ChapterIndex />
      <main>
        <Hero />
        <CoursesSection onSelectCourse={openCourse} />
        <AboutSection />
        <Activities />
        <TechStrip />
        <Contact />
      </main>
      <Footer />
      <div className="toast" id="toast" hidden role="status" />
      <LiveStrip />
    </>
  );
}
