import { Link } from 'react-router-dom';
import Tr from '../../../components/Tr/Tr';
import useReveal from '../../../hooks/useReveal';
import { homeCourses } from '../../../data/courses';
import CourseCard from './CourseCard';

export default function CoursesSection({ onSelectCourse }) {
  const [headRef, headClass] = useReveal('section-head');
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
        <div className="courses">
          {homeCourses.map((course, i) => (
            <CourseCard key={course.title.en} course={course} index={i} onSelect={() => onSelectCourse(i)} />
          ))}
          <Link className="btn secondary courses-more" to="/courses">
            <Tr mn="Цааш үзэх" en="See all courses" />
          </Link>
        </div>
      </div>
    </section>
  );
}
