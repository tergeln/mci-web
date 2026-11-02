import { request } from './client';
import { activities } from '../data/activities';
import { serviceImages } from '../assets/siteImages';
const ids = ['presentation-website', 'business-website', 'ecommerce'];
export function getServices({ signal } = {}) {
  return request('/services', { signal, mock: () => activities.map((item, index) => ({ ...item, id: ids[index], image: serviceImages[item.number.split(' ')[0]] })) });
}
