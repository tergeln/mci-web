import { useLang } from '../context/LanguageContext';
import { ORDER_PHONE } from '../data/ordering';

export default function PhoneOrderNotice() {
  const { t } = useLang();
  return <div className="phone-order-notice">
    <p>{t('Одоогоор захиалгыг зөвхөн утсаар холбогдон авна.', 'Orders are currently accepted by phone only.')}</p>
    {ORDER_PHONE && <a className="btn" href={`tel:${ORDER_PHONE.replace(/[^+\d]/g, '')}`}>{t('Захиалах: ', 'Call to order: ')}{ORDER_PHONE}</a>}
  </div>;
}
