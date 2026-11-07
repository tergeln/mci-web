import { useLang } from '../context/LanguageContext';
import { ORDER_PHONE } from '../data/ordering';

export default function PhoneOrderNotice() {
  const { t } = useLang();
  return <div className="phone-order-notice">
    <p>{t('Энэ сургалтыг үзэхийн тулд холбогдоно уу.', 'Please contact us to access this course.')}</p>
    {ORDER_PHONE && <a className="btn" href={`tel:${ORDER_PHONE.replace(/[^+\d]/g, '')}`}>{t('Холбогдох: ', 'Call: ')}{ORDER_PHONE}</a>}
  </div>;
}
