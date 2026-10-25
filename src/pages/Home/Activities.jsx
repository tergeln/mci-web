import Tr from '../../components/Tr/Tr';
import useReveal from '../../hooks/useReveal';
import { activities } from '../../data/activities';
import { serviceImages } from '../../assets/siteImages';
import ContentImage from '../../components/ContentImage/ContentImage';

function ActivityCard({ activity }) {
  const [ref, className] = useReveal('activity');
  const image = serviceImages[activity.number.split(' ')[0]];
  return (
    <article ref={ref} className={className}>
      <div className="service-image" aria-hidden="true">
        {image ? <ContentImage image={image} sizes="(max-width: 640px) calc(100vw - 40px), 380px" decorative /> : activity.image && <img src={activity.image} alt="" loading="lazy" />}
      </div>
      <div className="service-content">
      <h3><Tr text={activity.title} /></h3>
      <p><Tr text={activity.text} /></p>
      <div className="service-price">{activity.price}</div>
      <details className="service-details">
        <summary><Tr mn="Дэлгэрэнгүй" en="See more" /></summary>
      <ul className="service-features">
        {activity.features.map((feature) => <li key={feature.en}><Tr text={feature} /></li>)}
      </ul>
      </details>
      </div>
    </article>
  );
}

export default function Activities() {
  const [headRef, headClass] = useReveal('section-head');
  return (
    <section id="activities">
      <div className="wrap">
        <div ref={headRef} className={headClass}>
          <div>
            <div className="eyebrow"><Tr mn="БИДНИЙ ҮЙЛ АЖИЛЛАГАА" en="WHAT WE DO" /></div>
            <h2><Tr mn="Таны бизнесийн <em>цахим шийдэл.</em>" en="Digital solutions <em>for your business.</em>" /></h2>
          </div>
        </div>
        <div className="activities">
          {activities.map((activity) => (
            <ActivityCard key={activity.number} activity={activity} />
          ))}
        </div>
      </div>
    </section>
  );
}
