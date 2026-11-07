export const PHONE_ONLY_ORDERING = false;
export const ORDER_PHONE = '94140478';
export function canAddCourse(course) {
  return !!course && !course.deletedAt && (!course.publication || course.publication === 'published');
}
export function canPayOnline(course) {
  if (!canAddCourse(course)) return false;
  if (typeof course.onlinePaymentEnabled === 'boolean') return course.onlinePaymentEnabled;
  return (course.id ?? course.courseId) === 'python-programming' || course.title?.mn?.trim().replace(/\s+/g, ' ').toLocaleLowerCase('mn') === 'компьютер зохион байгуулалт, архитектур';
}
export function splitCartCourses(items) {
  return { payable: items.filter(canPayOnline), contact: items.filter((course) => !canPayOnline(course)) };
}
