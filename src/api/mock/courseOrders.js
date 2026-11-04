import { isActiveCourse } from '../../data/courseAccess.js';
const KEY = 'mc-course-orders-v1';
export function createOrderStore({ storage, id = () => crypto.randomUUID(), now = () => new Date().toISOString() }) {
  const fail = (code) => { throw Object.assign(new Error(code), { code }); };
  function all() {
    const raw = storage.getItem(KEY);
    if (!raw) return [];
    let rows;
    try { rows = JSON.parse(raw); } catch { fail('corrupt_storage'); }
    if (!Array.isArray(rows)) fail('corrupt_storage');
    return rows;
  }
  function save(rows) { storage.setItem(KEY, JSON.stringify(rows)); }
  function entitlements(userId) {
    if (!userId) fail('unauthorized');
    return all().filter((order) => order.userId === userId && order.status === 'paid').flatMap((order) => order.items.map((item) => ({ courseId: item.courseId, status: 'active', paymentStatus: 'paid', activatedAt: order.paidAt, expiresAt: order.expiresAt })));
  }
  return {
    entitlements,
    list(userId, catalog = []) {
      if (!userId) fail('unauthorized');
      const rows = all(); let changed = false;
      for (const order of rows.filter((item) => item.userId === userId && item.status === 'awaiting_quote')) {
        const items = order.items.map((item) => { const course = catalog.find((entry) => entry.id === item.courseId); return course ? { ...item, price: course.price } : item; });
        if (items.every((item) => Number.isFinite(item.price) && item.price > 0)) { order.items = items; order.amount = items.reduce((sum, item) => sum + item.price, 0); order.status = 'pending_payment'; changed = true; }
      }
      if (changed) save(rows);
      return rows.filter((order) => order.userId === userId);
    },
    create(userId, courseIds, catalog) {
      if (!userId) fail('unauthorized');
      const ids = [...new Set(courseIds)];
      if (!ids.length || ids.some((key) => !catalog.some((course) => course.id === key))) fail('invalid_courses');
      const rows = all();
      const activeIds = activeCourseIds({ id: userId }, entitlements(userId), Date.parse(now()));
      const paidIds = rows.filter((order) => order.userId === userId && order.status === 'paid' && isActiveCourse({ status: 'active', paymentStatus: 'paid', paidAt: order.paidAt, expiresAt: order.expiresAt }, Date.parse(now()))).flatMap((order) => order.items.map((item) => item.courseId));
      if (ids.some((key) => activeIds.includes(key) || paidIds.includes(key))) fail('already_owned');
      const existing = rows.find((order) => order.userId === userId && ['awaiting_quote', 'pending_payment', 'pending_review'].includes(order.status) && order.items.map((item) => item.courseId).sort().join('|') === [...ids].sort().join('|'));
      if (existing) {
        if (existing.status === 'awaiting_quote') {
          existing.items = ids.map((key) => { const course = catalog.find((item) => item.id === key); return { courseId: key, title: course.title, price: course.price }; });
          if (existing.items.every((item) => Number.isFinite(item.price) && item.price > 0)) {
            existing.amount = existing.items.reduce((sum, item) => sum + item.price, 0); existing.status = 'pending_payment'; save(rows);
          }
        }
        return existing;
      }
      if (rows.some((order) => order.userId === userId && ['pending_payment', 'pending_review', 'awaiting_quote'].includes(order.status) && order.items.some((item) => ids.includes(item.courseId)))) fail('already_ordered');
      const items = ids.map((key) => { const course = catalog.find((item) => item.id === key); return { courseId: key, title: course.title, price: course.price }; });
      const quoted = items.every((item) => Number.isFinite(item.price) && item.price > 0);
      const order = { id: id(), userId, items, amount: quoted ? items.reduce((sum, item) => sum + item.price, 0) : null, currency: 'MNT', status: quoted ? 'pending_payment' : 'awaiting_quote', createdAt: now() };
      save([order, ...rows]); return order;
    },
    reportTransfer(userId, orderId) {
      if (!userId) fail('unauthorized');
      const rows = all();
      const order = rows.find((item) => item.id === orderId && item.userId === userId);
      if (!order) fail('not_found');
      if (!['pending_payment', 'pending_review'].includes(order.status)) fail('payment_not_ready');
      order.status = 'pending_review'; order.reportedAt = now(); save(rows); return order;
    },
  };
}

export function activeCourseIds(user, enrollments, now = Date.now()) {
  if (!user) return [];
  return [...new Set(enrollments.filter((item) => isActiveCourse(item, now)).map((item) => item.courseId))];
}
