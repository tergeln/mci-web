import Tr from '../../../components/Tr/Tr';
import useReveal from '../../../hooks/useReveal';
import { useLang } from '../../../context/LanguageContext';
import ImpactNews from './ImpactNews';
import useApi from '../../../hooks/useApi';
import { getAbout } from '../../../api/about';
import ApiState from '../../../components/ApiState/ApiState';
import { imageDelivery } from '../../../assets/imageDelivery';

export default function AboutSection() {
  const { data, loading, error, reload } = useApi((signal) => getAbout({ signal }), []);
  return <section className="about" id="about">
    <div className="wrap"><ApiState loading={loading} error={error} onRetry={reload} /></div>
    {data?.visible && <DirectorProfile director={data} />}
    <ImpactNews />
  </section>;
}

function DirectorProfile({ director }) {
  const photo = imageDelivery(director.photo);
  const { lang } = useLang();
  const [headRef, headClass] = useReveal('about-head');
  const [copyRef, copyClass] = useReveal('about-copy');
  const [factsRef, factsClass] = useReveal('about-director-facts');
  return (
    <>
      <div className="wrap">
        <div ref={headRef} className={headClass}>
          <div className="eyebrow"><Tr text={director.heading} /></div>
        </div>
      </div>
      <div className="wrap about-grid">
        <figure className="about-picture about-director">
          <img src={photo.src} srcSet={photo.srcSet} sizes={photo.srcSet ? '(max-width:720px) 96px, clamp(150px,13vw,200px)' : undefined} alt={director.name[lang]} width={photo.width} height={photo.height} loading="lazy" decoding="async" />
          <figcaption>
            <strong><Tr text={director.name} /></strong>
            <span><Tr text={director.role} /></span>
          </figcaption>
          {director.languages.length > 0 && <div className="about-director-langs">
            <span><Tr mn="Хэлний мэдлэг" en="Languages" /></span>
            <ul>
              {director.languages.map((language, index) => (
                <li key={index}><Tr text={language} /></li>
              ))}
            </ul>
          </div>}
        </figure>
        <div ref={copyRef} className={copyClass}>
          <p><Tr text={director.bio} /></p>
          {director.stats.length > 0 && <dl className="about-director-stats">
            {director.stats.map((stat, index) => (
              <div key={index}>
                <dt>{stat.value}</dt>
                <dd><Tr text={stat.label} /></dd>
              </div>
            ))}
          </dl>}
        </div>
      </div>
      {director.facts.length > 0 && <div className="wrap">
        <div ref={factsRef} className={factsClass}>
          {director.facts.map((group, index) => (
            <div key={index}>
              <h3><Tr text={group.title} /></h3>
              <ul>
                {group.items.map((item, index) => (
                  <li key={index}><Tr text={item} /></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>}
    </>
  );
}
