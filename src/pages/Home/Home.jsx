import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../../context/LanguageContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { getCourse } from '../../api/courses';
import { errorMessage } from '../../api/client';
import { homeCourses } from '../../data/courses';
import Footer from '../../components/Footer/Footer';
import Chatbot from '../../components/Chatbot/Chatbot';
import EnrollDialog from '../../components/dialogs/EnrollDialog';
import ClassroomDialog from '../../components/dialogs/ClassroomDialog';
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
import Contact from './Contact';
import LiveStrip from './LiveStrip';
import '../../styles/home.css';

const ParticleUniverse = lazy(() => import('../../components/canvas/ParticleUniverse'));

export default function Home() {
  const { t } = useLang();
  const [searchParams] = useSearchParams();
  const [glReady, setGlReady] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [enrollRequest, setEnrollRequest] = useState(null);
  const [classroomRequest, setClassroomRequest] = useState(null);
  const [courseError, setCourseError] = useState('');

  useDocumentTitle(t('Magic Code AI — Суралц. Бүтээ. Хөгж.', 'Magic Code AI — Learn. Build. Become.'));

  const openCourse = useCallback((course) => setEnrollRequest((r) => ({ course, id: (r ? r.id : 0) + 1 })), []);
  const openClassroom = useCallback(() => setClassroomRequest((r) => ({ id: (r ? r.id : 0) + 1 })), []);

  // `/?course=data-analysis` – каталог хуудсаас орж ирэхэд тухайн курсийн dialog-ийг шууд нээнэ.
  // Хуучин `/?course=0|1|2` холбоосууд ч ажиллана.
  const requested = searchParams.get('course');
  useEffect(() => {
    if (!requested) return;
    const controller = new AbortController();
    const courseId = /^[0-2]$/.test(requested) ? homeCourses[Number(requested)].id : requested;
    setCourseError('');
    getCourse(courseId, { signal: controller.signal }).then((course) => openCourse(course), (error) => {
      if (error.name !== 'AbortError') setCourseError(errorMessage(error, t));
    });
    return () => controller.abort();
  }, [requested, openCourse]);

  return (
    <>
      <Universe2D active={glReady === false} />
      <Suspense fallback={null}>
        <ParticleUniverse onResult={setGlReady} />
      </Suspense>
      <Loader />
      <ScrollProgress />
      <CursorGlow />
      <ChapterIndex />
      <main>
        <Hero />
        {courseError && <p className="wrap account-error" role="alert">{courseError}</p>}
        <CoursesSection onSelectCourse={openCourse} />
        <AboutSection />
        <Activities />
        <TechStrip />
        <Contact onOpenChat={() => setChatOpen(true)} />
      </main>
      <Footer />
      <Chatbot open={chatOpen} onOpenChange={setChatOpen} />
      <EnrollDialog request={enrollRequest} onOpenClassroom={openClassroom} />
      <div className="toast" id="toast" hidden role="status" />
      <LiveStrip />
      <ClassroomDialog request={classroomRequest} />
    </>
  );
}
