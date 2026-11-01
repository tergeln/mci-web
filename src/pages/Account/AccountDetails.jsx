import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import { getProfile, updateProfile } from '../../api/account';
import { readStorage, writeStorage } from '../../hooks/useLocalStorage';
import { learningCourses, getLearningCourse, lessonStorageKeys } from '../../data/lessons';

export function LearningProgress({ onWatch }) {
  const { user } = useAuth();
  const { t } = useLang();
  const [courseId, setCourseId] = useState('data-analysis');
  const course = getLearningCourse(courseId);
  const courseLessons = course.lessons;
  const { progress: progressKey } = lessonStorageKeys(course.id, user.id);
  let completed = [];
  try {
    const saved = JSON.parse(readStorage(progressKey, '[]'));
    if (Array.isArray(saved)) completed = courseLessons.filter((lesson) => saved.includes(lesson.id));
  } catch { /* Start with empty progress if saved data cannot be read. */ }
  return <section className="account-card account-section">
    <div className="eyebrow">03 · PROGRESS</div>
    <h2>{t('Суралцах явц', 'Learning progress')}</h2>
    <label>{t('Сургалт', 'Course')}<select value={courseId} onChange={(event) => setCourseId(event.target.value)}>{learningCourses.map((item) => <option key={item.id} value={item.id}>{t(item.title.mn, item.title.en)}</option>)}</select></label>
    <p>{completed.length} / {courseLessons.length} {t('хичээл дууссан', 'lessons completed')} · {Math.round(completed.length / courseLessons.length * 100)}%</p>
    <progress className="account-progress" value={completed.length} max={courseLessons.length} aria-label={t('Хичээлийн явц', 'Lesson progress')} />
    {courseLessons.map((lesson, index) => <div className="account-row" key={lesson.id}><span>{completed.some((item) => item.id === lesson.id) ? '✓' : String(index + 1).padStart(2, '0')} · {t(lesson.mn, lesson.en)}</span></div>)}
    <button className="btn" onClick={() => onWatch(course.id)}>{t('Үргэлжлүүлэн сурах →', 'Continue learning →')}</button>
  </section>;
}

export function AccountProfile() {
  const { user, remote } = useAuth();
  const { t } = useLang();
  const key = `mc-profile-${user.id}`;
  const [profile, setProfile] = useState(() => {
    const defaults = { name: user.name, phone: '', goal: '' };
    try {
      const saved = JSON.parse(readStorage(key, 'null'));
      return Object.fromEntries(Object.entries(defaults).map(([field, fallback]) => [field, typeof saved?.[field] === 'string' ? saved[field] : fallback]));
    } catch { return defaults; }
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    if (!remote) return undefined;
    const controller = new AbortController();
    getProfile({ signal: controller.signal })
      .then(({ name, phone, goal }) => setProfile({ name, phone, goal }))
      .catch((failure) => { if (failure.name !== 'AbortError') setError(true); });
    return () => controller.abort();
  }, [remote]);
  async function save() {
    if (!remote) return writeStorage(key, JSON.stringify(profile));
    try { await updateProfile(profile); return true; } catch { return false; }
  }
  return <section className="account-card account-section">
    <div className="eyebrow">04 · PROFILE</div>
    <h2>{t('Миний мэдээлэл', 'My profile')}</h2>
    <p>{user.email}</p>
    <form onSubmit={async (event) => {
      event.preventDefault();
      const success = await save();
      setSaved(success); setError(!success);
    }}>
      {[
        ['name', t('Нэр', 'Name')], ['phone', t('Утас', 'Phone')], ['goal', t('Суралцах зорилго', 'Learning goal')],
      ].map(([field, label]) => <label key={field}>{label}<input required={field === 'name'} type={field === 'phone' ? 'tel' : 'text'} maxLength={field === 'goal' ? 300 : 100} value={profile[field]} onChange={(event) => { setProfile({ ...profile, [field]: event.target.value }); setSaved(false); setError(false); }} /></label>)}
      <button className="btn" type="submit">{t('Мэдээлэл хадгалах', 'Save profile')}</button>
      <p role="status">{saved ? t('✓ Мэдээлэл хадгалагдлаа.', '✓ Profile saved.') : ''}</p>
      {error && <p className="account-error" role="alert">{remote ? t('Мэдээллийг ачаалж эсвэл хадгалж чадсангүй. Дахин оролдоно уу.', 'Could not load or save your profile. Please try again.') : t('Хадгалж чадсангүй. Хөтчийн хадгалах зөвшөөрлийг шалгана уу.', 'Could not save. Check browser storage permissions.')}</p>}
    </form>
    <button className="text-link account-help" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{t('Хэрхэн ашиглах вэ?', 'How does it work?')}</button>
    {expanded && <p>{t('Миний сургалт табаар хичээлээ нээж, үзсэн хичээлээ тэмдэглээрэй. Дэлгүүрээс бүтээгдэхүүн нэмж захиалаад, Түүх табаас элсэлт болон захиалгын төлөвөө хараарай.', 'Open lessons from My learning and mark completed lessons. Add products in the Shop and check enrollment and order status in History.')}</p>}
  </section>;
}
