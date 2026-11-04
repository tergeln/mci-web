import { useState } from 'react';
import { useLang } from '../../context/LanguageContext';
import { useCommerce } from '../../context/CommerceContext';
import { checkQPay, createWalletTopup, getMyWallet, reportBankTransfer, startQPay } from '../../api/commerce';
import { errorMessage } from '../../api/client';
import useApi from '../../hooks/useApi';
import QPayInvoice from '../Cart/QPayInvoice';
import BankAccounts from '../../components/BankAccounts/BankAccounts';

const money = (amount) => `${new Intl.NumberFormat('mn-MN').format(amount)}₮`;

export default function WalletPanel() {
  const { t, lang } = useLang();
  const { refresh } = useCommerce();
  const { data: wallet, loading, error: loadError, reload } = useApi(() => getMyWallet(), []);
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [invoice, setInvoice] = useState(null);

  async function run(action) {
    if (busy) return;
    setBusy(true); setError('');
    try { await action(); reload(); } catch (failure) { setError(errorMessage(failure, t)); } finally { setBusy(false); }
  }
  const typeLabel = (type) => ({ topup: t('Цэнэглэлт', 'Top-up'), purchase: t('Сургалтын төлбөр', 'Course payment') }[type] || type);
  const limits = wallet?.limits;
  const value = Number(amount);
  const valid = limits && Number.isInteger(value) && value >= limits.min && value <= limits.max;

  return <section className="account-card account-section">
    <div className="eyebrow">WALLET</div>
    <h2>{t('Миний хэтэвч', 'My wallet')}</h2>
    {loadError ? <p role="alert">{t('Хэтэвчийн мэдээлэл авч чадсангүй.', 'Could not load your wallet.')} <button className="text-link" onClick={reload}>{t('Дахин оролдох', 'Try again')}</button></p> : <>
      <p className="wallet-balance"><small>{t('Үлдэгдэл', 'Balance')}</small><strong>{loading && !wallet ? '…' : money(wallet?.balance ?? 0)}</strong></p>
      <p>{t('Хэтэвчээ цэнэглээд сургалтын төлбөрөө шууд төлөх боломжтой. Үлдэгдлийг бэлнээр буцаахгүй.', 'Top up your wallet to pay for courses instantly. Balances cannot be cashed out.')}</p>
      {error && <p className="account-error" role="alert">{error}</p>}

      <form className="wallet-topup" onSubmit={(event) => {
        event.preventDefault();
        if (valid) run(async () => { await createWalletTopup(value); setAmount(''); });
      }}>
        <label>{t('Цэнэглэх дүн (₮)', 'Top-up amount (₮)')}<input type="number" inputMode="numeric" min={limits?.min} max={limits?.max} step="1" value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
        <button className="btn" disabled={busy || !valid}>{t('Цэнэглэх', 'Top up')}</button>
      </form>

      {wallet?.topups?.map((order) => <div className="account-record wallet-open" key={order.id}>
        <div className="account-row"><strong>{money(order.amount)}</strong><span>{order.status === 'pending_review' ? t('Шилжүүлгийг шалгаж байна', 'Transfer under review') : t('Төлбөр хүлээгдэж байна', 'Awaiting payment')}</span></div>
        {order.status === 'pending_payment' && <>
          <BankAccounts banks={wallet.banks} />
          <p>{t('Гүйлгээний утга:', 'Transfer reference:')} <strong>{order.id}</strong></p>
          <div className="account-actions">
            <button className="btn secondary" disabled={busy} onClick={() => run(() => reportBankTransfer(order.id))}>{t('Шилжүүлсэн, шалгуулах', 'I transferred — request review')}</button>
            <button className="btn secondary" disabled={busy || !order.qpayAvailable} onClick={() => run(async () => setInvoice({ orderId: order.id, ...await startQPay(order.id) }))}>{order.qpayAvailable ? t('QPay-ээр төлөх', 'Pay with QPay') : t('QPay түр ажиллахгүй', 'QPay unavailable')}</button>
          </div>
          {invoice?.orderId === order.id && <>
            <QPayInvoice invoice={invoice} />
            <button className="btn secondary" disabled={busy} onClick={() => run(async () => { await checkQPay(order.id); await refresh(); })}>{t('Төлбөр шалгах', 'Check payment')}</button>
          </>}
        </>}
      </div>)}

      {wallet?.transactions?.length > 0 && <>
        <h3>{t('Гүйлгээний түүх', 'Transactions')}</h3>
        {wallet.transactions.map((row) => <div className="account-row" key={row.id}>
          <span>{typeLabel(row.type)}<small> · {new Date(row.createdAt).toLocaleDateString(lang === 'mn' ? 'mn-MN' : 'en-US')}</small></span>
          <strong>{row.amount > 0 ? '+' : '−'}{money(Math.abs(row.amount))}</strong>
        </div>)}
      </>}
    </>}
  </section>;
}
