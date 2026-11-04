import test from 'node:test';
import assert from 'node:assert/strict';
import { createOrderStore, activeCourseIds } from './courseOrders.js';
function setup() {
  const values = new Map(); let n = 0;
  return createOrderStore({ storage: { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) }, id: () => `order-${++n}` });
}
const catalog = [{ id: 'python', title: { mn: 'Python', en: 'Python' }, price: 100 }, { id: 'sql', title: { mn: 'SQL', en: 'SQL' }, price: null }];
test('checkout requires authentication and rejects invalid or empty carts', () => {
  const store = setup();
  assert.throws(() => store.create(null, ['python'], catalog), /unauthorized/);
  assert.throws(() => store.create('a', [], catalog), /invalid_courses/);
  assert.throws(() => store.create('a', ['unknown'], catalog), /invalid_courses/);
});
test('server catalog prices, deduplication and idempotency preserve pending orders', () => {
  const store = setup();
  const order = store.create('a', ['python', 'python'], catalog);
  assert.equal(order.amount, 100);
  assert.equal(order.status, 'pending_payment');
  assert.equal(store.create('a', ['python'], catalog).id, order.id);
  assert.equal(store.create('a', ['python'], catalog).id, store.list('a')[0].id);
  assert.equal(store.list('b').length, 0);
});
test('unpriced courses cannot be reported as paid, nor can another account report an order', () => {
  const store = setup();
  const quote = store.create('a', ['sql'], catalog);
  assert.equal(quote.status, 'awaiting_quote'); assert.equal(quote.amount, null);
  assert.throws(() => store.reportTransfer('a', quote.id), /payment_not_ready/);
  const order = store.create('a', ['python'], catalog);
  assert.throws(() => store.reportTransfer('b', order.id), /not_found/);
  assert.equal(store.reportTransfer('a', order.id).status, 'pending_review');
  assert.equal(store.reportTransfer('a', order.id).status, 'pending_review');
});
test('only active paid entitlements unlock lessons; pending transfers and orders do not', () => {
  const expiresAt = '2099-01-01T00:00:00Z';
  const grants = [{ courseId: 'python', status: 'active', paymentStatus: 'paid', expiresAt }, { courseId: 'sql', status: 'active', paymentStatus: 'pending' }, { courseId: 'rag', status: 'revoked', paymentStatus: 'paid' }];
  assert.deepEqual(activeCourseIds(null, grants), []);
  assert.deepEqual(activeCourseIds({ id: 'a' }, grants), ['python']);
  assert.deepEqual(activeCourseIds({ id: 'a' }, [{ courseId: 'python', status: 'pending_review' }, { courseId: 'python', status: 'paid' }]), []);
});

test('Power BI requires payment and old waived entitlements do not unlock it', () => {
  const store = setup();
  assert.deepEqual(store.entitlements('a'), []);
  assert.deepEqual(activeCourseIds({id:'a'}, [{courseId:'data-analysis',status:'active',paymentStatus:'waived',accessType:'temporary',activatedAt:new Date().toISOString(),expiresAt:'2099-01-01T00:00:00Z'}]), []);
  assert.equal(store.create('a', ['data-analysis'], [{id:'data-analysis', title:{mn:'Power BI'}, price:49900}]).status, 'pending_payment');
});

test('pending overlap is rejected even when a second basket has additional courses', () => {
  const store = setup(); store.create('a', ['python'], catalog);
  assert.throws(() => store.create('a', ['python','sql'], catalog), /already_ordered/);
});
test('old unpriced orders acquire the confirmed catalog total', () => {
  const store = setup(); const order = store.create('a', ['sql'], catalog);
  const rows = store.list('a', catalog.map((item) => ({...item,price:49900})));
  assert.equal(rows[0].id,order.id); assert.equal(rows[0].amount,49900); assert.equal(rows[0].status,'pending_payment');
});
