export const chatGreeting = {
  open: {
    mn: 'Сайн уу! ✳ Сургалт, бүртгэл эсвэл холбоо барих талаар асуугаарай. Би урьдчилан бэлдсэн мэдээлэлтэй туршилтын туслах.',
    en: 'Hello! ✳ Ask about courses, enrollment or contact details. I am a demo assistant with prepared answers.',
  },
  // Хэл солиход өмнөх мессежүүдийг орлуулдаг мессеж
  relang: {
    mn: 'Сайн уу! ✳ Би Magic Code AI-ийн шидэт туслах. Сургалт, бүртгэл эсвэл төлбөрийн талаар асуугаарай. Одоогоор бэлэн мэдээлэлд тулгуурлан хариулна.',
    en: 'Hello! ✳ I am the Magic Code AI assistant. Ask about courses, enrollment or payments. I currently answer using prepared information.',
  },
};

export const quickQuestions = [
  { key: 'courses', mn: 'Сургалтууд', en: 'Courses' },
  { key: 'payment', mn: 'Төлбөр', en: 'Payment' },
  { key: 'contact', mn: 'Холбогдох', en: 'Contact' },
];

// Туслахын хариултууд API-аас ирнэ (src/api/chat.js).
