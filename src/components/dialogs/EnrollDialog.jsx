import { useEffect, useRef, useState } from 'react';
import Tr from '../Tr/Tr';
import { useLang } from '../../context/LanguageContext';
import closeOnBackdrop from '../../hooks/dialogBackdrop';
import { homeCourses } from '../../data/courses';
import { createEnrollment, createPayment } from '../../api/enrollments';
import { USE_MOCK, errorMessage } from '../../api/client';

const PAYMENT_METHODS = ['qpay', 'bank'];

// request.course accepts a home course index or a catalog course object.
// `open` курс бүртгэл төлбөр, бусад нь хүлээлгийн жагсаалт. Эцсийн шийдвэрийг API-ийн status гаргана.
export default function EnrollDialog({ request, onOpenClassroom }) {
  const { lang, t } = useLang();
  const dialogRef = useRef(null);
  const [selected, setSelected] = useState(1);
  const [step, setStep] = useState('form');
  const [waitlist, setWaitlist] = useState(false);
  const [payment, setPayment] = useState(0);
  const [enrollment, setEnrollment] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!request) return;
    setSelected(request.course);
    setStep('form');
    setEnrollment(null);
    setError('');
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, [request]);

  const course = typeof selected === 'object' ? selected : homeCourses[selected];
  const isCourse = Boolean(course.open);
  const name = course.title[lang];

  const finish = (isWaitlist) => {
    setWaitlist(isWaitlist);
    setStep('success');
  };

  // POST /api/enrollments
  const onSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    try {
      const result = await createEnrollment({
        courseId: course.id,
        name: form.get('name'),
        email: form.get('email'),
        phone: form.get('phone'),
      });
      setEnrollment(result);
      if (result.status === 'waitlisted') finish(true);
      else setStep('payment');
    } catch (err) {
      setError(errorMessage(err, t));
    } finally {
      setBusy(false);
    }
  };

  // POST /api/payments
  const onPay = async () => {
    if (busy || !enrollment) return;
    setBusy(true);
    setError('');
    try {
      await createPayment({ enrollmentId: enrollment.id, method: PAYMENT_METHODS[payment] });
      finish(false);
    } catch (err) {
      setError(errorMessage(err, t));
    } finally {
      setBusy(false);
    }
  };

  const errorBox = error && <p className="form-error" role="alert">{error}</p>;

  return (
    <dialog id="enrollDialog" ref={dialogRef} onClick={closeOnBackdrop}>
      <div className="dialog-top">
        <h3 id="dialogTitle">
          {isCourse ? t('Сургалтад бүртгүүлэх', 'Course enrollment') : t('Хүлээлгийн жагсаалт', 'Join the waitlist')}
        </h3>
        <button className="icon-btn" aria-label={t('Хаах', 'Close')} onClick={() => dialogRef.current.close()}>×</button>
      </div>
      <div id="enrollStep" hidden={step !== 'form'}>
        <p className="muted" id="chosenCourse">{name}</p>
        <form id="enrollForm" onSubmit={onSubmit}>
          <label htmlFor="name"><Tr mn="Таны нэр" en="Your name" /></label>
          <input id="name" name="name" autoComplete="name" required maxLength={100} />
          <label htmlFor="email"><Tr mn="И-мэйл хаяг" en="Email address" /></label>
          <input id="email" name="email" type="email" autoComplete="email" required />
          <label htmlFor="phone"><Tr mn="Утасны дугаар" en="Phone number" /></label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" required pattern="[+0-9 \(\)\-]{8,20}" />
          {errorBox}
          <button className="btn full" id="enrollSubmit" disabled={busy}>
            {busy
              ? t('Илгээж байна', 'Sending')
              : isCourse ? t('Төлбөр рүү үргэлжлүүлэх', 'Continue to payment') : t('Жагсаалтад нэгдэх', 'Join waitlist')}
          </button>
        </form>
      </div>
      <div id="paymentStep" hidden={step !== 'payment'}>
        <div id="paymentSummary">
          <div className="summary-row"><span>{t('Сургалт', 'Course')}</span><strong>{name}</strong></div>
          <div className="summary-row"><span>{t('Төлбөр', 'Tuition')}</span><strong>{t('Баталгаажуулах', 'To be confirmed')}</strong></div>
        </div>
        <div className="payment-options">
          <button type="button" aria-pressed={payment === 0} onClick={() => setPayment(0)}>QPay</button>
          <button type="button" aria-pressed={payment === 1} onClick={() => setPayment(1)}>
            <Tr mn="Банкны шилжүүлэг" en="Bank transfer" />
          </button>
        </div>
        {payment === 1 ? (
          <div id="paymentNote" style={{ marginTop: '15px' }}>
            <div className="summary-row"><span>{t('Банк', 'Bank')}</span><strong>{t('Хаан банк', 'Khan Bank')}</strong></div>
            <div className="summary-row"><span>IBAN</span><strong style={{ overflowWrap: 'anywhere' }}>MN790005005031346583</strong></div>
            <div className="summary-row"><span>{t('Данс эзэмшигч', 'Account holder')}</span><strong>Энхтуяа Цогтбаатар</strong></div>
            <p className="muted" style={{ marginTop: '15px' }}>
              {t('Гүйлгээний утга дээр Gmail хаяг, утасны дугаараа бичнэ үү.', 'Please include your Gmail address and phone number in the transfer description.')}
            </p>
          </div>
        ) : (
          <p id="paymentNote" className="muted" style={{ fontSize: '11px', marginTop: '15px' }}>
            {t('QPay одоогоор ажиллахгүй тул дансаар шилжүүлнэ үү.', 'QPay is currently unavailable. Please pay by bank transfer.')}
          </p>
        )}
        {errorBox}
        <button className="btn full" id="finishPayment" disabled={busy} onClick={onPay}>
          {busy ? t('Илгээж байна', 'Sending') : t('Бүртгэлийг дуусгах', 'Finish enrollment')}
        </button>
        <button className="btn secondary full" id="backEnroll" disabled={busy} onClick={() => { setError(''); setStep('form'); }}>
          <Tr mn="Буцах" en="Back" />
        </button>
      </div>
      <div id="successStep" hidden={step !== 'success'}>
        <h3>{USE_MOCK ? t('Бүртгэл хадгалагдлаа ✓', 'Registration saved ✓') : t('Бүртгэл хүлээн авлаа ✓', 'Registration received ✓')}</h3>
        <p style={{ marginTop: '15px' }}>
          {USE_MOCK
            ? waitlist
              ? t('Хүлээлгийн жагсаалтад нэгдэх бол magiccodeai@gmail.com руу бичээрэй.', 'Email magiccodeai@gmail.com to join the waitlist.')
              : t('Бүртгэл энэ хөтөч дээр хадгалагдлаа. Төлбөрөө баталгаажуулах бол magiccodeai@gmail.com руу холбогдоорой.', 'Your registration is saved in this browser. Contact magiccodeai@gmail.com to confirm your payment.')
            : waitlist
              ? t('Та хүлээлгийн жагсаалтад нэгдлээ. Сургалт нээгдэхэд бид тантай холбогдоно.', 'You have joined the waitlist. We will contact you when the course opens.')
              : t('Бүртгэл хүлээн авлаа. Төлбөр баталгаажсаны дараа бид тантай холбогдоно.', 'Your registration has been received. We will contact you once payment is confirmed.')}
        </p>
        {!waitlist && (
          <button
            type="button"
            className="btn full"
            onClick={() => {
              dialogRef.current.close();
              onOpenClassroom(course);
            }}
          >
            <Tr mn="Хичээл үзэх ▷" en="Watch lessons ▷" />
          </button>
        )}
      </div>
    </dialog>
  );
}
