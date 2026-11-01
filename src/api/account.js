import { request } from './client';

// Эдгээр endpoint нэвтэрсэн хэрэглэгчийн token шаарддаг тул зөвхөн Supabase нэвтрэлттэй үед дуудна.
const unavailable = () => { throw new Error('Account API requires a backend'); };

/** GET /api/account/me */
export const getProfile = ({ signal } = {}) => request('/account/me', { signal, mock: unavailable });

/** PUT /api/account/me */
export const updateProfile = (profile) => request('/account/me', { method: 'PUT', body: profile, mock: unavailable });

/** GET /api/account/records — өөрийн элсэлт, захиалгууд. */
export const getRecords = ({ signal } = {}) => request('/account/records', { signal, mock: unavailable });

/** POST /api/account/records — бүтээгдэхүүний захиалга. */
export const createOrder = (items) => request('/account/records', { method: 'POST', body: { type: 'order', items }, mock: unavailable });
