import { Link } from 'react-router-dom';
import { COURSE_PRICE, COURSE_ACCESS_MONTHS } from '../data/courseAccess';
import { useState } from 'react';
import { useCommerce } from '../context/CommerceContext';
import { useLang } from '../context/LanguageContext';

export default function CoursePurchaseButton({ courseId, className = 'btn' }) {
  const { cart, addCourse, hasAccess, openCourse } = useCommerce();
  const { t } = useLang();
  const [error, setError] = useState('');
  const buttonClass = `${className} course-purchase-button`;
  if (hasAccess(courseId)) return <button className={buttonClass} onClick={() => openCourse(courseId)}>{t('Хичээл үзэх', 'Watch lessons')}</button>;
  if (cart.includes(courseId)) return <Link className={`${buttonClass} course-in-cart`} to="/cart">{t('Сагс руу очих', 'Go to cart')}</Link>;
  return <><button className={buttonClass} onClick={() => { try { addCourse(courseId); } catch { setError(t('Сагс хадгалж чадсангүй. Дахин оролдоно уу.', 'Could not save your cart. Please try again.')); } }}>{t('Сагслах', 'Add to cart')}</button>{error && <small role="alert">{error}</small>}</>;
}

export function CourseTerms() {
  const { t } = useLang();
  return <small className="course-terms">{new Intl.NumberFormat('mn-MN').format(COURSE_PRICE)}₮ · {t(`${COURSE_ACCESS_MONTHS} сарын эрх`, `${COURSE_ACCESS_MONTHS} months access`)}</small>;
}
