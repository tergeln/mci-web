import { request } from './client';
import { news, notFound } from './mock/db';

const summary = ({ id, number, category, title, summary: text, publishedAt }) => ({
  id, number, category, title, summary: text, publishedAt,
});

/** GET /api/news?limit=3 — мэдээний жагсаалт (дэлгэрэнгүйгүй). */
export function getNews({ limit, signal } = {}) {
  const query = limit ? `?limit=${limit}` : '';
  return request(`/news${query}`, {
    signal,
    mock: () => news.slice(0, limit ?? news.length).map(summary),
  });
}

/** GET /api/news/:id — нэг мэдээ, details болон body-той. */
export function getNewsItem(id, { signal } = {}) {
  return request(`/news/${encodeURIComponent(id)}`, {
    signal,
    mock: () => {
      const item = news.find((n) => n.id === id);
      if (!item) throw notFound('News item');
      return item;
    },
  });
}
