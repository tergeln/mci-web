import { useEffect, useState } from 'react';
import Tr from '../../../components/Tr/Tr';
import Constellation from '../../../components/canvas/Constellation';
import HeroBackdrop from './HeroBackdrop';
import HeroVisual from './HeroVisual';

// `html.hero-in-view` – hero дэлгэцийн дээд хагаст байх үед body/canvas-ын дэвсгэрийг өөрчилдөг.
function useHeroInView() {
  useEffect(() => {
    const sync = () => {
      const home = document.getElementById('home');
      if (!home) return;
      document.documentElement.classList.toggle('hero-in-view', home.getBoundingClientRect().bottom > window.innerHeight * 0.5);
    };
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
    return () => {
      window.removeEventListener('scroll', sync);
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
          <h1><Tr mn="Санаагаа<br>бүтээл болго." en="Turn ideas<br>into reality." /></h1>
          <p>
            <Tr
              mn="Таны бизнест зориулсан веб хөгжүүлэлт, программчлал, өгөгдөл болон хиймэл оюуны сургалтыг бид санал болгож байна."
              en="We offer web development for your business and training in programming, data and artificial intelligence."
            />
          </p>
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
