import { Link } from 'react-router-dom';
import Tr from '../../../components/Tr/Tr';
import useReveal from '../../../hooks/useReveal';
import { homeCourses } from '../../../data/courses';
import CourseCard from './CourseCard';
import useApi from '../../../hooks/useApi';
import ApiState from '../../../components/ApiState/ApiState';
import { getCourses } from '../../../api/courses';

export default function CoursesSection({ onSelectCourse }) {
  const [headRef, headClass] = useReveal('section-head');
  const { data: courses, loading, error, reload } = useApi((signal) => getCourses({ signal }), []);
  const status = { open: { mn: 'Бүртгэл нээлттэй', en: 'Enrollment open' }, waitlist: { mn: 'Хүлээлгийн жагсаалт', en: 'Waitlist' }, planned: { mn: 'Төлөвлөсөн', en: 'Planned' } };
  const homeOrder = (course) => homeCourses.findIndex((item) => item.id === course.id);
  const cards = (courses || []).filter((course) => course.featured).sort((a, b) => homeOrder(a) - homeOrder(b)).map((course) => {
    const presentation = course.homePresentation || {};
    return { ...presentation, ...course, title: !course.managed && presentation.title ? presentation.title : course.title,
      text: !course.managed && presentation.text ? presentation.text : course.description,
      image: !course.managed && presentation.image ? presentation.image : course.image,
      meta: course.duration?.mn || course.level?.mn ? { mn: [course.duration?.mn, course.level?.mn].filter(Boolean).join(' · '), en: [course.duration?.en, course.level?.en].filter(Boolean).join(' · ') } : presentation.meta || { mn: course.category, en: course.category },
      tag: presentation.tag || { mn: course.category, en: course.category }, statusCode: course.status, status: status[course.status], open: course.status === 'open',
      button: course.status === 'open' ? { mn: 'Сургалт авах', en: 'Take this course' } : course.status === 'waitlist' ? { mn: 'Хүлээлгийн жагсаалт', en: 'Join waitlist' } : { mn: 'Удахгүй', en: 'Coming soon' } };
  });
  return (
    <section id="courses">
      <div className="wrap">
        <div ref={headRef} className={headClass}>
          <div>
            <div className="eyebrow"><Tr mn="ӨӨРТ ТОХИРОХ ЗАМАА СОНГООРОЙ" en="FIND YOUR STARTING POINT" /></div>
            <h2><Tr mn="Шинэ ур чадвар.<br><em>Шинэ боломж.</em>" en="New skills.<br><em>New possibilities.</em>" /></h2>
          </div>
          <p>
            <Tr
              mn="Анхан шатнаас ахисан түвшин хүртэл."
              en="From first steps to your next level."
            />
          </p>
        </div>
        <ApiState loading={loading} error={error} onRetry={reload} />
        <div className="courses">
          {cards.map((course, i) => (
            <CourseCard key={course.id} course={course} index={i} onSelect={() => onSelectCourse(course)} />
          ))}
          <Link className="btn secondary courses-more" to="/courses">
            <Tr mn="Цааш үзэх" en="See all courses" />
          </Link>
        </div>
      </div>
    </section>
  );
}
