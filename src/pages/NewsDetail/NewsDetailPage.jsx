import { Link, useParams } from 'react-router-dom';
import ApiState from '../../components/ApiState/ApiState';
import { useLang } from '../../context/LanguageContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import useApi from '../../hooks/useApi';
import { getNewsItem } from '../../api/news';
import { USE_MOCK } from '../../api/client';
import './news-detail.css';
import ContentImage from '../../components/ContentImage/ContentImage';

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

  useDocumentTitle(story ? `${story.title[lang]} — Magic Code AI` : 'Бидний хийсэн ажлууд', 'Our Work');

  return (
    <>

      <main className={`story-page${story?.coverImage ? ' story-page--with-photos' : ''}`} id="story">
        {missing && t('Мэдээ олдсонгүй. Бүх мэдээ рүү буцна уу.', 'Story not found. Return to all stories.')}
        {!missing && <ApiState loading={loading} error={error} onRetry={reload} />}
        {story && !loading && (
          <>
            <small className="story-meta">{story.category[lang]}</small>
            <h1>{story.title[lang]}</h1>
            {USE_MOCK && story.isSample !== false && (
              <p className="sample-note">
                {t('Загварын жишээ · Энэ мэдээний бодит мэдээлэл хараахан ороогүй.', 'Sample story · Real details have not been added yet.')}
              </p>
            )}
            {story.coverImage ? <StoryPhoto image={story.coverImage} lang={lang} cover /> : <div className="story-art" aria-hidden="true">{story.number}</div>}
            <p>{story.summary[lang]}</p>
            <h2>{t('Ажлын тухай', 'About this initiative')}</h2>
            {(story.body?.[lang] ??
              t(
                'Энэ хэсэгт тухайн ажлын зорилго, хэрхэн зохион байгуулсан, хамтран оролцсон хүмүүсийн тухай дэлгэрэнгүй мэдээллийг нийтэлнэ.',
                'This section will describe the initiative’s purpose, how it was organised and the people involved.',
              )).split('\n\n').map((paragraph, i) => <p className="story-body" key={i}>{paragraph}</p>)}
            <dl>
              {detailRows.filter(([key]) => story.isSample !== false || story.details?.[key]?.[lang]).map(([key, mn, en]) => (
                <DetailRow
                  key={key}
                  label={t(mn, en)}
                  value={story.details?.[key]?.[lang] ?? t('Мэдээлэл нэмэгдэнэ', 'To be added')}
                />
              ))}
            </dl>
            {story.gallery?.length ? <>
              <h2>{t('Онцлох зургууд', 'Photo highlights')}</h2>
              <div className="story-gallery">{story.gallery.map((image) => <StoryPhoto key={image.src} image={image} lang={lang} />)}</div>
            </> : story.isSample !== false && <>
              <h2>{t('Үр дүн ба онцлох агшнууд', 'Results and highlights')}</h2>
              <p>{t('Бодит үр дүн, оролцогчдын сэтгэгдэл болон гэрэл зургуудыг энд нэмнэ.', 'Verified outcomes, participant reflections and photographs will appear here.')}</p>
            </>}
            <Link className="btn secondary" to="/news">{t('Бүх мэдээ рүү буцах', 'Back to all stories')}</Link>
          </>
        )}
      </main>
    </>
  );
}

function StoryPhoto({ image, lang, cover = false }) {
  return <figure className={`story-photo${cover ? ' story-cover' : ''}`}>
    <ContentImage image={image} sizes={cover ? '(max-width: 980px) calc(100vw - 40px), 932px' : '(max-width: 640px) calc(100vw - 40px), 454px'} loading={cover ? 'eager' : 'lazy'} />
    {image.caption?.[lang] && <figcaption>{image.caption[lang]}</figcaption>}
  </figure>;
}

function DetailRow({ label, value }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}
