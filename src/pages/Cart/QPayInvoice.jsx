import { useLang } from '../../context/LanguageContext';

const safeQr = (image) => /^(https:\/\/|data:image\/png;base64,)/.test(image || '');
const safeLink = (link) => /^[a-z][a-z0-9+.-]*:/i.test(link || '') && !/^(javascript|data):/i.test(link);

// QPay-ийн QR болон банкны аппуудын холбоос.
export default function QPayInvoice({ invoice }) {
  const { t } = useLang();
  const links = (invoice.urls || []).filter((item) => safeLink(item.link));
  return <div className="cart-qpay">
    {safeQr(invoice.qrImage) && <img className="cart-qr" src={invoice.qrImage} alt="QPay QR" />}
    <p>{t('Банкны аппаараа QR-ыг уншуулж төлнө үү. Төлбөр орсны дараа эрх автоматаар нээгдэнэ.', 'Scan the QR with your bank app. Access opens automatically after payment.')}</p>
    {links.length > 0 && <div className="cart-qpay-apps">{links.map((item) => <a className="btn secondary" key={item.name} href={item.link}>{item.name}</a>)}</div>}
  </div>;
}
