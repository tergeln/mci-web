export const hasCoursePrice = (price) => Number.isSafeInteger(price) && price >= 0;
export function cartTotal(courses) {
  return courses.length && courses.every((course) => hasCoursePrice(course.price))
    ? courses.reduce((sum, course) => sum + course.price, 0) : null;
}
