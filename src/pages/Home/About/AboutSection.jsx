import Tr from '../../../components/Tr/Tr';
import useReveal from '../../../hooks/useReveal';
import ImpactNews from './ImpactNews';

export default function AboutSection() {
  const [copyRef, copyClass] = useReveal('about-copy');
  return (
    <section className="about" id="about">
      <div className="wrap about-grid">
        <div className="about-picture">
          <div className="picture-note">
            <strong><Tr mn="Эхний алхмаас ид шид эхэлнэ." en="Magic happens when you start." /></strong>
            <br />
            <span className="muted"><Tr mn="Улаанбаатар, Монгол" en="Ulaanbaatar, Mongolia" /></span>
          </div>
        </div>
        <div ref={copyRef} className={copyClass}>
          <div className="eyebrow"><Tr mn="БИДНИЙ ТУХАЙ" en="OUR STORY" /></div>
          <h2><Tr mn="Технологийг ойртуулж,<br><em>боломжийг нээнэ.</em>" en="Making technology<br><em>feel possible.</em>" /></h2>
          <p>
            <Tr
              mn="Magic Code AI бол программчлал, өгөгдөл, хиймэл оюуныг бодитоор туршиж суралцах орон зай. Бид онолыг практиктай холбож, суралцагч бүрийг өөрийн санааг бүтээл болгоход чиглүүлнэ."
              en="Magic Code AI is a space to explore programming, data and artificial intelligence. We connect concepts with practice and help learners turn their own ideas into things that work."
            />
          </p>
          <div className="values">
            <div>
              <b><Tr mn="Хамтдаа илүү хол" en="Better together" /></b>
              <span><Tr mn="Асууж, туршиж, хамтдаа өснө" en="Ask, experiment and grow" /></span>
            </div>
          </div>
        </div>
      </div>
      <ImpactNews />
    </section>
  );
}
