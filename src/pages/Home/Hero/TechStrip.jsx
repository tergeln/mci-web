import Tr from '../../../components/Tr/Tr';

const partners = [
  { name: 'Хушхан брэнд', en: 'HushKhan', logo: 'hushkhan' },
  { name: 'Монгол Улсын Их Сургууль', en: 'National University of Mongolia', logo: 'num' },
  { name: 'БИД ББСБ', en: 'BID NBFI', logo: 'bid' },
  { name: 'ХААН Банк', en: 'Khan Bank', logo: 'khan-bank' },
];

export default function TechStrip() {
  return (
    <section className="partners-strip" aria-label="Хамтран ажиллагч байгууллагууд">
      <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
        <defs>
          <filter id="partner-remove-white" colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
            <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -10 -10 -10 0 29" result="mask" />
            <feComposite in="SourceGraphic" in2="mask" operator="in" />
          </filter>
        </defs>
      </svg>
      <div className="partners-heading"><Tr mn="Хамтран ажиллагч байгууллагууд" en="Our partners" /></div>
      <div className="strip">
        <div className="tech-flow-track">
          {[0, 1].map((group) => (
            <div key={group} className="tech-flow-group" aria-hidden={group ? true : undefined}>
              {partners.map((partner) => (
                <div className="partner" key={partner.logo}>
                  <div className={`partner-logo partner-logo--${partner.logo}`}><img src={`/assets/partners/${partner.logo}.png`} alt="" width="72" height="72" /></div>
                  <span><Tr mn={partner.name} en={partner.en} /></span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
