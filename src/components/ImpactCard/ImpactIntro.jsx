import Tr from '../Tr/Tr';
import useReveal from '../../hooks/useReveal';

// "БИДНИЙ ОРОЛЦОО" гарчиг + тайлбар. Нүүр хуудсанд `.section-head` нь reveal анимацитай.
export default function ImpactIntro({ animate = false }) {
  const [ref, revealClass] = useReveal('section-head');
  return (
    <>
      <div ref={ref} className={animate ? revealClass : 'section-head'}>
        <div>
          <div className="eyebrow"><Tr mn="БИДНИЙ ОРОЛЦОО" en="OUR IMPACT" /></div>
          <h2><Tr mn="Бидний хийсэн <em>нийгэмд тустай ажлууд.</em>" en="Our work <em>for the community.</em>" /></h2>
        </div>
      </div>
      <p className="impact-sample">
        <Tr
          mn="Хамт олны санаачилга, боловсролын дэмжлэг, нийгэмд чиглэсэн ажлуудын түүх."
          en="Stories of community initiatives, educational support and social impact."
        />
      </p>
    </>
  );
}
