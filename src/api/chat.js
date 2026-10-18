import { request } from './client';

/**
 * POST /api/chat
 * @param {string} message  Хэрэглэгчийн асуулт
 * @param {'mn'|'en'} lang  Хариулах хэл
 * @param {{ role: 'user'|'assistant', content: string }[]} history  Өмнөх мессежүүд (сүүлийн 10)
 * @returns {Promise<{ reply: string }>}
 */
export function sendChatMessage({ message, lang, history = [] }) {
  return request('/chat', {
    method: 'POST',
    body: { message, lang, history: history.slice(-10) },
    mock: () => ({ reply: mockAnswer(message, lang) }),
  });
}

// Backend-ийн AI холбогдох хүртэлх түр хариултууд.
function mockAnswer(question, lang) {
  const t = (mn, en) => (lang === 'mn' ? mn : en);
  const s = question.toLowerCase();
  if (/төлбөр|үнэ|payment|price|qpay/.test(s)) return t('Өгөгдлийн шинжилгээний сургалтын Бүртгүүлэх товчийг дараад мэдээллээ бөглөхөд төлбөрийн туршилтын хэсэг нээгдэнэ. Бодит үнэ, төлбөрийг magiccodeai@gmail.com хаягаар лавлаарай.', 'Choose Enroll on Data Analysis and complete the form to see the payment demo. Confirm official pricing and payment via magiccodeai@gmail.com.');
  if (/сургалт|course|python|power|vip|элс|enroll/.test(s)) return t('VIP цогц сургалт, Өгөгдлийн шинжилгээ ба Power BI, Компьютерын хэрэглээ гэсэн 3 чиглэлтэй. Өгөгдлийн шинжилгээний сургалтын бүртгэлийн явцыг турших боломжтой, бусад нь хүлээлгийн жагсаалттай.', 'Explore VIP Course, Data Analysis & Power BI and Computer Skills. Data Analysis has an enrollment demo; the other paths have waitlist demos.');
  if (/merch|бараа|цамц|tote/.test(s)) return t('Бүтээгдэхүүний хэсэгт одоогоор цүнхний загвар зургуудыг түр ашиглаж байна. Байгууллагын бүтээгдэхүүний мэдээллийг и-мэйлээр лавлаарай.', 'Explore the concept merch collection and add items to your selection. Pricing and stock are not yet confirmed.');
  return t('Бидэнтэй magiccodeai@gmail.com хаягаар холбогдоорой. Сургалт болон төлбөрийн талаар ч асууж болно.', 'Reach the team at magiccodeai@gmail.com. You can also ask me about courses and payment.');
}
