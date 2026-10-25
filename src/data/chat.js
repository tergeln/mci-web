export const chatGreeting = {
  open: {
    mn: 'Сайн уу! ✳ Би Magic Code AI-ийн туслах. Сургалт, бүртгэл, төлбөр эсвэл холбоо барих талаар асуугаарай.',
    en: 'Hello! ✳ I am the Magic Code AI assistant. Ask about courses, enrollment, payments or contact details.',
  },
  // Хэл солиход өмнөх мессежүүдийг орлуулдаг мессеж
  relang: {
    mn: 'Сайн уу! ✳ Би Magic Code AI-ийн туслах. Сургалт, бүртгэл эсвэл төлбөрийн талаар асуугаарай.',
    en: 'Hello! ✳ I am the Magic Code AI assistant. Ask about courses, enrollment or payments.',
  },
};

export const quickQuestions = [
  { key: 'courses', mn: 'Сургалтууд', en: 'Courses' },
  { key: 'payment', mn: 'Төлбөр', en: 'Payment' },
  { key: 'contact', mn: 'Холбогдох', en: 'Contact' },
];

export const chatSystemPrompt = {
  mn: `Та Magic Code AI-ийн вебсайтын туслах. Зөвхөн Монгол хэлээр, товч бөгөөд ойлгомжтой хариул.
Сургалтууд: VIP цогц сургалт, Өгөгдлийн шинжилгээ ба Power BI, Компьютерын хэрэглээ.
Баталгаагүй үнэ, бүртгэл, төлбөрийн мэдээлэл бүү зохио. Мэдэхгүй бол magiccodeai@gmail.com хаягаар лавлахыг зөвлө.`,
  en: `You are the Magic Code AI website assistant. Reply only in English, briefly and clearly.
Courses: VIP Course, Data Analysis & Power BI, and Computer Skills.
Do not invent unconfirmed pricing, enrollment, or payment details. If unsure, recommend contacting magiccodeai@gmail.com.`,
};
