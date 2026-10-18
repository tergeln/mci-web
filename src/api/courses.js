import { request } from './client';
import { courses, notFound } from './mock/db';

/** GET /api/courses?category=Data — бүх курс (category заавал биш). */
export function getCourses({ category, signal } = {}) {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  return request(`/courses${query}`, {
    signal,
    mock: () => (category ? courses.filter((c) => c.category === category) : courses),
  });
}

/** GET /api/courses/:id */
export function getCourse(id, { signal } = {}) {
  return request(`/courses/${encodeURIComponent(id)}`, {
    signal,
    mock: () => {
      const course = courses.find((c) => c.id === id);
      if (!course) throw notFound('Course');
      return course;
    },
  });
}
