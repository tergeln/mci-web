const feature = (mn, en) => ({ mn, en });

export const activities = [
  {
    number: '01 /',
    title: { mn: 'Нэг хуудаст вэбсайт', en: 'Landing page' },
    text: { mn: '1 хуудас · Жижиг бизнес, хувь хүн, үйлчилгээ', en: '1 page · Small businesses, individuals and services' },
    price: '500,000₮ – 1,200,000₮',
    features: [
      feature('Захиалгат эсвэл бэлэн загварын дизайн', 'Custom or template design'),
      feature('3–5 хэсэг: танилцуулга, үйлчилгээ', '3–5 sections for your introduction and services'),
      feature('Гар утас, таблет, компьютерт зохицно', 'Responsive on mobile, tablet and desktop'),
      feature('Холбоо барих форм', 'Contact form'),
      feature('Суурь хиймэл оюунт туслах', 'Basic AI chatbot'),
      feature('Хайлтын системийн үндсэн тохиргоо', 'Basic SEO setup'),
    ],
  },
  {
    number: '02 /',
    title: { mn: 'Бизнес вэбсайт', en: 'Business website' },
    text: { mn: '5–10 хуудас · Байгууллага, компани, албан байгууллага', en: '5–10 pages · Organizations and companies' },
    price: '2,000,000₮ – 5,000,000₮',
    features: [
      feature('Брэндэд тохирсон захиалгат дизайн', 'Custom design tailored to your brand'),
      feature('Агуулга удирдах систем', 'CMS such as WordPress'),
      feature('Монгол, англи хэлтэй хиймэл оюунт туслах', 'Mongolian / English AI chatbot'),
      feature('Холбоо барих форм, захиалгын систем', 'Contact form and booking system'),
      feature('Хайлтын системийн үндсэн тохиргоо', 'Basic SEO setup'),
      feature('Газрын зураг, нийгмийн сүлжээний холбоос', 'Google Maps and social links'),
      feature('Блог, мэдээний хэсэг', 'Blog and news section'),
      feature('Гар утсанд зохицсон загвар', 'Mobile responsive design'),
    ],
  },
  {
    number: '03 /',
    title: { mn: 'Онлайн дэлгүүр', en: 'E-commerce' },
    text: { mn: 'Онлайн дэлгүүр · Бүтээгдэхүүн худалдаа, захиалгын систем', en: 'Online store · Product sales and ordering' },
    price: '5,000,000₮ – 15,000,000₮',
    features: [
      feature('Бүтээгдэхүүн, ангиллын удирдлага', 'Product and category management'),
      feature('Сагс, захиалгын систем', 'Shopping cart and ordering'),
      feature('Цахим төлбөрийн холболт', 'Payment integration: QPay, SocialPay'),
      feature('Хэрэглэгчийн бүртгэл, нэвтрэх', 'Customer registration and login'),
      feature('Хиймэл оюунт ухаалаг туслах', 'Smart AI chatbot'),
      feature('Захиалгын удирдлагын систем', 'Order management'),
      feature('Тайлан, дүн шинжилгээ', 'Reports and analytics'),
      feature('Гар утсанд зохицсон загвар', 'Mobile responsive design'),
      feature('Аюулгүй байдал, нөөцлөлт', 'Security and backups'),
    ],
  },
];
