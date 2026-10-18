import { Link, useParams } from 'react-router-dom';
import SimpleNavbar from '../../components/SimpleNavbar/SimpleNavbar';
import ApiState from '../../components/ApiState/ApiState';
import { useLang } from '../../context/LanguageContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import useApi from '../../hooks/useApi';
import { getNewsItem } from '../../api/news';
import { USE_MOCK } from '../../api/client';
import './news-detail.css';

const detailRows = [
  ['date', 'Огноо', 'Date'],
  ['location', 'Байршил', 'Location'],
  ['partners', 'Хамтрагчид', 'Partners'],
];

export default function NewsDetailPage() {
  const { id } = useParams();
  const { lang, t } = useLang();
  const { data: story, loading, error, reload } = useApi((signal) => getNewsItem(id, { signal }), [id]);
  const missing = error?.code === 'not_found';

  useDocumentTitle(story ? `${story.title[lang]} — Magic Code AI` : 'Бидний хийсэн ажлууд — Magic Code AI');

  return (
    <>
      <SimpleNavbar logoTo="/#about" backTo="/news" back={{ mn: 'Бүх мэдээ', en: 'All stories' }} />
      <main className="story-page" id="story">
        {missing && t('Мэдээ олдсонгүй. Бүх мэдээ рүү буцна уу.', 'Story not found. Return to all stories.')}
        {!missing && <ApiState loading={loading} error={error} onRetry={reload} />}
        {story && !loading && (
          <>
            <small className="story-meta">{story.category[lang]}</small>
            <h1>{story.title[lang]}</h1>
            {USE_MOCK && (
              <p className="sample-note">
                {t('Загварын жишээ · Энэ мэдээний бодит мэдээлэл хараахан ороогүй.', 'Sample story · Real details have not been added yet.')}
              </p>
            )}
            <div className="story-art" aria-hidden="true">{story.number}</div>
            <p>{story.summary[lang]}</p>
            <h2>{t('Ажлын тухай', 'About this initiative')}</h2>
            <p>
              {story.body?.[lang] ??
                t(
                  'Энэ хэсэгт тухайн ажлын зорилго, хэрхэн зохион байгуулсан, хамтран оролцсон хүмүүсийн тухай дэлгэрэнгүй мэдээллийг нийтэлнэ.',
                  'This section will describe the initiative’s purpose, how it was organised and the people involved.',
                )}
            </p>
            <dl>
              {detailRows.map(([key, mn, en]) => (
                <DetailRow
                  key={key}
                  label={t(mn, en)}
                  value={story.details?.[key]?.[lang] ?? t('Мэдээлэл нэмэгдэнэ', 'To be added')}
                />
              ))}
            </dl>
            <h2>{t('Үр дүн ба онцлох агшнууд', 'Results and highlights')}</h2>
            <p>
              {t(
                'Бодит үр дүн, оролцогчдын сэтгэгдэл болон гэрэл зургуудыг энд нэмнэ.',
                'Verified outcomes, participant reflections and photographs will appear here.',
              )}
            </p>
            <Link className="btn secondary" to="/news">{t('Бүх мэдээ рүү буцах', 'Back to all stories')}</Link>
          </>
        )}
      </main>
    </>
  );
}

function DetailRow({ label, value }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}
