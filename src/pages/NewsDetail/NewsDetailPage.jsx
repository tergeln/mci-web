import { useRef, useState } from 'react';
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
            {story.coverImage || story.gallery?.length ? <StoryGallery key={story.id} images={[story.coverImage, ...(story.gallery ?? [])].filter(Boolean)} /> : <div className="story-art" aria-hidden="true">{story.number}</div>}
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
            <Link className="btn secondary" to="/news">{t('Бүх мэдээ рүү буцах', 'Back to all stories')}</Link>
          </>
        )}
      </main>
    </>
  );
}

function StoryGallery({ images }) {
  const { t } = useLang();
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const multiple = images.length > 1;
  const goTo = (index) => {
    const track = trackRef.current;
    if (!track) return;
    const next = Math.max(0, Math.min(images.length - 1, index));
    track.scrollTo({ left: next * track.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };

  return <section className="story-carousel" aria-label={t('Мэдээний зургууд', 'Story photos')} aria-roledescription={t('Зургийн цомог', 'Carousel')}>
    <div className="story-carousel-frame">
      <div className="story-carousel-track" ref={trackRef} tabIndex={multiple ? 0 : undefined}
        aria-label={t('Зургуудыг хажуу тийш гүйлгэж үзээрэй', 'Swipe horizontally to browse photos')}
        onScroll={(event) => {
          const track = event.currentTarget;
          setActive(Math.round(track.scrollLeft / track.clientWidth));
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            goTo(active + (event.key === 'ArrowRight' ? 1 : -1));
          }
        }}>
        {images.map((image, index) => <figure className="story-carousel-slide" key={image.src} role="group" aria-roledescription={t('Зураг', 'Slide')} aria-label={`${index + 1} / ${images.length}`}>
          <ContentImage className="story-carousel-backdrop" image={image} sizes="(max-width: 640px) calc(100vw - 40px), 640px" loading={index === 0 ? 'eager' : 'lazy'} decorative />
          <ContentImage className="story-carousel-photo" image={image} sizes="(max-width: 640px) calc(100vw - 40px), 640px" loading={index === 0 ? 'eager' : 'lazy'} />
        </figure>)}
      </div>
      {multiple && <>
        <span className="story-carousel-count" aria-live="polite" aria-atomic="true">{active + 1} / {images.length}</span>
        <button className="story-carousel-arrow story-carousel-prev" type="button" disabled={active === 0} onClick={() => goTo(active - 1)} aria-label={t('Өмнөх зураг', 'Previous photo')}>‹</button>
        <button className="story-carousel-arrow story-carousel-next" type="button" disabled={active === images.length - 1} onClick={() => goTo(active + 1)} aria-label={t('Дараах зураг', 'Next photo')}>›</button>
      </>}
    </div>
    {multiple && <div className="story-carousel-dots" aria-label={t('Зураг сонгох', 'Choose photo')}>
      {images.map((image, index) => <button key={image.src} type="button" aria-label={t(`${index + 1}-р зураг`, `Photo ${index + 1}`)} aria-current={active === index ? 'true' : undefined} onClick={() => goTo(index)}><span /></button>)}
    </div>}
  </section>;
}

function DetailRow({ label, value }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}
