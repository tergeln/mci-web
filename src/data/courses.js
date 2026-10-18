// Нүүр хуудасны 3 курс. `id` нь API-ийн курсын id, `open` бол төлбөртэй бүртгэлтэй (бусад нь хүлээлгийн жагсаалт). `kind` нь CourseArt-ийн хувилбарыг (code / chart / keys) заана.
export const homeCourses = [
  {
    id: 'vip-course', kind: 'code', art: 'art1',
    tag: { mn: 'ХИЙМЭЛ ОЮУН БА ХӨГЖҮҮЛЭЛТ', en: 'AI & DEVELOPMENT' },
    title: { mn: 'VIP цогц сургалт', en: 'VIP Course' },
    text: { mn: 'Суурь ойлголтоос AI төсөл хүртэлх цогц хөтөлбөр.', en: 'A complete path from fundamentals to your own AI project.' },
    meta: { mn: 'Бүх түвшин · Төсөлд суурилсан', en: 'All levels · Project-based' },
    status: { mn: 'Удахгүй', en: 'Coming soon' },
    button: { mn: 'Хүлээлгийн жагсаалт', en: 'Join waitlist' },
  },
  {
    id: 'data-analysis', open: true, kind: 'chart', art: 'art2',
    tag: { mn: 'ӨГӨГДӨЛ БА ШИНЖИЛГЭЭ', en: 'DATA & ANALYTICS' },
    title: { mn: 'Өгөгдлийн шинжилгээ ба Power BI', en: 'Data Analysis & Power BI' },
    text: { mn: 'Өгөгдлөө ойлгож, шийдвэр гаргахад туслах тайлан бүтээгээрэй.', en: 'Understand your data. Build dashboards that inform decisions.' },
    meta: { mn: 'Анхан Ахисан · SQL, Python, Power BI', en: 'Beginner Advanced · SQL, Python, Power BI' },
    status: { mn: 'Бүртгэл нээлттэй', en: 'Enrollment open' },
    button: { mn: 'Сургалт авах', en: 'Take this course' },
  },
  {
    id: 'computer-skills', kind: 'keys', art: 'art3',
    tag: { mn: 'ДИЖИТАЛ СУУРЬ ЧАДВАР', en: 'DIGITAL FOUNDATIONS' },
    title: { mn: 'Компьютерын хэрэглээ', en: 'Computer Skills' },
    text: { mn: 'Дижитал ертөнцөд өөртөө итгэлтэй ажиллах суурь чадвар.', en: 'Build confidence with the everyday tools of the digital world.' },
    meta: { mn: 'Анхан шат · Практик дасгалууд', en: 'Beginner friendly · Practical exercises' },
    status: { mn: 'Удахгүй', en: 'Coming soon' },
    button: { mn: 'Хүлээлгийн жагсаалт', en: 'Join waitlist' },
  },
];

export const chartBars = ['40%', '65%', '53%', '87%', '100%'];

// art-code блок: 3 мөр + ногоон "ready" мөр
export const courseCodeArt = {
  mn: { lines: ['> сайн уу, ирээдүй.', 'def sanaagaa_buteeh():', '  return bolomj'], ok: '✓ бүтээхэд бэлэн' },
  en: { lines: ['> hello, future.', 'def build_your_idea():', '  return possibility'], ok: '✓ ready to create' },
};

export const courseKeys = ['⌘', '⇧', '✦'];
