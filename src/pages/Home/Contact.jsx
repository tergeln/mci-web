import Tr from '../../components/Tr/Tr';
import useReveal from '../../hooks/useReveal';

export default function Contact() {
  const [ref, className] = useReveal('wrap contact');
  return (
    <section id="contact">
      <div ref={ref} className={className}>
        <div className="eyebrow"><Tr mn="ХОЛБОО БАРИХ" en="CONTACT" /></div>
        <div className="contact-links">
          <a className="contact-row" href="mailto:magiccodeai@gmail.com">
            <small><Tr mn="И-мэйл" en="Email" /></small>
            <span>magiccodeai@gmail.com</span>
          </a>
          <div className="contact-row">
            <small><Tr mn="Байршил" en="Location" /></small>
            <span><Tr mn="Улаанбаатар, Монгол" en="Ulaanbaatar, Mongolia" /></span>
          </div>
        </div>
      </div>
    </section>
  );
}
