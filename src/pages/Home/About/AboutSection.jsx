import Tr from '../../../components/Tr/Tr';
import useReveal from '../../../hooks/useReveal';
import { useLang } from '../../../context/LanguageContext';
import ImpactNews from './ImpactNews';
import { director } from '../../../data/director';

export default function AboutSection() {
  const { lang } = useLang();
  const [headRef, headClass] = useReveal('about-head');
  const [copyRef, copyClass] = useReveal('about-copy');
  const [factsRef, factsClass] = useReveal('about-director-facts');
  return (
    <section className="about" id="about">
      <div className="wrap">
        <div ref={headRef} className={headClass}>
          <div className="eyebrow"><Tr mn="БИДНИЙ ТУХАЙ" en="OUR STORY" /></div>
        </div>
      </div>
      <div className="wrap about-grid">
        <figure className="about-picture about-director">
          <img src={director.photo.src} alt={director.name[lang]} width={director.photo.width} height={director.photo.height} loading="lazy" decoding="async" />
          <figcaption>
            <strong><Tr text={director.name} /></strong>
            <span><Tr text={director.role} /></span>
          </figcaption>
          <div className="about-director-langs">
            <span><Tr mn="Хэлний мэдлэг" en="Languages" /></span>
            <ul>
              {director.languages.map((language) => (
                <li key={language.en}><Tr text={language} /></li>
              ))}
            </ul>
          </div>
        </figure>
        <div ref={copyRef} className={copyClass}>
          <p><Tr text={director.bio} /></p>
          <dl className="about-director-stats">
            {director.stats.map((stat) => (
              <div key={stat.label.en}>
                <dt>{stat.value}</dt>
                <dd><Tr text={stat.label} /></dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <div className="wrap">
        <div ref={factsRef} className={factsClass}>
          {director.facts.map((group) => (
            <div key={group.title.en}>
              <h3><Tr text={group.title} /></h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item.en}><Tr text={item} /></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <ImpactNews />
    </section>
  );
}
