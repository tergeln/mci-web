import { useLang } from '../../context/LanguageContext';
import { liveStrip } from '../../data/skills';

export default function LiveStrip() {
  const { lang } = useLang();
  return (
    <div className="live-strip" aria-hidden="true">
      <div className="live-strip-track" key={lang}>
        {[0, 1].map((group) => (
          <div className="live-strip-group" key={group}>
            {liveStrip[lang].map((label) => <span className="live-strip-item" key={label}>{label}</span>)}
          </div>
        ))}
      </div>
    </div>
  );
}
