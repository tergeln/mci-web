import { ApiError, request } from './client';
import { getLearningCourse } from '../data/lessons';
import { isActiveCourse } from '../data/courseAccess';
import { courses } from './mock/db';
import { createOrderStore } from './mock/courseOrders';

const orders = createOrderStore({ storage: {
  getItem: (key) => localStorage.getItem(key), setItem: (key, value) => localStorage.setItem(key, value),
} });

export function getMyOrders(userId) {
  return request('/me/orders', { mock: () => orders.list(userId, courses) });
}
export function createCourseOrder({ userId, courseIds }) {
  return request('/orders', { method: 'POST', body: { courseIds }, mock: () => orders.create(userId, courseIds, courses) });
}
export function getMyCourses(userId) {
  return request('/me/courses', { mock: () => orders.entitlements(userId) });
}
export function getCourseLessons(courseId, userId) {
  return request(`/me/courses/${encodeURIComponent(courseId)}/lessons`, {
    mock: () => {
      if (userId && orders.entitlements(userId).some((item) => item.courseId === courseId && isActiveCourse(item))) return { lessons: getLearningCourse(courseId).lessons };
      throw new ApiError(403, 'payment_required', 'Payment confirmation is required');
    },
  });
}
export function reportBankTransfer(orderId, userId) {
  return request(`/orders/${encodeURIComponent(orderId)}/bank-transfer`, {
    method: 'POST', mock: () => orders.reportTransfer(userId, orderId),
  });
}
export function payWithWallet(orderId) {
  return request(`/orders/${encodeURIComponent(orderId)}/wallet`, {
    method: 'POST', mock: () => { throw new ApiError(503, 'wallet_unavailable', 'Wallet is unavailable in demo mode'); },
  });
}
export function getMyWallet() {
  return request('/me/wallet', {
    mock: () => ({ balance: 0, currency: 'MNT', transactions: [], topups: [], limits: { min: 1000, max: 5000000 }, bank: null }),
  });
}
export function createWalletTopup(amount) {
  return request('/me/wallet/topups', {
    method: 'POST', body: { amount }, mock: () => { throw new ApiError(503, 'wallet_unavailable', 'Wallet is unavailable in demo mode'); },
  });
}
export function checkQPay(orderId) {
  return request(`/orders/${encodeURIComponent(orderId)}/qpay/check`, {
    method: 'POST', mock: () => { throw new ApiError(503, 'qpay_unavailable', 'QPay is currently unavailable'); },
  });
}
export function startQPay(orderId) {
  return request(`/orders/${encodeURIComponent(orderId)}/qpay`, {
    method: 'POST', mock: () => { throw new ApiError(503, 'qpay_unavailable', 'QPay is currently unavailable'); },
  });
}
