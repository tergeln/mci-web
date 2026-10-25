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
  return (
    <section id="courses">
      <div className="wrap">
        <div ref={headRef} className={headClass}>
          <div>
            <div className="eyebrow"><Tr mn="ӨӨРТ ТОХИРОХ ЗАМАА СОНГО" en="FIND YOUR STARTING POINT" /></div>
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
          {homeCourses.map((course, i) => (
            <CourseCard key={course.title.en} course={{ ...course, image: courses?.find((item) => item.id === course.id)?.image }} index={i} onSelect={() => onSelectCourse(i)} />
          ))}
          <Link className="btn secondary courses-more" to="/courses">
            <Tr mn="Цааш үзэх" en="See all courses" />
          </Link>
        </div>
      </div>
    </section>
  );
}
