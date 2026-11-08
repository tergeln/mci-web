const dataLessons = [
  { id: 'g0m5sEHPU-s', mn: 'Power BI суулгах ба анхны дүрслэл', en: 'Install Power BI & your first visualization', creator: 'Alex The Analyst' },
  { id: 'HXV3zeQKqGY', mn: 'SQL ба өгөгдлийн сангийн суурь', en: 'SQL & database fundamentals', creator: 'freeCodeCamp.org' },
  { id: 'rfscVS0vtbw', mn: 'Python программчлалын суурь', en: 'Python programming fundamentals', creator: 'freeCodeCamp.org' },
  { id: 'I0vQ_VLZTWg', mn: 'Power BI тайлан ба төсөл', en: 'Power BI dashboards & full project', creator: 'Alex The Analyst' },
];

// Public preview videos. Keep each course's curriculum and progress independent.
const pythonBasics = dataLessons[2];
const sqlBasics = dataLessons[1];
const pythonIntermediate = { id: 'HGOBQPFzWKo', mn: 'Python: өгөгдлийн бүтэц ба ахисан ойлголтууд', en: 'Intermediate Python programming', creator: 'freeCodeCamp.org' };
const machineLearning = { id: 'i_LwzRVP7bg', mn: 'Машин сургалтын суурь ба загварууд', en: 'Machine Learning for Everybody', creator: 'freeCodeCamp.org' };
const deepLearning = { id: 'tPYj3fFJGjk', mn: 'TensorFlow ба мэдрэлийн сүлжээ', en: 'TensorFlow and neural networks', creator: 'freeCodeCamp.org' };
const rag = { id: 'ea2W8IogX80', mn: 'RAG системийн суурь ба баримттай чатлах төсөл', en: 'RAG fundamentals and document chat project', creator: 'freeCodeCamp.org' };

// Өөрсдийн бичлэгүүд (Cloudflare R2). Линкийг backend хугацаатайгаар өгнө; Лаб 1 нь үнэгүй танилцуулга.
const architectureLabs = [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13].map((n) => ({ id: `lesson-${String(n).padStart(2, '0')}`, mn: `Лаб ${n}`, en: `Lab ${n}`, video: true }));

export const learningCourses = [
  { id: 'vip-course', title: { mn: 'VIP цогц сургалт', en: 'VIP Course' }, lessons: [pythonBasics, sqlBasics, machineLearning, rag] },
  { id: 'data-analysis', title: { mn: 'Өгөгдлийн шинжилгээ ба Power BI', en: 'Data Analysis & Power BI' }, lessons: dataLessons },
  { id: 'computer-skills', title: { mn: 'Компьютерын хэрэглээ', en: 'Computer Skills' }, lessons: [
    { id: 'y2kg3MOk1sY', mn: 'Компьютер, файл ба интернэтийн үндсэн хэрэглээ', en: 'Computer and technology basics', creator: 'freeCodeCamp.org' },
  ] },
  { id: 'python-programming', title: { mn: 'Python программчлал', en: 'Python Programming' }, lessons: [pythonBasics, pythonIntermediate] },
  { id: 'web-development', title: { mn: 'Вэб хөгжүүлэлт', en: 'Web Development' }, lessons: [
    { id: 'mU6anWqZJcc', mn: 'HTML, CSS ба вэб хуудасны загвар', en: 'HTML5 and CSS3 from scratch', creator: 'freeCodeCamp.org' },
    { id: 'jS4aFq5-91M', mn: 'JavaScript программчлал ба интерактив вэб', en: 'JavaScript programming', creator: 'freeCodeCamp.org' },
  ] },
  { id: 'sql-databases', title: { mn: 'SQL ба өгөгдлийн сан', en: 'SQL & Databases' }, lessons: [sqlBasics] },
  { id: 'ai-rag-systems', title: { mn: 'AI ба RAG систем', en: 'AI & RAG Systems' }, lessons: [rag] },
  { id: 'machine-learning', title: { mn: 'AI & Deep Learning', en: 'AI & Deep Learning' }, lessons: [pythonBasics, machineLearning, deepLearning] },
  { id: 'cybersecurity', title: { mn: 'Мэдээллийн аюулгүй байдал', en: 'Information Security' }, lessons: [
    { id: '9HOpanT0GRs', mn: 'Бүртгэл, өгөгдөл, систем ба хувийн мэдээллээ хамгаалах', en: 'CS50: Introduction to Cybersecurity', creator: 'Harvard CS50 / freeCodeCamp.org' },
  ] },
  { id: 'course_86a45b6609a5', title: { mn: 'Компьютер зохион байгуулалт, архитектур', en: 'Computer Organization and Architecture' }, video: true, lessons: architectureLabs },
];

export function getLearningCourse(courseId) {
  return learningCourses.find((course) => course.id === courseId);
}

export function lessonStorageKeys(courseId, userId = 'guest') {
  // Preserve the existing Power BI progress; other courses get separate keys.
  const suffix = courseId === 'data-analysis' ? userId : `${userId}-${courseId}`;
  return { progress: `mc-lessons-v1-${suffix}`, last: `mc-last-lesson-${suffix}` };
}
