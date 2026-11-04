import test from 'node:test';
import assert from 'node:assert/strict';
import { accessExpiresAt, isActiveCourse, COURSE_PRICE } from './courseAccess.js';

test('course access lasts three calendar months and clamps short months', () => {
  assert.equal(COURSE_PRICE, 49900);
  assert.equal(accessExpiresAt('2026-11-01T05:00:00Z'), '2027-02-01T05:00:00.000Z');
  assert.equal(accessExpiresAt('2026-01-31T05:00:00Z'), '2026-04-30T05:00:00.000Z');
  assert.equal(accessExpiresAt('2023-11-30T05:00:00Z'), '2024-02-29T05:00:00.000Z');
});
test('access expires at the boundary, rejects future and undated grants', () => {
  const item = {courseId:'python', status:'active',paymentStatus:'paid',activatedAt:'2026-11-01T05:00:00Z'};
  assert.equal(isActiveCourse(item, Date.parse('2027-02-01T04:59:59Z')), true);
  assert.equal(isActiveCourse(item, Date.parse('2027-02-01T05:00:00Z')), false);
  assert.equal(isActiveCourse(item, Date.parse('2026-10-01T05:00:00Z')), false);
  assert.equal(isActiveCourse({...item, activatedAt:undefined}), false);
});
test('unpaid Power BI trial grants no longer authorize access', () => {
  const item={courseId:'data-analysis',status:'active',paymentStatus:'waived',accessType:'temporary',activatedAt:'2026-11-01T05:00:00Z'};
  assert.equal(isActiveCourse(item,Date.parse('2026-12-01T05:00:00Z')),false);
  assert.equal(isActiveCourse({...item,courseId:'python'},Date.parse('2026-12-01T05:00:00Z')),false);
  assert.equal(isActiveCourse(item,Date.parse('2027-02-02T05:00:00Z')),false);
});
