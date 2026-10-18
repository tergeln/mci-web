import { useState } from 'react';
import { Link } from 'react-router-dom';
import SimpleNavbar from '../../components/SimpleNavbar/SimpleNavbar';
import Tr from '../../components/Tr/Tr';
import ApiState from '../../components/ApiState/ApiState';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import useApi from '../../hooks/useApi';
import { getCourses } from '../../api/courses';
import { catalogFilters } from '../../data/catalog';
import './courses.css';

// API-аас ирсэн status-ыг дэлгэцийн текст болгоно.
const STATUS = {
  open: { mn: 'Бүртгэл нээлттэй', en: 'Enrollment open' },
  waitlist: { mn: 'Удахгүй', en: 'Coming soon' },
  planned: { mn: 'Удахгүй', en: 'Coming soon' },
};
const CTA = {
  open: { mn: 'Сургалт авах', en: 'Take this course' },
  waitlist: { mn: 'Хүлээлгийн жагсаалт', en: 'Join waitlist' },
};
const PLANNED = { mn: 'Төлөвлөж буй чиглэл · Элсэлт нээгдээгүй', en: 'Planned track · Not open yet' };
const ART_TEXT = ['{ }', 'SQL', '✧'];

export default function CoursesPage() {
  const [filter, setFilter] = useState('all');
  const { data: courses, loading, error, reload } = useApi((signal) => getCourses({ signal }), []);
  useDocumentTitle('Бүх сургалтууд — Magic Code AI');

  return (
    <>
      <SimpleNavbar logoTo="/#courses" backTo="/#courses" back={{ mn: 'Сургалтууд', en: 'Courses' }} />
      <main className="catalog-page wrap">
        <div className="eyebrow"><Tr mn="СУРАЛЦАХ ЗАМАА СОНГО" en="CHOOSE YOUR PATH" /></div>
        <h1><Tr mn="Бүх сургалтууд" en="Explore courses" /></h1>
        <p className="catalog-intro">
          <Tr mn="Өөрийн зорилго, түвшинд тохирох чиглэлээ сонгоорой." en="Find a learning path for your goals and level." />
        </p>
        <div className="catalog-filters" aria-label="Course categories">
          {catalogFilters.map((f) => (
            <button key={f.key} type="button" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
              <Tr text={f} />
            </button>
          ))}
        </div>
        <ApiState loading={loading} error={error} onRetry={reload} />
        {courses && (
          <div className="catalog-grid">
            {courses.map((c, i) => (
              <article key={c.id} className="catalog-card" hidden={filter !== 'all' && c.category !== filter}>
                <div className={`catalog-art catalog-art-${i % 3}`} aria-hidden="true">{ART_TEXT[i % 3]}</div>
                <div className="catalog-body">
                  <small><Tr text={STATUS[c.status] ?? STATUS.waitlist} /></small>
                  <h3><Tr text={c.title} /></h3>
                  <p><Tr text={c.description} /></p>
                  {CTA[c.status] ? (
                    <Link className="btn" to={`/?course=${c.id}#courses`}><Tr text={CTA[c.status]} /></Link>
                  ) : (
                    <span className="planned-note"><Tr text={PLANNED} /></span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
