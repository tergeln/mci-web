import useNearViewport from '../../hooks/useNearViewport';
import Tr from '../../components/Tr/Tr';
import useReveal from '../../hooks/useReveal';
import { getServices } from '../../api/services';
import useApi from '../../hooks/useApi';
import ApiState from '../../components/ApiState/ApiState';
import ContentImage from '../../components/ContentImage/ContentImage';

function ActivityCard({ activity }) {
  const [ref, className] = useReveal('activity');
  const image = activity.image;
  return (
    <article ref={ref} className={className}>
      <div className="service-image" aria-hidden="true">
        {image && <ContentImage image={image} sizes="(max-width: 640px) calc(100vw - 40px), 380px" fallbackWidth={1200} fallbackHeight={800} decorative />}
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
  const [sectionRef, enabled] = useNearViewport();
  const { data: activities, loading, error, reload } = useApi((signal) => getServices({ signal }), [], enabled);
  const [headRef, headClass] = useReveal('section-head');
  return (
    <section id="activities" ref={sectionRef}>
      <div className="wrap">
        <div ref={headRef} className={headClass}>
          <div>
            <div className="eyebrow"><Tr mn="БИДНИЙ ҮЙЛ АЖИЛЛАГАА" en="WHAT WE DO" /></div>
            <h2><Tr mn="Таны бизнесийн <em>цахим шийдэл.</em>" en="Digital solutions <em>for your business.</em>" /></h2>
          </div>
        </div>
        <ApiState loading={loading} error={error} onRetry={reload} />
        <div className="activities">
          {activities?.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      </div>
    </section>
  );
}
