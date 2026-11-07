import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canAddCourse, canPayOnline, splitCartCourses } from './ordering.js';
import { cartTotal } from './coursePricing.js';
const architecture = { id: 'new-course', title: { mn: 'Компьютер зохион байгуулалт, архитектур' }, price: 1000 };
const python = { id: 'python-programming', price: 2000 };
const contact = ['vip-course', 'data-analysis', 'computer-skills', 'web-development', 'sql-databases', 'ai-rag-systems', 'machine-learning', 'cybersecurity'].map((id) => ({ id, price: 49900, cartEnabled: false }));
test('all ten courses can be added, even with obsolete cart-disable settings', () => {
  for (const course of [architecture, python, ...contact]) assert.equal(canAddCourse(course), true);
});
test('mixed carts charge only architecture and Python and retain contact courses separately', () => {
  const result = splitCartCourses([architecture, ...contact, python]);
  assert.deepEqual(result.payable.map((c) => c.id), ['new-course', 'python-programming']);
  assert.deepEqual(result.contact, contact);
  assert.equal(cartTotal(result.payable), 3000);
  assert.equal(splitCartCourses(contact).payable.length, 0);
});
test('unpriced contact courses do not block a priced online course', () => {
  assert.equal(cartTotal(splitCartCourses([python, { ...contact[0], price: null }]).payable), 2000);
});
test('admin payment override never disables adding to cart', () => {
  assert.equal(canPayOnline({ ...contact[0], onlinePaymentEnabled: true }), true);
  assert.equal(canPayOnline({ ...python, onlinePaymentEnabled: false }), false);
  assert.equal(canAddCourse({ ...python, onlinePaymentEnabled: false }), true);
});
test('missing, unpublished and deleted courses cannot be added or paid', () => {
  for (const course of [null, { onlinePaymentEnabled: true, publication: 'draft' }, { onlinePaymentEnabled: true, deletedAt: '2026-11-07' }]) {
    assert.equal(canAddCourse(course), false);
    assert.equal(canPayOnline(course), false);
  }
});
