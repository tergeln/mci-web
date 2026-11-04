import { useLang } from '../../context/LanguageContext';
import { BANK_ACCOUNTS } from '../../data/bankAccount';
import './BankAccounts.css';
import CopyButton from '../CopyButton/CopyButton';

export default function BankAccounts({ banks = BANK_ACCOUNTS }) {
  const { t } = useLang();
  return <div className="bank-choices">
    <h3>{t('Төлөх дансаа сонгоно уу', 'Choose a bank account')}</h3>
    <p className="bank-choices-note">{t('Доорх 2 дансны аль нэг рүү нийт дүнгээ нэг удаа шилжүүлнэ үү.', 'Transfer the full amount once to either of the two accounts below.')}</p>
    <div className="bank-choices-grid">{banks.map((bank, index) => <section className="bank-choice-card" key={bank.accountNumber} aria-label={bank.bankName}>
      <span className="bank-choice-number">{t('ДАНС', 'ACCOUNT')} {index + 1}</span>
      <h4>{bank.bankName}</h4>
      <dl><div><dt>IBAN</dt><dd className="bank-choice-iban"><span className="bank-iban-copy"><span>{bank.accountNumber}</span><CopyButton value={bank.accountNumber} label={t(`${bank.bankName} IBAN хуулах`, `Copy ${bank.bankName} IBAN`)} /></span></dd></div>{bank.accountName && <div><dt>{t('Данс эзэмшигч', 'Account holder')}</dt><dd>{bank.accountName}</dd></div>}</dl>
    </section>)}</div>
  </div>;
}
