import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canAddCourse } from './ordering.js';

test('new architecture course can be added, other courses wait for admin reopening', () => {
  assert.equal(canAddCourse({ id: 'new-id', title: { mn: 'Компьютер зохион байгуулалт, архитектур' } }), true);
  assert.equal(canAddCourse({ id: 'data-analysis' }), false);
  assert.equal(canAddCourse({ id: 'data-analysis', cartEnabled: true }), true);
  assert.equal(canAddCourse({ title: { mn: 'Компьютер зохион байгуулалт, архитектур' }, cartEnabled: false }), false);
});

test('missing, unpublished and deleted courses cannot be added even with an enabled setting', () => {
  for (const course of [null, { cartEnabled: true, publication: 'draft' }, { cartEnabled: true, deletedAt: '2026-11-07' }]) assert.equal(canAddCourse(course), false);
});
