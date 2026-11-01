export const site = {
  url: 'https://www.mci.mn',
  name: 'Magic Code AI',
  alternateNames: ['MCI', 'Magic Code'],
  logo: '/assets/site-icon.png',
};

export const publicPages = [
  { path: '/', title: 'Magic Code AI',
    description: { mn: 'Magic Code AI (MCI) — Python, Power BI, хиймэл оюун, вэб хөгжүүлэлт болон мэдээллийн аюулгүй байдлын сургалт, бизнест зориулсан вэбсайт хөгжүүлэлт.', en: 'Magic Code AI (MCI) offers Python, Power BI, AI, web development and cybersecurity courses, plus website development for businesses.' } },
  { path: '/courses', title: 'Сургалтууд — Magic Code AI',
    description: { mn: 'Magic Code AI-ийн Python, SQL, Power BI, AI, Deep Learning, RAG, вэб хөгжүүлэлт болон мэдээллийн аюулгүй байдлын сургалтуудтай танилцаарай.', en: 'Explore Magic Code AI courses in Python, SQL, Power BI, AI, deep learning, RAG, web development and cybersecurity.' } },
  { path: '/news', title: 'Мэдээ, бидний оролцоо — Magic Code AI',
    description: { mn: 'Magic Code AI (MCI)-ийн хамтын ажиллагаа, нийгмийн оролцоо, эрдэм шинжилгээ болон арга хэмжээний мэдээнүүд.', en: 'News from Magic Code AI (MCI): partnerships, community initiatives, research and events.' } },
  { path: '/news/1', title: 'Хушхан брэндтэй хамтран мод тарилаа — Magic Code AI',
    description: { mn: 'Magic Code AI хамт олон Хушхан брэндтэй хамтран “Хусхан төгөл”-д мод тарих ажилд оролцлоо.', en: 'Magic Code AI joined HUSHKHAN for a tree-planting initiative at Hushkhan Tugul.' } },
  { path: '/news/2', title: 'Эмэгтэйчүүдийн бизнесийг дэмжих нь — Magic Code AI',
    description: { mn: 'Magic Code AI бизнес эрхлэгч 7 эмэгтэйд тус бүр 1,000,000₮, нийт 7,000,000₮-ийн вэбсайт хийлгэх эрхийн бичиг гардууллаа.', en: 'Magic Code AI presented seven women entrepreneurs with website vouchers worth ₮7,000,000 in total.' } },
  { path: '/news/3', title: 'Монголын Мэдээллийн Технологи-2026 — Magic Code AI',
    description: { mn: '“Монголын Мэдээллийн Технологи-2026” эрдэм шинжилгээний хурлын нээлт, илтгэлүүд, постер танилцуулга болон оролцсон агшнууд.', en: 'Highlights from the Mongolian Information Technology 2026 research conference, including presentations and poster sessions.' } },
];

export function pageSeo(pathname, lang = 'mn') {
  const path = pathname.replace(/\/index\.html$/, '/').replace(/\/+$/, '') || '/';
  const page = publicPages.find((item) => item.path === path);
  return {
    title: page?.title ?? site.name,
    description: (page ?? publicPages[0]).description[lang === 'en' ? 'en' : 'mn'],
    canonical: `${site.url}${path === '/' ? '/' : path}`,
    image: `${site.url}${site.logo}`,
    noindex: !page,
  };
}

export const siteStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', '@id': `${site.url}/#organization`, name: site.name,
      alternateName: site.alternateNames, url: `${site.url}/`, logo: `${site.url}${site.logo}`,
      email: 'magiccodeai@gmail.com',
      address: { '@type': 'PostalAddress', addressLocality: 'Ulaanbaatar', addressCountry: 'MN' } },
    { '@type': 'WebSite', '@id': `${site.url}/#website`, name: site.name,
      alternateName: site.alternateNames, url: `${site.url}/`,
      publisher: { '@id': `${site.url}/#organization` } },
  ],
};
