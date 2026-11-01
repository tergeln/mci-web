import Tr from '../../components/Tr/Tr';
import './contact.css';
export default function Contact() {
  return <section id="contact" aria-label="Contact Magic Code AI">
    <div className="wrap contact-minimal">
      <a className="contact-logo" href="/#home" aria-label="Magic Code AI home"><img src="/assets/contact-logo.svg" alt="Magic Code AI" width="112" height="70" /></a>
      <div className="contact-email-group"><h2 className="contact-heading"><Tr mn="Холбоо барих" en="Get in touch" /></h2>
      <a className="contact-mail" href="mailto:magiccodeai@gmail.com">magiccodeai@gmail.com</a></div>
      <a className="contact-facebook" href="https://www.facebook.com/profile.php?id=61576967122971" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.03 4.39 11.03 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.88v2.27h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z"/></svg><span>Facebook</span><span aria-hidden="true">↗</span></a>
    </div>
  </section>;
}
