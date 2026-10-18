import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import { readStorage, writeStorage } from '../../hooks/useLocalStorage';
import { courseLessons } from '../../data/lessons';
export default function AccountDetails({ onWatch }) {
  const { user } = useAuth();
  const { t } = useLang();
  const key = `mc-profile-${user.id}`;
  const [profile, setProfile] = useState(() => { try { return JSON.parse(readStorage(key, 'null')) || { name: user.name, phone: '', goal: '' }; } catch { return { name: user.name, phone: '', goal: '' }; } });
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);
  let completed = [];
  try { const value = JSON.parse(readStorage(`mc-lessons-v1-${user.id}`, '[]')); if (Array.isArray(value)) completed = courseLessons.filter((l) => value.includes(l.id)); } catch { /* empty progress */ }
  return <div className="account-columns"><section className="account-card account-section"><div className="eyebrow">03 · PROGRESS</div><h2>{t('Суралцах явц', 'Learning progress')}</h2><p>{completed.length} / {courseLessons.length} {t('хичээл дууссан', 'lessons completed')} · {Math.round(completed.length / courseLessons.length * 100)}%</p><progress className="account-progress" value={completed.length} max={courseLessons.length} aria-label={t('Хичээлийн явц', 'Lesson progress')} />{courseLessons.map((l, i) => <div className="account-row" key={l.id}><span>{completed.some((c) => c.id === l.id) ? '✓' : String(i + 1).padStart(2, '0')} · {t(l.mn, l.en)}</span></div>)}<button className="btn" onClick={onWatch}>{t('Үргэлжлүүлэн сурах →', 'Continue learning →')}</button></section>
    <section className="account-card account-section"><div className="eyebrow">04 · PROFILE</div><h2>{t('Миний мэдээлэл', 'My profile')}</h2><p>{user.email}</p><form onSubmit={(e) => { e.preventDefault(); writeStorage(key, JSON.stringify(profile)); setSaved(true); }}>{[['name', t('Нэр', 'Name')], ['phone', t('Утас', 'Phone')], ['goal', t('Суралцах зорилго', 'Learning goal')]].map(([field, label]) => <label key={field}>{label}<input required={field === 'name'} type={field === 'phone' ? 'tel' : 'text'} maxLength={field === 'goal' ? 300 : 100} value={profile[field]} onChange={(e) => { setProfile({ ...profile, [field]: e.target.value }); setSaved(false); }} /></label>)}<button className="btn" type="submit">{t('Мэдээлэл хадгалах', 'Save profile')}</button><p role="status">{saved ? t('✓ Мэдээлэл хадгалагдлаа.', '✓ Profile saved.') : ''}</p></form><button className="text-link account-help" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{t('Хэрхэн ашиглах вэ?', 'How does it work?')}</button>{expanded && <p>{t('Хичээл үзэх товчоор сургалтаа нээж, үзсэн хичээлээ тэмдэглээрэй. Demo дэлгүүрээс бүтээгдэхүүн нэмж, тоо ширхгийг тохируулаад захиална. Бүртгэл болон захиалгын төлөвийг доорх түүхээс харна.', 'Open lessons and mark completed lessons to track progress. Add products in the demo shop, adjust quantities, and place an order. Check your enrollment and order status in the history below.')}</p>}</section></div>;
}
