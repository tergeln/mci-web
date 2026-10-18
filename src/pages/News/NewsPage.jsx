import SimpleNavbar from '../../components/SimpleNavbar/SimpleNavbar';
import ImpactCard from '../../components/ImpactCard/ImpactCard';
import ImpactIntro from '../../components/ImpactCard/ImpactIntro';
import { useLang } from '../../context/LanguageContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import ApiState from '../../components/ApiState/ApiState';
import useApi from '../../hooks/useApi';
import { getNews } from '../../api/news';
import './news.css';

export default function NewsPage() {
  const { t } = useLang();
  const { data: stories, loading, error, reload } = useApi((signal) => getNews({ signal }), []);
  useDocumentTitle(t('Бидний хийсэн ажлууд — Magic Code AI', 'Our community work — Magic Code AI'));

  return (
    <>
      <SimpleNavbar logoTo="/#about" backTo="/#about" back={{ mn: '← Бидний тухай', en: '← About us' }} />
      <main className="news-page">
        <div className="wrap impact-news">
          <ImpactIntro />
          <ApiState loading={loading} error={error} onRetry={reload} />
          {stories && (
            <div className="impact-grid">
              {stories.map((story, i) => (
                <ImpactCard key={story.id} story={story} index={i} to={`/news/${story.id}`} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
