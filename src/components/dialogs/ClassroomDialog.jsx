import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCommerce } from '../../context/CommerceContext';
import { useEffect, useRef, useState } from 'react';
import { useLang } from '../../context/LanguageContext';
import { getCourseLessons } from '../../api/commerce';
import closeOnBackdrop from '../../hooks/dialogBackdrop';
import { readStorage, writeStorage } from '../../hooks/useLocalStorage';
import { getLearningCourse, lessonStorageKeys } from '../../data/lessons';
import CoursePurchaseButton, { CourseTerms } from '../CoursePurchaseButton';
import SignedVideo from './SignedVideo';
import './classroom-dialog.css';
import '../../pages/Cart/cart.css';

export default function ClassroomDialog({ request }) {
  const { user } = useAuth();
  const { hasAccess } = useCommerce();
  const course = getLearningCourse(request?.courseId ?? request?.course?.id);
  if (!course) return null;
  const unlocked = !!user && hasAccess(course.id);
  return <ClassroomWindow key={`${user?.id || 'guest'}-${course.id}-${unlocked}`} course={course} request={request} userId={user?.id} unlocked={unlocked} />;
}

function ClassroomWindow({ request, course, userId, unlocked }) {
  const { t } = useLang();
  const { key: locationKey } = useLocation();
  const dialog = useRef(null);
  const previousLocation = useRef(locationKey);
  const [opened, setOpened] = useState(false);
  const [lessons, setLessons] = useState(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (previousLocation.current !== locationKey) { dialog.current?.close(); setOpened(false); }
    previousLocation.current = locationKey;
  }, [locationKey]);
  useEffect(() => {
    if (!request) return;
    if (!dialog.current.open) dialog.current.showModal();
    setOpened(true);
  }, [request]);
  useEffect(() => {
    let active = true;
    if (!unlocked || !opened) return;
    setLessons(null); setError(false);
    getCourseLessons(course.id, userId).then((result) => {
      if (!active) return;
      if (!Array.isArray(result.lessons) || !result.lessons.length) { setError(true); return; }
      setLessons(result.lessons);
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [course.id, userId, unlocked, opened, retry]);
  const preview = course.lessons[0];
  return <dialog id="classroom" ref={dialog} onClick={closeOnBackdrop} onClose={() => setOpened(false)} aria-label={t(course.title.mn, course.title.en)}>
    <div className="classroom-top"><div><small>MAGIC CODE · LEARNING SPACE</small><h3>{t(course.title.mn, course.title.en)}</h3></div><button type="button" className="icon-btn" aria-label={t('Хичээлийг хаах', 'Close lessons')} onClick={() => dialog.current.close()}>×</button></div>
    {!unlocked ? <div className="classroom-preview classroom-preview-grid">
      <div className="classroom-preview-main"><h3>{t('Богино танилцуулга', 'Short preview')}</h3>
        {course.video ? <>
          {opened ? <SignedVideo courseId={course.id} preview title={t(preview.mn, preview.en)} /> : <div className="lesson-video" />}
          <p>{t(`${preview.mn} · үнэгүй үзэх боломжтой. Бусад хичээл төлбөр баталгаажсаны дараа нээгдэнэ.`, `${preview.en} · free to watch. Other lessons unlock after payment is confirmed.`)}</p>
        </> : <>
          <div className="lesson-video">{opened && <iframe title={t('Сургалтын танилцуулга', 'Course preview')} src={`https://www.youtube-nocookie.com/embed/${preview.id}?start=0&end=60&rel=0`} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />}</div>
          <p>{t('60 секундийн жишээ танилцуулга · Англи хэлээр.', '60-second sample preview · In English.')}</p>
        </>}
      </div>
      <aside className="classroom-preview-syllabus"><h3>{t('Сургалтын агуулга', 'Course syllabus')}</h3>
        <ol>{course.lessons.map((lesson) => <li key={lesson.id}>{t(lesson.mn, lesson.en)}</li>)}</ol>
        <CourseTerms courseId={course.id} />
        <CoursePurchaseButton courseId={course.id} />
      </aside>
    </div> : <>
      {!lessons && !error && <div className="classroom-preview" role="status">{t('Хичээл ачааллаж байна…', 'Loading your lessons…')}</div>}
      {error && <div className="classroom-preview" role="alert"><p>{t('Хичээл үзэх эрхийг баталгаажуулж чадсангүй. Төлбөрийн төлөвөө шалгаад дахин оролдоно уу.', 'Could not verify lesson access. Check your payment status and try again.')}</p><button className="btn secondary" onClick={() => setRetry((value) => value + 1)}>{t('Дахин оролдох', 'Retry')}</button></div>}
      {lessons && opened && <PaidLessons course={{ ...course, lessons }} userId={userId} />}
    </>}
  </dialog>;
}

function PaidLessons({ course, userId }) {
  const { t } = useLang();
  const { progress: progressKey, last: lastKey } = lessonStorageKeys(course.id, userId);
  const [current, setCurrent] = useState(() => { const index = Number(readStorage(lastKey, '0')); return Number.isInteger(index) && index >= 0 && index < course.lessons.length ? index : 0; });
  const [completed, setCompleted] = useState(() => { try { const saved = JSON.parse(readStorage(progressKey, '[]')); return Array.isArray(saved) ? [...new Set(saved.filter((id) => course.lessons.some((lesson) => lesson.id === id)))] : []; } catch { return []; } });
  const lesson = course.lessons[current];
  const play = (index) => { setCurrent(index); writeStorage(lastKey, String(index)); };
  const toggleComplete = () => {
    const next = completed.includes(lesson.id) ? completed.filter((id) => id !== lesson.id) : [...completed, lesson.id];
    setCompleted(next); writeStorage(progressKey, JSON.stringify(next));
  };
  return <div className="classroom-layout"><div className="classroom-main">
    {lesson.video ? <SignedVideo key={lesson.id} courseId={course.id} lessonId={lesson.id} title={t(lesson.mn, lesson.en)} /> : <div className="lesson-video">{lesson.videoUrl && /^https:\/\//.test(lesson.videoUrl) ? <video key={lesson.id} controls src={lesson.videoUrl} style={{ width: '100%', height: '100%' }} /> : <iframe title={t(lesson.mn, lesson.en)} src={`https://www.youtube-nocookie.com/embed/${lesson.id}?rel=0`} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />}</div>}
    {lesson.creator && <small>{lesson.creator}</small>}<h3>{t(lesson.mn, lesson.en)}</h3>
    <div className="lesson-actions"><button className="btn" onClick={toggleComplete}>{completed.includes(lesson.id) ? t('Үзсэн тэмдэглэгээг авах', 'Undo completion') : t('Үзсэн гэж тэмдэглэх', 'Mark completed')}</button><button className="btn secondary" disabled={current === course.lessons.length - 1} onClick={() => play(current + 1)}>{t('Дараагийн хичээл', 'Next lesson')}</button></div>
  </div><aside className="classroom-sidebar"><h3>{t('Хичээлийн агуулга', 'Course content')}</h3><p>{completed.length} / {course.lessons.length}</p><progress value={completed.length} max={course.lessons.length} />{course.lessons.map((item, index) => <button className="lesson-choice" key={item.id} aria-current={index === current ? 'true' : 'false'} onClick={() => play(index)}><span>{completed.includes(item.id) ? '✓' : String(index + 1).padStart(2, '0')}</span><span>{t(item.mn, item.en)}</span></button>)}</aside></div>;
}
