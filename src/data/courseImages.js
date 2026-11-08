// Админаас зураг оруулаагүй сургалтын анхдагч постер (бусад сургалтын хар дэвсгэр, шар одтой загвар).
// Админ самбараас зураг тохируулбал түүнийг ашиглана.
const fallbackImages = {
  course_86a45b6609a5: {
    src: '/assets/courses/computer-architecture-slide.svg', width: 1200, height: 674, slide: true,
    alt: { mn: 'Компьютер зохион байгуулалт, архитектур', en: 'Computer Organization and Architecture' },
  },
};

export function courseImage(course) {
  return course?.image ?? fallbackImages[course?.id] ?? null;
}
