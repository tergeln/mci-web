import { useId, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { demoUsers, useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import ApiState from '../../components/ApiState/ApiState';
import useApi from '../../hooks/useApi';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { getCourses } from '../../api/courses';
import { getNews } from '../../api/news';
import { enrollmentAnalytics } from './adminAnalytics';
import './admin.css';

const localized = (value, lang) => typeof value === 'string' ? value : value?.[lang] || value?.mn || value?.en || '—';
const COURSE_STATUS = {
  open: ['Бүртгэл нээлттэй', 'Enrollment open'],
  waitlist: ['Хүлээлгийн жагсаалт', 'Waitlist'],
  planned: ['Төлөвлөсөн', 'Planned'],
};

function EnrollmentChart({ timeline, locale, t }) {
  const gradient = useId();
  const ceiling = Math.max(4, Math.ceil(Math.max(...timeline.map((bucket) => bucket.count)) / 4) * 4);
  const step = 564 / timeline.length;
  const date = (value) => value.toLocaleDateString(locale, { month: 'numeric', day: 'numeric' });
  const label = (bucket) => date(bucket.from) === date(bucket.last) ? date(bucket.from) : `${date(bucket.from)}–${date(bucket.last)}`;
  const total = timeline.reduce((sum, bucket) => sum + bucket.count, 0);
  return <>
    <div className="admin-trend-scroll"><svg className="admin-trend" viewBox="0 0 640 246" role="img" aria-label={t(`Элсэлтийн баганан график. Нийт ${total} бүртгэл.`, `Enrollment bar chart. ${total} records in total.`)}>
      <defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop stopColor="var(--admin-accent)" /><stop offset="1" stopColor="var(--admin-accent-soft)" /></linearGradient></defs>
      {[0, 1, 2, 3, 4].map((tick) => <g key={tick}>
        <line x1="44" x2="620" y1={196 - tick * 40} y2={196 - tick * 40} className="admin-gridline" />
        <text x="30" y={201 - tick * 40} textAnchor="end">{ceiling * tick / 4}</text>
      </g>)}
      {timeline.map((bucket, index) => {
        const height = bucket.count / ceiling * 160;
        const x = 50 + index * step;
        return <g key={bucket.from.toISOString()}>
          <rect x={x + step * .18} y={196 - height} width={step * .64} height={height} rx="5" fill={`url(#${gradient})`}>
            <title>{label(bucket)}: {bucket.count}</title>
          </rect>
          {bucket.count > 0 && <text x={x + step / 2} y={188 - height} textAnchor="middle" className="admin-bar-value">{bucket.count}</text>}
          <text x={x + step / 2} y="222" textAnchor="middle">{label(bucket)}</text>
        </g>;
      })}
    </svg></div>
    {total === 0 && <p className="admin-empty-inline">{t('Энэ хугацаанд сургалтын бүртгэл үүсээгүй байна.', 'No enrollments in this period yet.')}</p>}
    <details className="admin-chart-data"><summary>{t('Тоон мэдээлэл харах', 'View chart data')}</summary>
      <dl>{timeline.map((bucket) => <div key={bucket.from.toISOString()}><dt>{label(bucket)}</dt><dd>{bucket.count}</dd></div>)}</dl>
    </details>
  </>;
}

function AdminWorkspace() {
  const { records, updateStatus, logout } = useAuth();
  const { lang, t } = useLang();
  const [days, setDays] = useState(30);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [notice, setNotice] = useState('');
  const courseApi = useApi((signal) => getCourses({ signal }), []);
  const newsApi = useApi((signal) => getNews({ signal }), []);
  const courses = courseApi.data || [];
  const news = newsApi.data || [];
  const locale = lang === 'mn' ? 'mn-MN' : 'en-US';
  const analytics = enrollmentAnalytics(records, courses, days);
  const categories = [...new Set(courses.map((course) => course.category))];
  const categoryCounts = categories.map((name) => ({ name, count: courses.filter((course) => course.category === name).length }));
  const categoryMax = Math.max(1, ...categoryCounts.map((item) => item.count));
  const filteredCourses = courses.filter((course) => category === 'all' || course.category === category);
  const filteredRecords = analytics.selected.filter((record) => {
    const person = demoUsers.find((candidate) => candidate.id === record.userId);
    return (status === 'all' || record.status === status) &&
      `${record.id} ${record.items.join(' ')} ${person?.name || ''} ${person?.email || ''}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const metrics = [
    { label: t('Нийт сургалт', 'Total courses'), value: courseApi.data ? courses.length : '—', detail: t('Сургалтын каталогоос', 'From the course catalog'), icon: 'courses' },
    { label: t('Сургалтын бүртгэл', 'Enrollments'), value: analytics.selected.length, detail: t(`Сүүлийн ${days} хоногт`, `In the last ${days} days`), icon: 'enrollments' },
    { label: t('Суралцагч', 'Learners'), value: analytics.learners, detail: t('Давхардалгүй бүртгэл', 'Unique enrolled accounts'), icon: 'learners' },
    { label: t('Шинэ хүсэлт', 'Pending requests'), value: analytics.pending, detail: t('Шалгах шаардлагатай', 'Awaiting review'), icon: 'pending' },
  ];
  return <>

    <main className="account-page admin-page wrap">
      <div className="admin-heading">
        <div><div className="eyebrow">MAGIC CODE · ADMIN</div><h1>{t('Удирдлагын самбар', 'Admin dashboard')}</h1><p>{t('Сургалт, элсэлт, мэдээллээ нэг дороос хянаарай.', 'Monitor courses, enrollments and content in one place.')}</p></div>
        <button className="btn secondary" onClick={logout}>{t('Гарах', 'Log out')} ↗</button>
      </div>
      <div className="admin-toolbar">
        <nav className="admin-sections" aria-label={t('Удирдлагын хэсгүүд', 'Dashboard sections')}>
          <a href="#admin-overview">{t('Тойм', 'Overview')}</a><a href="#admin-courses">{t('Сургалтууд', 'Courses')}</a><a href="#admin-enrollments">{t('Элсэлтүүд', 'Enrollments')}</a><a href="#admin-news">{t('Мэдээлэл', 'Content')}</a>
        </nav>
        <label className="admin-period">{t('Хугацаа', 'Period')}<select value={days} onChange={(event) => setDays(Number(event.target.value))}>
          {[7, 30, 90].map((value) => <option value={value} key={value}>{t(`Сүүлийн ${value} хоног`, `Last ${value} days`)}</option>)}
        </select></label>
      </div>
      <div className="admin-demo-note"><span className="admin-note-dot" /><p>{t('Demo тойм · Элсэлтийн тоо энэ хөтөч дээрх бүртгэлээс тооцогдоно. Бодит төлбөрийн мэдээлэл холбогдоогүй.', 'Demo overview · Enrollment statistics come from records in this browser. Live payment data is not connected.')}</p></div>

      <section id="admin-overview" className="admin-overview-section" aria-label={t('Үндсэн үзүүлэлтүүд', 'Key metrics')}>
        <div className="admin-metrics">{metrics.map((metric, index) => <div className="account-card admin-metric" key={metric.icon}>
          <div className="admin-metric-top"><span>{metric.label}</span><span className={`admin-metric-icon admin-metric-icon--${index}`} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{index === 0 ? <><path d="M4 5h6a3 3 0 0 1 3 3v12a4 4 0 0 0-4-2H4zM20 5h-4a3 3 0 0 0-3 3M20 5v13h-3" /></> : index === 1 ? <><rect x="5" y="5" width="14" height="16" rx="2" /><path d="M9 3v4m6-4v4M9 12h6m-6 4h4" /></> : index === 2 ? <><circle cx="9" cy="8" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2m1-15a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v2" /></> : <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>}</svg></span></div>
          <strong>{metric.value}</strong><small>{metric.detail}</small>
        </div>)}</div>
        <div className="admin-charts">
          <section className="account-card admin-chart-card"><div className="admin-card-heading"><div><h2>{t('Элсэлтийн идэвх', 'Enrollment activity')}</h2><p>{t(`Сүүлийн ${days} хоногийн сургалтын бүртгэл`, `Course enrollments over the last ${days} days`)}</p></div><span className="admin-chart-total">{analytics.selected.length}<small>{t('бүртгэл', 'enrollments')}</small></span></div>
            <EnrollmentChart timeline={analytics.timeline} locale={locale} t={t} />
          </section>
          <section className="account-card admin-chart-card"><div className="admin-card-heading"><div><h2>{t('Сургалтын чиглэлүүд', 'Course categories')}</h2><p>{t('Каталог дахь сургалтын тоо', 'Number of courses in the catalog')}</p></div></div>
            <ApiState loading={courseApi.loading} error={courseApi.error} onRetry={courseApi.reload} />
            {courseApi.data && <div className="admin-category-bars">{categoryCounts.map((item, index) => <div className="admin-category-row" key={item.name}>
              <div><span>{item.name}</span><strong>{item.count}</strong></div><div className="admin-bar-track"><span className={`admin-category-fill admin-category-fill--${index % 4}`} style={{ width: `${item.count / categoryMax * 100}%` }} /></div>
            </div>)}{!courses.length && <p className="admin-empty-inline">{t('Сургалт бүртгэгдээгүй байна.', 'No courses in the catalog yet.')}</p>}</div>}
            {courseApi.data && <div className="admin-catalog-summary"><span><i />{t('Нээлттэй', 'Open')} <strong>{courses.filter((course) => course.status === 'open').length}</strong></span><span><i />{t('Хүлээлт / төлөвлөгөө', 'Waitlist / planned')} <strong>{courses.filter((course) => ['waitlist', 'planned'].includes(course.status)).length}</strong></span></div>}
          </section>
        </div>
      </section>

      <section id="admin-courses" className="account-card admin-panel">
        <div className="admin-card-heading"><div><h2>{t('Сургалтуудын тойм', 'Course overview')}</h2><p>{t('Төлөв болон сонгосон хугацааны элсэлтийг харьцуулах', 'Compare course status and enrollments in the selected period')}</p></div><label className="admin-category-filter"><span className="admin-sr-only">{t('Сургалтын чиглэл', 'Course category')}</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">{t('Бүх чиглэл', 'All categories')}</option>{categories.map((name) => <option key={name}>{name}</option>)}</select></label></div>
        <ApiState loading={courseApi.loading} error={courseApi.error} onRetry={courseApi.reload} />
        {courseApi.data && <div className="admin-table-scroll"><table className="admin-table"><caption className="admin-sr-only">{t('Сургалт, төлөв болон элсэлтийн тоо', 'Courses, status and enrollment counts')}</caption><thead><tr><th scope="col">{t('Сургалтын нэр', 'Course')}</th><th scope="col">{t('Чиглэл', 'Category')}</th><th scope="col">{t('Төлөв', 'Status')}</th><th scope="col">{t('Элсэлт', 'Enrollments')}</th></tr></thead><tbody>{filteredCourses.map((course) => {
          const count = analytics.courseCounts.find((item) => item.id === course.id)?.count || 0;
          const courseStatus = COURSE_STATUS[course.status];
          return <tr key={course.id}><th scope="row">{localized(course.title, lang)}</th><td><span className="admin-category-tag">{course.category}</span></td><td><span className={`admin-status admin-status--${course.status === 'open' ? 'open' : 'planned'}`}>{courseStatus ? t(...courseStatus) : course.status}</span></td><td><div className="admin-course-count"><strong>{count}</strong><span><i style={{ width: `${count / Math.max(1, analytics.selected.length) * 100}%` }} /></span></div></td></tr>;
        })}</tbody></table>{!filteredCourses.length && <p className="admin-empty-inline">{t('Энэ чиглэлд сургалт алга.', 'No courses in this category.')}</p>}</div>}
      </section>

      <section id="admin-enrollments" className="account-card admin-panel">
        <div className="admin-card-heading"><div><h2>{t('Элсэлтийн хүсэлтүүд', 'Enrollment requests')}</h2><p>{t('Хүсэлтүүдээ шалгаж, төлөвийг шинэчлээрэй.', 'Review enrollment requests and update their status.')}</p></div><span className="admin-result-count">{filteredRecords.length} {t('бүртгэл', 'records')}</span></div>
        <div className="admin-record-filters"><label>{t('Хайх', 'Search')}<input type="search" placeholder={t('Сургалт, нэр, имэйл…', 'Course, name, email…')} value={query} onChange={(event) => setQuery(event.target.value)} /></label><label>{t('Төлөв', 'Status')}<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">{t('Бүх төлөв', 'All statuses')}</option><option value="new">{t('Шинэ', 'New')}</option><option value="done">{t('Шийдвэрлэсэн', 'Completed')}</option></select></label></div>
        <p role="status" className="admin-feedback">{notice}</p>
        {filteredRecords.length ? <div className="admin-table-scroll"><table className="admin-table"><caption className="admin-sr-only">{t('Сургалтын хүсэлтүүд', 'Course enrollment requests')}</caption><thead><tr><th scope="col">{t('Суралцагч', 'Learner')}</th><th scope="col">{t('Сургалт', 'Course')}</th><th scope="col">{t('Огноо', 'Date')}</th><th scope="col">{t('Төлөв', 'Status')}</th></tr></thead><tbody>{filteredRecords.map((record) => {
          const person = demoUsers.find((candidate) => candidate.id === record.userId);
          return <tr key={record.id}><th scope="row">{person?.name || record.userId}<small>{person?.email || `#${record.id.slice(0, 8)}`}</small></th><td>{[...new Set(record.items)].join(', ')}</td><td className="admin-date">{new Date(record.createdAt).toLocaleDateString(locale)}</td><td><select aria-label={t(`${person?.name || record.userId} — хүсэлтийн төлөв`, `${person?.name || record.userId} — request status`)} value={record.status} onChange={(event) => { updateStatus(record.id, event.target.value); setNotice(t('Хүсэлтийн төлөв шинэчлэгдлээ.', 'Request status updated.')); }}><option value="new">{t('Шинэ', 'New')}</option><option value="done">{t('Шийдвэрлэсэн', 'Completed')}</option></select></td></tr>;
        })}</tbody></table></div> : <div className="admin-empty"><span aria-hidden="true">↗</span><h3>{t('Элсэлтийн хүсэлт алга', 'No enrollment requests')}</h3><p>{query || status !== 'all' ? t('Хайлтын үг эсвэл төлөвийн шүүлтүүрээ өөрчлөөрэй.', 'Try another search or status filter.') : t('Сонгосон хугацаанд хүсэлт бүртгэгдээгүй байна. Шинэ demo элсэлт энд харагдана.', 'No requests in the selected period. New demo enrollments will appear here.')}</p></div>}
      </section>

      <section id="admin-news" className="account-card admin-panel">
        <div className="admin-card-heading"><div><h2>{t('Мэдээ, мэдээлэл', 'News & content')}</h2><p>{t('Сайт дээр харагдаж буй мэдээллийн жагсаалт', 'Content currently available on the website')}</p></div><Link className="text-link" to="/news">{t('Мэдээ харах ↗', 'View news ↗')}</Link></div>
        <ApiState loading={newsApi.loading} error={newsApi.error} onRetry={newsApi.reload} />
        {newsApi.data && <div className="admin-news-list">{news.map((item) => <Link className="admin-news-item" to={`/news/${encodeURIComponent(item.id)}`} key={item.id}><span className="admin-news-symbol" aria-hidden="true">↗</span><div><small>{localized(item.category, lang)}</small><h3>{localized(item.title, lang)}</h3></div><span className="admin-news-date">{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString(locale) : item.isSample === false ? t('Огноо нэмэгдээгүй', 'Date not provided') : t('Жишээ мэдээ', 'Sample content')}</span></Link>)}{!news.length && <p className="admin-empty-inline">{t('Мэдээ бүртгэгдээгүй байна.', 'No news available yet.')}</p>}</div>}
      </section>
    </main>
  </>;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useLang();
  const location = useLocation();
  useDocumentTitle(t('Удирдлагын самбар — Magic Code AI', 'Admin dashboard — Magic Code AI'));
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (user.role !== 'admin') return <Navigate to="/account" replace />;
  return <AdminWorkspace />;
}
