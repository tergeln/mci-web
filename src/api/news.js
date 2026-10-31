import { request } from './client';
import { notFound } from './mock/db';
import { contentStore } from './managedContent';

const summary = ({ id, number, category, title, summary: text, publishedAt, isSample, coverImage }) => ({
  id, number, category, title, summary: text, publishedAt, isSample, coverImage,
});

/** GET /api/news?limit=3 — мэдээний жагсаалт (дэлгэрэнгүйгүй). */
export function getNews({ limit, signal } = {}) {
  const query = limit ? `?limit=${limit}` : '';
  return request(`/news${query}`, {
    signal,
    mock: () => { const rows = contentStore.list('news'); return rows.slice(0, limit ?? rows.length).map(summary); },
  });
}

/** GET /api/news/:id — нэг мэдээ, details болон body-той. */
export function getNewsItem(id, { signal } = {}) {
  return request(`/news/${encodeURIComponent(id)}`, {
    signal,
    mock: () => {
      const item = contentStore.list('news').find((n) => n.id === id);
      if (!item) throw notFound('News item');
      return item;
    },
  });
}
