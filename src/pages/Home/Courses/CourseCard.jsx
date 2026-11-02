import Tr from '../../../components/Tr/Tr';
import { useCommerce } from '../../../context/CommerceContext';
import CoursePurchaseButton, { CourseTerms } from '../../../components/CoursePurchaseButton';
import useReveal from '../../../hooks/useReveal';
import CourseArt from './CourseArt';
import { useLang } from '../../../context/LanguageContext';

export default function CourseCard({ course, index, onSelect }) {
  const [ref, className] = useReveal('card');
  const { lang, t } = useLang();
  const { hasAccess } = useCommerce();
  return (
    <article ref={ref} className={className} aria-label={course.title[lang]}>
      <CourseArt course={course} />
      <div className="card-body">
        <p><Tr text={course.text} /></p>
        <div className="meta"><Tr text={course.meta} /><CourseTerms price={course.price} /></div>
        <div className="card-bottom">
          {!hasAccess(course.id) && <button className="course-preview-link" onClick={onSelect}>{t("Танилцуулга үзэх", "Watch preview")}</button>}
          <CoursePurchaseButton courseId={course.id} />
        </div>
      </div>
    </article>
  );
}
