import test from 'node:test';
import assert from 'node:assert/strict';
import { learningCourses, getLearningCourse, lessonStorageKeys } from './lessons.js';

test('all catalog courses resolve to their own curriculum', () => {
  const ids = ['vip-course', 'data-analysis', 'computer-skills', 'python-programming', 'web-development', 'sql-databases', 'ai-rag-systems', 'machine-learning', 'cybersecurity'];
  assert.deepEqual(learningCourses.map((course) => course.id), ids);
  for (const id of ids) {
    const course = getLearningCourse(id);
    assert.equal(course.id, id);
    assert.ok(course.title.mn && course.title.en);
    assert.ok(course.lessons.length > 0);
    assert.equal(new Set(course.lessons.map((lesson) => lesson.id)).size, course.lessons.length);
    for (const lesson of course.lessons) assert.match(lesson.id, /^[\w-]{11}$/);
  }
  assert.equal(getLearningCourse('unknown-course'), undefined);
});

test('shared foundation videos do not share course progress or last lesson', () => {
  for (const field of ['progress', 'last']) {
    const keys = learningCourses.flatMap((course) => ['student-a', 'student-b', 'guest'].map((user) => lessonStorageKeys(course.id, user)[field]));
    assert.equal(new Set(keys).size, keys.length);
  }
});

test('existing Power BI progress remains available after course separation', () => {
  assert.deepEqual(lessonStorageKeys('data-analysis', 'student-a'), {
    progress: 'mc-lessons-v1-student-a', last: 'mc-last-lesson-student-a',
  });
  assert.equal(getLearningCourse(), undefined);
  assert.equal(getLearningCourse('data-analysis').id, 'data-analysis');
});
