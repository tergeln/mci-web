import { Link } from 'react-router-dom';
import Tr from '../../../components/Tr/Tr';
import ImpactCard from '../../../components/ImpactCard/ImpactCard';
import ImpactIntro from '../../../components/ImpactCard/ImpactIntro';
import ApiState from '../../../components/ApiState/ApiState';
import useApi from '../../../hooks/useApi';
import { getNews } from '../../../api/news';

export default function ImpactNews() {
  const { data: stories, loading, error, reload } = useApi((signal) => getNews({ limit: 3, signal }), []);
  return (
    <div className="wrap impact-news" id="volunteering">
      <ImpactIntro animate />
      <ApiState loading={loading} error={error} onRetry={reload} />
      {stories && (
        <div className="impact-grid">
          {stories.map((story, i) => (
            <ImpactCard key={story.id} story={story} index={i} to={`/news/${story.id}`} />
          ))}
        </div>
      )}
      <Link className="btn secondary" id="moreImpact" to="/news">
        <Tr mn="Цааш үзэх" en="See all stories" />
      </Link>
    </div>
  );
}
