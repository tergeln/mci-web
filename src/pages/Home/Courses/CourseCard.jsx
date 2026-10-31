import Tr from '../../../components/Tr/Tr';
import { courseButtonLabel } from '../../../data/courses';
import useReveal from '../../../hooks/useReveal';
import CourseArt from './CourseArt';
import { useLang } from '../../../context/LanguageContext';

export default function CourseCard({ course, index, onSelect }) {
  const [ref, className] = useReveal('card');
  const { lang } = useLang();
  return (
    <article ref={ref} className={className} aria-label={course.title[lang]}>
      <CourseArt course={course} />
      <div className="card-body">
        <p><Tr text={course.text} /></p>
        <div className="meta"><Tr text={course.meta} /></div>
        <div className="card-bottom">
          <button data-course={index} onClick={onSelect}><Tr text={courseButtonLabel} /></button>
        </div>
      </div>
    </article>
  );
}
