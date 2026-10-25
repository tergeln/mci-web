import AccountMenu from '../AccountMenu';
import { Link } from 'react-router-dom';
import { useLang } from '../../context/LanguageContext';
import Tr from '../Tr/Tr';
import BrandLogo from '../BrandLogo/BrandLogo';
import '../../styles/subpage.css';

// courses, news, news-detail хуудасны header: logo + "буцах" + хэлний товч
export default function SimpleNavbar({ logoTo, backTo, back }) {
  const { lang, toggleLang } = useLang();
  return (
    <header className="subpage-header">
      <div className="wrap">
        <Link className="brand" to={logoTo} aria-label="Magic Code AI">
          <BrandLogo />
        </Link>
        <Link className="news-back" to={backTo}>
          <Tr text={back} />
        </Link>
        <button className="language" id="newsLang" onClick={toggleLang}>
          {lang === 'mn' ? 'EN' : 'MN'}
        </button>
        <AccountMenu />
      </div>
    </header>
  );
}
