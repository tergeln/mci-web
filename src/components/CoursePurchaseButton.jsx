import { getCourse } from '../api/courses';
import useApi from '../hooks/useApi';
import { hasCoursePrice } from '../data/coursePricing';
import { Link } from 'react-router-dom';
import { COURSE_ACCESS_MONTHS } from '../data/courseAccess';
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

export function CourseTerms({ price, courseId }) {
  const { t } = useLang();
  const { data, loading, error, reload } = useApi((signal) => courseId ? getCourse(courseId, { signal }) : Promise.resolve(null), [courseId]);
  const amount = courseId ? data?.price : price;
  if (courseId && loading) return <small className="course-terms">{t('Үнэ ачааллаж байна…', 'Loading price…')}</small>;
  if (error) return <small className="course-terms">{t('Үнэ авч чадсангүй.', 'Could not load price.')} <button type="button" onClick={reload}>{t('Дахин оролдох', 'Retry')}</button></small>;
  return <small className="course-terms">{hasCoursePrice(amount) ? new Intl.NumberFormat('mn-MN').format(amount) + '₮' : t('Үнэ баталгаажихыг хүлээж байна', 'Price to be confirmed')} · {t(`${COURSE_ACCESS_MONTHS} сарын эрх`, `${COURSE_ACCESS_MONTHS} months access`)}</small>;
}
