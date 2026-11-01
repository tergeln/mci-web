import { useEffect, useState } from 'react';
import Tr from '../../../components/Tr/Tr';
import Constellation from '../../../components/canvas/Constellation';
import HeroBackdrop from './HeroBackdrop';
import HeroVisual from './HeroVisual';

// `html.hero-in-view` – hero дэлгэцийн дээд хагаст байх үед body/canvas-ын дэвсгэрийг өөрчилдөг.
function useHeroInView() {
  useEffect(() => {
    const home = document.getElementById('home');
    if (!home) return undefined;
    let observer;
    const sync = () => {
      observer?.disconnect();
      observer = new IntersectionObserver(([entry]) => {
        document.documentElement.classList.toggle('hero-in-view', entry.isIntersecting);
      }, { rootMargin: `-${window.innerHeight * 0.5}px 0px 0px 0px` });
      observer.observe(home);
    };
    window.addEventListener('resize', sync);
    sync();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', sync);
      document.documentElement.classList.remove('hero-in-view');
    };
  }, []);
}

export default function Hero() {
  const [selected, setSelected] = useState(-1);
  useHeroInView();

  return (
    <div className="wrap" id="home">
      <HeroBackdrop />
      <Constellation selected={selected} onSelect={setSelected} />
      <div className="hero">
        <div>
          <div className="eyebrow"><Tr mn="ИРЭЭДҮЙГ ХАМТДАА БҮТЭЭЕ" en="BUILD YOUR NEXT CHAPTER" /></div>
          <h1><Tr mn="Zero to Pro" en="Zero to Pro" /></h1>
          <p>
            <Tr
              mn="Та манайхаас ирээдүйн технологийн ур чадварыг эзэмшиж, бизнестээ тохирсон веб хөгжүүлэлтийн шийдэл авах боломжтой."
              en="Build skills in the technologies of tomorrow and find web development solutions for your business."
            />
          </p>
          <div className="hero-particle-space" aria-hidden="true"><img className="hero-mobile-mark" src="/assets/mobile-particle-logo.svg" width="400" height="250" alt="" /></div>
          <div className="actions">
            <a className="btn" href="#courses"><Tr mn="Сургалт үзэх" en="Explore courses" /></a>
            <a className="btn secondary" href="#activities"><Tr mn="Вэб захиалах" en="Order a website" /></a>
          </div>
          <div className="hero-foot">
            <div className="avatars">
              <i>MC</i>
              <i>AI</i>
              <i>&lt;/&gt;</i>
              <i>✦</i>
            </div>
            <span><Tr mn="Суралц. Турш. Бүтээ. Хамтдаа." en="Learn. Experiment. Build. Together." /></span>
          </div>
        </div>
        <HeroVisual />
      </div>
    </div>
  );
}
