// Temporary phone ordering. Keep the switch centralized for restoring checkout.
export const PHONE_ONLY_ORDERING = true;
export const ORDER_PHONE = '94140478';
export function canAddCourse(course) {
  if (!course || course.deletedAt || (course.publication && course.publication !== 'published')) return false;
  if (typeof course.cartEnabled === 'boolean') return course.cartEnabled;
  return course.title?.mn?.trim().replace(/\s+/g, ' ').toLocaleLowerCase('mn') === 'компьютер зохион байгуулалт, архитектур';
}
