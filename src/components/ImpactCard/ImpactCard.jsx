import { Link } from 'react-router-dom';
import Tr from '../Tr/Tr';

// `index` нь 0-ээс эхэлнэ. Зургийн өнгө impact-art-(index % 4). `to` өгвөл карт холбоос болно (/news хуудас).
export default function ImpactCard({ story, index, to }) {
  const content = (
    <>
      <div className={`impact-art impact-art-${index % 4}`} aria-hidden="true">
        <span>{story.number}</span>
        <i />
      </div>
      <div className="impact-card-body">
        <small><Tr text={story.category} /></small>
        <h3><Tr text={story.title} /></h3>
        <p><Tr text={story.summary} /></p>
      </div>
    </>
  );

  return (
    <article className="impact-card">
      {to ? (
        <Link className="news-card-link" to={to}>
          {content}
          <span className="news-read"><Tr mn="Дэлгэрэнгүй" en="Read story" /></span>
        </Link>
      ) : (
        content
      )}
    </article>
  );
}
