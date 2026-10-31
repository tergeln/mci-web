import { useRef, useState } from 'react';
import Tr from '../../components/Tr/Tr';
import ApiState from '../../components/ApiState/ApiState';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import useApi from '../../hooks/useApi';
import { getCourses } from '../../api/courses';
import { catalogFilters } from '../../data/catalog';
import { courseButtonLabel } from '../../data/courses';
import './courses.css';
import ContentImage from '../../components/ContentImage/ContentImage';
import { useLang } from '../../context/LanguageContext';
import EnrollDialog from '../../components/dialogs/EnrollDialog';
import ClassroomDialog from '../../components/dialogs/ClassroomDialog';

const ART_TEXT = ['{ }', 'SQL', '✧'];

export default function CoursesPage() {
  const { t } = useLang();
  const [enrollRequest, setEnrollRequest] = useState(null);
  const [classroomRequest, setClassroomRequest] = useState(null);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const searchRef = useRef(null);
  const { data: courses, loading, error, reload } = useApi((signal) => getCourses({ signal }), []);
  useDocumentTitle(t('Бүх сургалтууд — Magic Code AI', 'Explore courses — Magic Code AI'));
  const terms = query.normalize('NFKC').trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const results = courses?.filter((course) => {
    if (filter !== 'all' && course.category !== filter) return false;
    const category = catalogFilters.find((item) => item.key === course.category);
    const searchable = [course.title.mn, course.title.en, course.description.mn, course.description.en, course.category, category?.mn, category?.en].join(' ').normalize('NFKC').toLocaleLowerCase();
    return terms.every((term) => searchable.includes(term));
  });
  const resetFilters = () => { setQuery(''); setFilter('all'); searchRef.current?.focus(); };

  return (
    <>
      <main className="catalog-page wrap">
        <div className="eyebrow"><Tr mn="СУРАЛЦАХ ЗАМАА СОНГО" en="CHOOSE YOUR PATH" /></div>
        <div className="catalog-search">
          <label htmlFor="course-search">{t('Сургалт хайх', 'Search courses')}</label>
          <div className="catalog-search-field">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
            <input id="course-search" ref={searchRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('Сургалтын нэр, сэдэв, чиглэлээр хайх…', 'Search by course name, topic or category…')} aria-controls="catalog-results" aria-describedby="catalog-result-count" />
            {query && <button type="button" aria-label={t('Хайлтыг цэвэрлэх', 'Clear search')} onClick={() => { setQuery(''); searchRef.current?.focus(); }}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button>}
          </div>
        </div>
        <div className="catalog-filters" aria-label={t('Сургалтын чиглэлүүд', 'Course categories')}>
          {catalogFilters.map((f) => (
            <button key={f.key} type="button" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
              <Tr text={f} />
            </button>
          ))}
        </div>
        <ApiState loading={loading} error={error} onRetry={reload} />
        <p id="catalog-result-count" className="catalog-result-count" role="status">{results && !loading && !error ? t(`${results.length} сургалт олдлоо`, `${results.length} courses found`) : ''}</p>
        {results && !loading && !error && (
          <div id="catalog-results" className="catalog-grid">
            {results.map((c, i) => (
              <article key={c.id} className="catalog-card">
                <div className={`catalog-art catalog-art-${i % 3}${c.image ? ' catalog-art--image' : ''}${c.image?.slide ? ' catalog-art--slide' : ''}`} aria-hidden={c.image ? undefined : true}>
                  {c.image ? <ContentImage image={c.image} sizes="(max-width: 640px) calc(100vw - 40px), (max-width: 900px) 45vw, 370px" /> : ART_TEXT[i % 3]}
                </div>
                <div className="catalog-body">
                  <h3><Tr text={c.title} /></h3>
                  <p><Tr text={c.description} /></p>
                  <button className="btn" type="button" onClick={() => setEnrollRequest((previous) => ({ course: { ...c, open: c.status === 'open' }, id: (previous?.id ?? 0) + 1 }))}>
                    <Tr text={courseButtonLabel} />
                  </button>
                </div>
              </article>
            ))}
            {!results.length && <div className="catalog-empty">
              <h2>{t('Сургалт олдсонгүй', 'No courses found')}</h2>
              <p>{t('Өөр үгээр хайх эсвэл чиглэлийн шүүлтүүрээ өөрчлөөрэй.', 'Try another search term or change the category filter.')}</p>
              <button className="btn secondary" type="button" onClick={resetFilters}>{t('Бүх сургалт харах', 'Show all courses')}</button>
            </div>}
          </div>
        )}
      </main>
      <EnrollDialog request={enrollRequest} onOpenClassroom={() => setClassroomRequest((previous) => ({ id: (previous?.id ?? 0) + 1 }))} />
      <ClassroomDialog request={classroomRequest} />
    </>
  );
}
