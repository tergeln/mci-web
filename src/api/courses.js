import { request } from './client';
import { notFound } from './mock/db';
import { contentStore } from './managedContent';

/** GET /api/courses?category=Data — бүх курс (category заавал биш). */
export function getCourses({ category, signal } = {}) {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  return request(`/courses${query}`, {
    signal,
    mock: () => contentStore.list('courses').filter((course) => !category || course.category === category),
  });
}

/** GET /api/courses/:id */
export function getCourse(id, { signal } = {}) {
  return request(`/courses/${encodeURIComponent(id)}`, {
    signal,
    mock: () => {
      const course = contentStore.list('courses').find((c) => c.id === id);
      if (!course) throw notFound('Course');
      return course;
    },
  });
}
