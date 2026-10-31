// Бидний тухай хэсэгт харагдах захирлын мэдээлэл (CV_Enkhtuya-Tsogtbaatar_2026_Fall.pdf).
const t = (mn, en) => ({ mn, en });

export const director = {
  photo: { src: '/assets/about/director-enkhtuya.jpg', width: 600, height: 697 },
  name: t('Цогтбаатарын Энхтуяа', 'Enkhtuya Tsogtbaatar'),
  role: t('Үүсгэн байгуулагч, гүйцэтгэх захирал', 'Founder & CEO'),
  bio: t(
    'Гүйцэтгэх захирал Ц.Энхтуяа компьютерийн ухаан, өгөгдлийн шинжилгээ, хиймэл оюуны чиглэлээр 19 жил багшилж, судалгаа хийсэн туршлагатай. 2010 оноос Монгол Улсын Их Сургуульд багшилж байгаа бөгөөд Тайваньд гүн сургалтад суурилсан биометрик танилт, сансрын ионограмм боловсруулалтын олон улсын хамтарсан төслүүдэд ажилласан.',
    'CEO, Enkhtuya Tsogtbaatar, has spent 19 years teaching and researching computer science, data analysis and artificial intelligence. She has taught at the National University of Mongolia since 2010, and in Taiwan she worked on international joint projects in deep-learning-based biometrics and ionogram processing for space science.',
  ),
  stats: [
    { value: '19', label: t('жил багшилсан', 'years teaching') },
    { value: '28', label: t('хичээл заах чадвартай', 'courses she can teach') },
    { value: '20+', label: t('эрдэм шинжилгээний бүтээл', 'research publications') },
  ],
  languages: [
    t('Орос', 'Russian'),
    t('Англи', 'English'),
    t('Хятад', 'Chinese'),
    t('Япон', 'Japanese'),
    t('Солонгос', 'Korean'),
  ],
  facts: [
    {
      title: t('Боловсрол', 'Education'),
      items: [
        t('Компьютерийн ухаан, докторантур: Тайваны Үндэсний Их Сургууль, 100% тэтгэлэгтэй, 2018–2022', 'Doctoral studies in Computer Science and Information Engineering, Taiwan, full scholarship, 2018–2022'),
        t('Мэдээллийн удирдлагын магистр: Квангвүүн Их Сургууль, Хүрээ МХТДС, 2003–2007', "Master's in Information Management:  Kwangwoon University (Korea) and Huree University of ICT, 2003–2007"),
        t('Физикч, компьютерийн технологич:  Улсын Багшийн Их Сургууль, 1999–2003', "Bachelor's in Physics and Computer Technology:  Mongolian State University of Education, 1999–2003"),
      ],
    },
    {
      title: t('Ажлын туршлага', 'Experience'),
      items: [
        t('Magic Code AI ХХК-ийн үүсгэн байгуулагч, гүйцэтгэх захирал, 2025 оноос одоог хүртэл', 'Founder and CEO of Magic Code AI LLC, 2025–present'),
        t('Монгол Улсын Их Сургуулийн багш, 2010 оноос одоог хүртэл','Lecturer at the National University of Mongolia, 2010–present'),        
        t('Худалдаа Үйлдвэрлэлийн Дээд Сургуулийн компьютерийн ухааны багш, 2007–2010', 'Lecturer in Computer Science at the College of Commerce and Industry, 2007–2010'),
      ],
    },
    {
      title: t('Мэргэшил', 'Expertise'),
      items: [
        t('Хиймэл оюун, машин сургалт, гүн сургалт', 'Artificial intelligence, machine learning, deep learning'),
        t('Өгөгдлийн шинжилгээ ба дүрслэл, Python, Business Intelligence, Tableau', 'Data Analysis and Visualization, Python, Business Intelligence, Tableau'),
        t('Мэдээллийн удирдлага, мэдээллийн аюулгүй байдал, мэргэшсэн зөвлөх', 'Information management, information security, certified consultant'),
      ],
    },
    {
      title: t('Шагнал, амжилт', 'Recognition'),
      items: [
        t('Олон улсын сэтгүүлд багаараа 5 өгүүлэл хэвлүүлсэн', 'Co-authored 5 papers in international journals'),
        t('AOGS 2021 олон улсын чуулганы хиймэл оюуны салбар хуралдаанд 4-р байр', '4th place, AI session of the AOGS 2021 international conference'),
        t('МУИС-ийн Хүндэтгэлийн жуух, 2015', 'NUM Certificate of Honour, 2015'),
        t('180 гишүүнтэй “Magic Code” эрдэм шинжилгээний клубыг үүсгэн байгуулсан, 2008', 'Founded the “Magic Code” research club, 180 members, 2008'),
      ],
    },
  ],
};
