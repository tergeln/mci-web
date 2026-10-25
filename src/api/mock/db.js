// Mock "өгөгдлийн сан". Backend бэлэн болоход энэ хавтас хэрэггүй болно.
// Өгөгдлийн хэлбэр docs/API.md-тэй яг таарах ёстой.
import { ApiError } from '../client';
import { courseImages, newsImages } from '../../assets/siteImages';

export const courses = [
  {
    id: 'vip-course', category: 'AI', status: 'waitlist', price: null, image: courseImages['vip-course'],
    title: { mn: 'VIP цогц сургалт', en: 'VIP Course' },
    description: { mn: 'Суурь ойлголтоос AI төсөл хүртэлх цогц хөтөлбөр.', en: 'A complete path from fundamentals to an AI project.' },
  },
  {
    id: 'data-analysis', category: 'Data', status: 'open', price: null, image: courseImages['data-analysis'],
    title: { mn: 'Өгөгдлийн шинжилгээ ба Power BI', en: 'Data Analysis & Power BI' },
    description: { mn: 'SQL, Python болон Power BI ашиглан өгөгдөл шинжилж, тайлан бүтээх.', en: 'Analyse data and build reports with SQL, Python and Power BI.' },
  },
  {
    id: 'computer-skills', category: 'Digital', status: 'waitlist', price: null, image: courseImages['computer-skills'],
    title: { mn: 'Компьютерын хэрэглээ', en: 'Computer Skills' },
    description: { mn: 'Компьютерын үндсэн хэрэглээ, файл болон өдөр тутмын дижитал хэрэгслүүд.', en: 'Computer basics, files and everyday digital tools.' },
  },
  {
    id: 'python-programming', category: 'Code', status: 'planned', price: null, image: courseImages['python-programming'],
    title: { mn: 'Python программчлал', en: 'Python Programming' },
    description: { mn: 'Python хэлний суурь, өгөгдлийн бүтэц, автоматжуулалт.', en: 'Python fundamentals, data structures and automation.' },
  },
  {
    id: 'web-development', category: 'Code', status: 'planned', price: null, image: courseImages['web-development'],
    title: { mn: 'Вэб хөгжүүлэлт', en: 'Web Development' },
    description: { mn: 'HTML, CSS, JavaScript ашиглан вэбсайт бүтээх суурь.', en: 'Build websites with HTML, CSS and JavaScript.' },
  },
  {
    id: 'sql-databases', category: 'Data', status: 'planned', price: null, image: courseImages['sql-databases'],
    title: { mn: 'SQL ба өгөгдлийн сан', en: 'SQL & Databases' },
    description: { mn: 'Өгөгдлийн сангийн зохион байгуулалт, хайлт болон шинжилгээ.', en: 'Database design, queries and analysis.' },
  },
  {
    id: 'ai-rag-systems', category: 'AI', status: 'planned', price: null, image: courseImages['ai-rag-systems'],
    title: { mn: 'AI ба RAG систем', en: 'AI & RAG Systems' },
    description: { mn: 'Эх сурвалжид тулгуурласан AI туслах бүтээх ойлголтууд.', en: 'Explore grounded AI assistants and retrieval.' },
  },
  {
    id: 'machine-learning', category: 'AI', status: 'planned', price: null, image: courseImages['machine-learning'],
    title: { mn: 'Машин сургалт', en: 'Machine Learning' },
    description: { mn: 'Өгөгдөл бэлтгэх, загвар сургах, үр дүнг үнэлэх суурь.', en: 'Prepare data, train models and evaluate results.' },
  },
  {
    id: 'cybersecurity', category: 'Digital', status: 'planned', price: null, image: courseImages['cybersecurity'],
    title: { mn: 'Кибер аюулгүй байдал', en: 'Cybersecurity' },
    description: { mn: 'Дижитал мэдээлэл, бүртгэл болон системээ хамгаалах суурь.', en: 'Foundations for protecting accounts, information and systems.' },
  },
];

const sample = (number, category, title, summary) => ({
  id: String(Number(number)),
  number,
  category,
  title,
  summary,
  publishedAt: null,
  details: { date: null, location: null, partners: null },
  body: null,
  isSample: true,
  coverImage: newsImages[number],
});

export const news = [
  {
    id: '1', number: '01', isSample: false, publishedAt: null,
    category: { mn: 'Байгаль орчин · Хамтын ажиллагаа', en: 'Environment · Collaboration' },
    title: { mn: 'Хушхан брэндтэй хамтран “Хусхан төгөл”-д мод тарилаа', en: 'Tree planting at Hushkhan Tugul with HUSHKHAN' },
    summary: { mn: '“Хусхан төгөл”-д Хушхан брэндтэй хамтран мод тарих ажилд оролцлоо.', en: 'We joined HUSHKHAN for a tree-planting initiative at Hushkhan Tugul.' },
    body: {
      mn: 'Бид Хушхан брэндтэй хамтран “Хусхан төгөл”-д мод тарилаа. Мод тарихаар бэлтгэсэн суулгацууд, талбай руу явж буй оролцогчид болон тарьсан суулгацын зургуудыг хүргэж байна.',
      en: 'We planted trees at Hushkhan Tugul in collaboration with HUSHKHAN. These photographs show the saplings prepared for planting, participants heading to the site and a newly planted sapling.',
    },
    details: { date: null, location: { mn: 'Хусхан төгөл', en: 'Hushkhan Tugul' }, partners: { mn: 'Хушхан брэнд', en: 'HUSHKHAN' } },
    coverImage: {
      src: '/assets/news/khush-tugul/saplings.jpg', width: 4032, height: 3024,
      alt: { mn: 'Мод тарихаар бэлтгэсэн хоёр суулгац', en: 'Two saplings prepared for planting' },
      caption: { mn: 'Мод тарихаар бэлтгэсэн суулгацууд.', en: 'Saplings prepared for planting.' },
    },
    gallery: [
      {
        src: '/assets/news/khush-tugul/planting-team.jpg', width: 3072, height: 4096,
        alt: { mn: 'Хусхан төгөлд мод тарих талбай руу явж буй оролцогчид', en: 'Participants heading to the planting site at Hushkhan Tugul' },
        caption: { mn: 'Мод тарих талбай руу явж буй оролцогчид.', en: 'Participants on their way to the planting site.' },
      },
      {
        src: '/assets/news/khush-tugul/planted-sapling.jpg', width: 1536, height: 2048,
        alt: { mn: 'Хусхан төгөлд хөрсөнд тарьсан суулгац', en: 'A newly planted sapling at Hushkhan Tugul' },
        caption: { mn: 'Хусхан төгөлд тарьсан суулгац.', en: 'A sapling planted at Hushkhan Tugul.' },
      },
    ],
  },
  sample('02', { mn: 'Боловсрол · Жишээ', en: 'Education · Sample' }, { mn: 'Суралцах боломжийг дэмжих тэтгэлэг', en: 'Scholarships for learning' },
    { mn: 'Тэтгэлгийн зорилго, хамрах хүрээ, оролцох нөхцөлийг энд танилцуулна.', en: 'Introduce the scholarship’s purpose, scope and eligibility here.' }),
  sample('03', { mn: 'Хамт олон · Жишээ', en: 'Community · Sample' }, { mn: 'Технологитой танилцах нээлттэй өдөр', en: 'Technology open day' },
    { mn: 'Нээлттэй уулзалтын хөтөлбөр, онцлох агшнуудыг энд нийтэлнэ.', en: 'Publish the open day programme and highlights here.' }),
  sample('04', { mn: 'Сургалт · Жишээ', en: 'Learning · Sample' }, { mn: 'Дижитал ур чадварын сургалт', en: 'Digital skills workshop' },
    { mn: 'Сургалтын сэдэв, хамрагдсан оролцогчид, бүтээлүүдийг энд танилцуулна.', en: 'Present workshop topics, participants and their work here.' }),
  sample('05', { mn: 'Төсөл · Жишээ', en: 'Projects · Sample' }, { mn: 'Суралцагчдын бүтээлийн өдөр', en: 'Student project showcase' },
    { mn: 'Суралцагчдын төсөл, шийдэл болон туршлагыг энд хуваалцана.', en: 'Share student projects, solutions and experiences here.' }),
  sample('06', { mn: 'Сайн дурын ажил · Жишээ', en: 'Volunteering · Sample' }, { mn: 'Мэдлэгээ хуваалцах сайн дурын өдөр', en: 'Volunteer knowledge sharing' },
    { mn: 'Сайн дурын оролцоо, хамтын ажлын түүхийг энд нийтэлнэ.', en: 'Publish volunteer stories and collaborative activities here.' }),
  sample('07', { mn: 'Хамтын ажиллагаа · Жишээ', en: 'Partnerships · Sample' }, { mn: 'Боловсролын төлөөх хамтын ажиллагаа', en: 'Partnerships for education' },
    { mn: 'Хамтарсан санаачилгын зорилго, явц болон үр дүнг энд танилцуулна.', en: 'Introduce joint initiatives, their progress and outcomes here.' }),
  sample('08', { mn: 'Уулзалт · Жишээ', en: 'Events · Sample' }, { mn: 'Мэргэжил сонголт ба технологийн ирээдүй', en: 'Careers and the future of technology' },
    { mn: 'Зөвлөгөө, ярилцлага болон уулзалтын гол санаануудыг энд хуваалцана.', en: 'Share career advice, conversations and event takeaways here.' }),
];

// Бүртгэл, төлбөр хуудас дахин ачаалахад арилна (санах ойд л хадгалагдана).
export const enrollments = new Map();
export const payments = new Map();

export const newId = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

export function notFound(what) {
  return new ApiError(404, 'not_found', `${what} not found`);
}
