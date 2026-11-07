import PhoneOrderNotice from '../../components/PhoneOrderNotice';
import { canPayOnline, splitCartCourses } from '../../data/ordering';
import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCommerce } from '../../context/CommerceContext';
import { useLang } from '../../context/LanguageContext';
import { getCourses } from '../../api/courses';
import { checkQPay, createCourseOrder, reportBankTransfer, startQPay } from '../../api/commerce';
import { errorMessage } from '../../api/client';
import QPayInvoice from './QPayInvoice';
import BankAccounts from '../../components/BankAccounts/BankAccounts';
import CopyButton from '../../components/CopyButton/CopyButton';
import useApi from '../../hooks/useApi';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import ContentImage from '../../components/ContentImage/ContentImage';
import { cartTotal, hasCoursePrice } from '../../data/coursePricing';
import './cart.css';

const statusLabel = (status, t) => ({
  awaiting_quote: t('Үнийн дүн баталгаажихыг хүлээж байна', 'Awaiting confirmed price'),
  pending_payment: t('Төлбөр хүлээгдэж байна', 'Awaiting payment'),
  pending_review: t('Шилжүүлгийг шалгаж байна', 'Transfer under review'),
  paid: t('Төлбөр баталгаажсан', 'Payment confirmed'),
  cancelled: t('Цуцлагдсан', 'Cancelled'),
}[status] || t('Шалгаж байна', 'Processing'));

export default function CartPage() {
  const { user } = useAuth();
  const { cart, removeCourse, orders, refresh, loading, error: loadError } = useCommerce();
  const { lang, t } = useLang();
  const { data: catalog, loading: catalogLoading, error: catalogError, reload } = useApi((signal) => getCourses({ signal }), []);
  const [params, setParams] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reviewNotice, setReviewNotice] = useState('');
  const [method, setMethod] = useState('bank');
  const [qpay, setQpay] = useState(null);
  const active = user ? orders.find((order) => order.id === params.get('order')) : null;
  useEffect(() => {
    if (!['pending_payment', 'pending_review'].includes(active?.status)) return;
    const orderId = active.id;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      Promise.resolve(qpay ? checkQPay(orderId) : null).catch(() => {}).finally(() => refresh());
    }, 15000);
    return () => window.clearInterval(timer);
  }, [active?.id, active?.status, qpay, refresh]);
  const items = (catalog || []).filter((course) => cart.includes(course.id));
  const { payable, contact } = splitCartCourses(items);
  const activeCanPay = active?.items?.length > 0 && active.items.every((item) => {
    const course = catalog?.find((course) => course.id === item.courseId);
    return course ? canPayOnline(course) : canPayOnline(item);
  });
  const total = cartTotal(payable);
  const amountKnown = total !== null;
  const money = (amount) => hasCoursePrice(amount) ? `${new Intl.NumberFormat('mn-MN').format(amount)}₮` : t('Үнэ баталгаажихыг хүлээж байна', 'Price to be confirmed');
  useDocumentTitle(t('Миний сагс — Magic Code AI', 'My cart — Magic Code AI'), { noindex: true });

  async function run(action) {
    if (busy) return;
    setBusy(true); setError('');
    try { await action(); } catch (failure) { setError(failure?.code ? errorMessage(failure, t) : t('Үйлдэл амжилтгүй. Дахин оролдоно уу.', 'Something went wrong. Please try again.')); }
    finally { setBusy(false); }
  }
  const checkout = () => run(async () => {
    if (!user || !payable.length || catalogLoading || catalogError || items.length !== cart.length) return;
    const order = await createCourseOrder({ userId: user.id, courseIds: payable.map((course) => course.id) });
    await refresh(); setParams({ order: order.id }); setMethod('bank'); setQpay(null);
  });
  return <main className="cart-page wrap">
    <div className="eyebrow">MAGIC CODE · {t('МИНИЙ САГС', 'MY CART')}</div>
    {error && <p className="form-error" role="alert">{error}</p>}
    {(loadError || catalogError) && <p role="alert">{t('Мэдээлэл авч чадсангүй.', 'Could not load information.')} <button className="text-link" onClick={() => { refresh(); reload(); }}>{t('Дахин оролдох', 'Retry')}</button></p>}
    {active ? <section className="cart-checkout">
      <div className="cart-panel">
        <div className="cart-heading"><h2>{t('Захиалга', 'Order')}</h2><button className="text-link" onClick={() => setParams({})}>{t('Сагс руу буцах', 'Back to cart')}</button></div>
        {active.items.map((item) => <div className="cart-order-line" key={item.courseId}><span>{item.title[lang]}</span><strong>{money(item.price)}</strong></div>)}
        <div className="cart-order-line"><strong>{t('Нийт', 'Total')}</strong><strong>{money(active.amount)}</strong></div>
        <p className="cart-status" role="status">{statusLabel(active.status, t)}</p>
        {active.status === 'paid' ? <><p>{t('Хичээлүүд “Миний сургалт” хэсэгт нээгдэнэ.', 'Your lessons are available in My learning once access is confirmed.')}</p><Link className="btn" to="/account">{t('Миний сургалт', 'My learning')}</Link></> : active.status === 'cancelled' ? <p>{t('Энэ захиалга цуцлагдсан.', 'This order was cancelled.')}</p> : !activeCanPay ? <PhoneOrderNotice /> : <>
          {active.status === 'awaiting_quote' && <p>{t('Сургалтын үнийн дүн хараахан ороогүй байна. magiccodeai@gmail.com хаягаар үнээ баталгаажуулсны дараа төлбөрөө хийнэ үү.', 'The course price is not configured yet. Confirm your total with magiccodeai@gmail.com before making a transfer.')}</p>}
          <div className="payment-options"><button type="button" aria-pressed={method === 'bank'} onClick={() => setMethod('bank')}>{t('Дансаар төлөх', 'Bank transfer')}</button><button type="button" aria-pressed={method === 'qpay'} onClick={() => setMethod('qpay')}>QPay</button></div>
          {method === 'bank' ? <div className="cart-bank">
            <BankAccounts banks={active.banks} />
            <div className="transfer-reference"><p>{t('Гүйлгээний утга дээр дараах кодыг бичнэ үү:', 'Use this code as the transfer reference:')}</p><div className="transfer-reference-value"><strong>{active.id}</strong><CopyButton value={active.id} label={t('Гүйлгээний утга хуулах', 'Copy transfer reference')} /></div></div>
            <p className="cart-verification-note" role="status">{t('Шилжүүлгээ хийсний дараа түр хүлээнэ үү. Бид таны гүйлгээг шалгаж баталгаажуулна.', 'After making your transfer, please wait while we verify your transaction.')}</p>
          </div> : <div className="cart-bank">
            <p>{active.qpayAvailable ? t('QPay нэхэмжлэх үүсгэн төлбөрөө төлнө үү.', 'Create a QPay invoice to pay.') : t('QPay одоогоор ажиллахгүй тул дансаар шилжүүлнэ үү.', 'QPay is currently unavailable. Please use bank transfer.')}</p>
            <button className="btn" disabled={busy || !active.qpayAvailable || active.status !== 'pending_payment' || !(active.amount > 0)} onClick={() => run(async () => { const invoice = await startQPay(active.id); setQpay(invoice); })}>{t('QPay нэхэмжлэх авах', 'Get QPay invoice')}</button>
            {qpay?.orderId === active.id && <QPayInvoice invoice={qpay} />}
          </div>}
          <p className="cart-note">{t('Төлбөр баталгаажсаны дараа хичээл үзэх эрх автоматаар нээгдэнэ.', 'Lesson access unlocks after payment confirmation.')}</p>
        </>}
        <button className="btn secondary" disabled={loading || busy} onClick={() => run(async () => {
          setReviewNotice('');
          if (activeCanPay && method === 'bank' && active.status === 'pending_payment' && active.amount > 0) {
            await reportBankTransfer(active.id, user.id);
            setReviewNotice(t('Админд шалгах хүсэлт илгээлээ. Гүйлгээг гараар шалгаж баталгаажуулах хүртэл түр хүлээнэ үү.', 'Your review request was sent to the admin. Please wait for manual payment verification.'));
          } else if (active.status === 'pending_review') {
            setReviewNotice(t('Таны хүсэлт админд очсон. Шалгаж баталгаажуулах хүртэл түр хүлээнэ үү.', 'Your request is already with the admin. Please wait for verification.'));
          }
          await refresh();
        })}>{activeCanPay && active.status === 'pending_payment' && method === 'bank' ? t('Шилжүүлсэн, шалгах хүсэлт илгээх', 'I transferred — request review') : t('Төлбөрийн төлөв шалгах', 'Check payment status')}</button>
        <p role="status" className="cart-note">{reviewNotice}</p>
      </div>
    </section> : <div className="cart-layout">
      <section className="cart-panel">
        <h2>{t('Сагсалсан сургалтууд', 'Your courses')}</h2>
        {catalogLoading && <p role="status">{t('Ачааллаж байна…', 'Loading…')}</p>}
        {!cart.length && <p>{t('Сагс хоосон байна. Суралцах сургалтаа сонгоорой.', 'Your cart is empty. Choose a course to begin.')}</p>}
        {items.map((course) => <article className="cart-item" key={course.id}>
          {course.image && <ContentImage image={course.image} sizes="140px" />}
          <div><h3>{course.title[lang]}</h3><p>{canPayOnline(course) ? money(course.price) : t('Төлбөрийн дүнд орохгүй', 'Not included in payment')} · {t('3 сарын эрх', '3 months access')}</p>{!canPayOnline(course) && <PhoneOrderNotice />}<button className="text-link cart-remove" onClick={() => { try { removeCourse(course.id); } catch { setError(t('Сагс хадгалж чадсангүй.', 'Could not save your cart.')); } }}>{t('Хасах', 'Remove')}</button></div>
        </article>)}
        <Link className="text-link" to="/courses">{t('Сургалт нэмж сонгох →', 'Explore more courses →')}</Link>
      </section>
      <aside className="cart-panel cart-summary"><h2>{t('Захиалгын дүн', 'Summary')}</h2><p className="cart-access-note">{t('Сургалт бүр 3 сарын эрхтэй.', 'Each course includes 3 months of access.')}</p><div className="cart-summary-count"><span>{t('Төлбөрт тооцох сургалт', 'Courses included in payment')}</span><span>{payable.length}</span></div><div className="cart-summary-total"><span>{t('Нийт төлөх', 'Total')}</span><strong>{amountKnown ? money(total) : money(null)}</strong></div>
        {payable.length > 0 && !user && <p>{t('Төлбөр рүү орохын өмнө нэвтрэх эсвэл бүртгүүлэх шаардлагатай.', 'Log in or sign up before checkout.')}</p>}
        {contact.length > 0 && <p>{t('Утсаар холбогдох сургалтууд төлбөрийн дүнд орохгүй.', 'Courses requiring contact are excluded from the payment total.')}</p>}
        {payable.length === 0 ? (contact.length > 0 ? <PhoneOrderNotice /> : null) : user ? <button className="btn" disabled={busy || loading || catalogLoading || !payable.length || !!loadError || !!catalogError || items.length !== cart.length} onClick={checkout}>{busy ? t('Бэлдэж байна…', 'Preparing…') : t('Худалдаж авах', 'Checkout')}</button> : <><Link className={`btn${!items.length ? ' cart-disabled' : ''}`} to="/login" state={{ from: '/cart' }}>{t('Нэвтэрч үргэлжлүүлэх', 'Log in to continue')}</Link><Link className="text-link" to="/register" state={{ from: '/cart' }}>{t('Бүртгүүлэх', 'Create an account')}</Link></>}
      </aside>
    </div>}
    {user && orders.length > 0 && <section className="cart-panel cart-orders"><h2>{t('Миний захиалгууд', 'My orders')}</h2>{orders.map((order) => <button className="cart-order-button" key={order.id} onClick={() => { setParams({ order: order.id }); setQpay(null); }}><span>{order.items.map((item) => item.title[lang]).join(', ')}</span><small>{statusLabel(order.status, t)}</small></button>)}</section>}
  </main>;
}
