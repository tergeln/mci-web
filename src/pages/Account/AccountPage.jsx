import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { LearningProgress, AccountProfile } from './AccountDetails';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import { errorMessage } from '../../api/client';
import ClassroomDialog from '../../components/dialogs/ClassroomDialog';
import { cartProducts } from '../../data/merch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import WorkspaceHeading from './WorkspaceHeading';
import WorkspaceTabs from './WorkspaceTabs';
import './account.css';

const LEARNER_TABS = [
  { id: 'overview', mn: 'Тойм', en: 'Overview' },
  { id: 'learning', mn: 'Миний сургалт', en: 'My learning' },
  { id: 'products', mn: 'Дэлгүүр', en: 'Shop' },
  { id: 'progress', mn: 'Суралцах явц', en: 'Progress' },
  { id: 'profile', mn: 'Миний мэдээлэл', en: 'My profile' },
  { id: 'history', mn: 'Түүх', en: 'History' },
];

function LearnerPanel({ id, activeTab, children }) {
  return <div id={`learner-${id}`} className="learner-panel" role="tabpanel" aria-labelledby={`learner-tab-${id}`} tabIndex={0} hidden={activeTab !== id}>{children}</div>;
}

export default function AccountPage() {
  const { user, logout, records, addRecord } = useAuth();
  const { t, lang } = useLang();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [request, setRequest] = useState(null);
  const [cart, setCart] = useState([]);
  const [notice, setNotice] = useState('');
  const [noticeError, setNoticeError] = useState(false);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [progressVersion, setProgressVersion] = useState(0);
  const [expandedRecord, setExpandedRecord] = useState(null);
  useDocumentTitle(t('Миний хэсэг — Magic Code AI', 'My account — Magic Code AI'));
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  const visible = records.filter((record) => record.userId === user.id);
  const filtered = visible.filter((record) => (typeFilter === 'all' || record.type === typeFilter) && (statusFilter === 'all' || record.status === statusFilter) && `${record.id} ${record.items.join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  const watch = () => setRequest((previous) => ({ id: (previous?.id || 0) + 1 }));
  const enrolled = visible.some((record) => record.type === 'course' && record.status !== 'cancelled');
  const statusName = (status) => status === 'done' ? t('Шийдвэрлэсэн', 'Completed') : status === 'cancelled' ? t('Цуцалсан', 'Cancelled') : t('Шинэ', 'New');
  function openTab(id) {
    setActiveTab(id);
    document.getElementById(`learner-tab-${id}`)?.focus({ preventScroll: true });
  }
  function saveRecord(type, items, message) {
    try { addRecord(type, items); setNotice(message); setNoticeError(false); return true; }
    catch (error) { setNotice(errorMessage(error, t)); setNoticeError(true); return false; }
  }

  return <><main className="account-page workspace-page learner-page wrap">
    <WorkspaceHeading
      eyebrow="MAGIC CODE · LEARNING SPACE"
      title={t('Сайн уу, суралцагч!', 'Hello, learner!')}
      description={`${user.email} · ${t('Хэрэглэгчийн эрх', 'Student account')}`}
      onLogout={logout}
    />
    <div className="workspace-tabs-bar"><WorkspaceTabs tabs={LEARNER_TABS} activeTab={activeTab} onChange={setActiveTab} prefix="learner" label={t('Суралцагчийн хэсгүүд', 'Learner dashboard sections')} /></div>
    <p className="account-note">{t('Demo орчин · Бодит төлбөр хийгдэхгүй. Мэдээлэл зөвхөн энэ хөтөч дээр хадгалагдана.', 'Demo environment · No real payments. Data is saved only in this browser.')}</p>
    <p role="status" className={`account-feedback${noticeError ? ' account-error' : ''}`}>{notice}</p>

    <LearnerPanel id="overview" activeTab={activeTab}>
      <div className="account-stats">{[
        [t('Миний сургалт', 'My courses'), Number(enrolled)],
        [t('Бүтээгдэхүүний захиалга', 'Product orders'), visible.filter((record) => record.type === 'order').length],
        [t('Сургалтын бүртгэл', 'Course enrollments'), visible.filter((record) => record.type === 'course').length],
      ].map(([label, value]) => <div className="account-card" key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>
      <div className="account-card account-section learner-shortcuts"><h2>{t('Үргэлжлүүлэн суралцъя', 'Keep learning')}</h2><p>{t('Сургалтаа нээж, суралцах явцаа шалгаарай.', 'Open your lessons and review your learning progress.')}</p><div className="account-actions"><button className="btn" onClick={() => openTab('learning')}>{t('Миний сургалт →', 'My learning →')}</button><button className="btn secondary" onClick={() => openTab('progress')}>{t('Суралцах явц →', 'View progress →')}</button></div></div>
    </LearnerPanel>

    <LearnerPanel id="learning" activeTab={activeTab}>
      <section className="account-card account-section"><div className="eyebrow">01 · LEARN</div><h2>{t('Миний сургалт', 'My learning')}</h2><h3>{t('Өгөгдлийн шинжилгээ ба Power BI', 'Data Analysis & Power BI')}</h3><p>{t('4 нээлттэй жишээ хичээл · SQL, Python, Power BI', '4 public preview lessons · SQL, Python, Power BI')}</p>
        <div className="account-actions"><button className="btn" onClick={watch}>{t('Хичээл үзэх ▶', 'Watch lessons ▶')}</button><button className="btn secondary" disabled={enrolled} onClick={() => saveRecord('course', ['Data Analysis & Power BI'], t('Demo сургалтын бүртгэл амжилттай.', 'Demo enrollment created.'))}>{enrolled ? t('✓ Бүртгэгдсэн', '✓ Enrolled') : t('Demo элсэлт', 'Demo enrollment')}</button></div>
        <Link className="text-link" to="/courses">{t('Бүх сургалт үзэх →', 'Explore all courses →')}</Link>
      </section>
    </LearnerPanel>

    <LearnerPanel id="products" activeTab={activeTab}>
      <section className="account-card account-section"><div className="eyebrow">02 · PRODUCTS</div><h2>{t('Demo дэлгүүр', 'Demo shop')}</h2><p>{t('Жишээ бүтээгдэхүүн сонгож захиалгын урсгалыг туршаарай.', 'Select concept products to try the order flow.')}</p>
        {cartProducts.map((product, index) => <div className="account-row" key={product.en}><span>{product.emblem} {product[lang]}</span><button className="btn secondary" onClick={() => { setCart((previous) => [...previous, index]); setNotice(''); }}>+ {t('Нэмэх', 'Add')}</button></div>)}
        {cart.length > 0 && <div className="account-cart"><h3>{t('Миний сагс', 'My bag')}</h3>{cartProducts.map((product, index) => {
          const quantity = cart.filter((id) => id === index).length;
          return quantity > 0 && <div className="account-row" key={product.en}><span>{product[lang]}</span><div className="account-quantity"><button type="button" aria-label={`${product[lang]} −1`} onClick={() => setCart((previous) => { const next = [...previous]; next.splice(next.indexOf(index), 1); return next; })}>−</button><output aria-live="polite">{quantity}</output><button type="button" aria-label={`${product[lang]} +1`} onClick={() => setCart((previous) => [...previous, index])}>+</button></div></div>;
        })}<small>{t('Жишээ бүтээгдэхүүн · Үнэ тогтоогоогүй, төлбөр авахгүй.', 'Concept products · No payment required.')}</small></div>}
        <div className="account-actions"><button className="btn" disabled={!cart.length} onClick={() => { if (saveRecord('order', cart.map((index) => cartProducts[index][lang]), t('Demo захиалга үүслээ. Түүх табаас харна уу.', 'Demo order created. See the History tab.'))) setCart([]); }}>{t('Demo захиалах', 'Place demo order')} ({cart.length})</button><button className="btn secondary" disabled={!cart.length} onClick={() => setCart([])}>{t('Цэвэрлэх', 'Clear')}</button></div>
      </section>
    </LearnerPanel>

    <LearnerPanel id="progress" activeTab={activeTab}><LearningProgress key={`${user.id}-${progressVersion}`} onWatch={watch} /></LearnerPanel>
    <LearnerPanel id="profile" activeTab={activeTab}><AccountProfile key={user.id} /></LearnerPanel>

    <LearnerPanel id="history" activeTab={activeTab}>
      <section id="account-history" className="account-card account-section"><h2>{t('Миний бүртгэл, захиалгын түүх', 'My enrollment & order history')}</h2>
        <div className="account-filters"><label>{t('Хайх', 'Search')}<input type="search" placeholder={t('Нэр, дугаар…', 'Item, ID…')} value={query} onChange={(event) => setQuery(event.target.value)} /></label><label>{t('Төрөл', 'Type')}<select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="all">{t('Бүгд', 'All')}</option><option value="order">{t('Захиалга', 'Orders')}</option><option value="course">{t('Сургалт', 'Enrollments')}</option></select></label><label>{t('Төлөв', 'Status')}<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">{t('Бүгд', 'All')}</option>{['new', 'done', 'cancelled'].map((status) => <option key={status} value={status}>{statusName(status)}</option>)}</select></label></div>
        <p>{t('Илэрц', 'Results')}: {filtered.length}</p>
        {!filtered.length && <p className="account-empty">{t('Тохирох бүртгэл, захиалга олдсонгүй.', 'No matching enrollments or orders.')}</p>}
        {filtered.map((record) => <div className="account-record" key={record.id}><div className="account-row"><div><strong>{record.type === 'course' ? t('Сургалт', 'Course') : t('Захиалга', 'Order')} · {[...new Set(record.items)].join(', ')}</strong><p>{new Date(record.createdAt).toLocaleDateString(lang === 'mn' ? 'mn-MN' : 'en-US')} · #{record.id.slice(0, 8)}</p></div><span className="account-badge">{statusName(record.status)}</span></div>
          <button className="text-link account-help" aria-expanded={expandedRecord === record.id} onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}>{expandedRecord === record.id ? t('Хураах ↑', 'Collapse ↑') : t('Дэлгэрэнгүй ↓', 'View details ↓')}</button>
          {expandedRecord === record.id && <div className="account-record-detail"><p>{t('Бүртгэлийн дугаар', 'Reference')}: {record.id}</p><p>{t('Үүссэн огноо', 'Created')}: {new Date(record.createdAt).toLocaleString(lang === 'mn' ? 'mn-MN' : 'en-US')}</p>{[...new Set(record.items)].map((item) => <div className="account-row" key={item}><span>{item}</span><strong>× {record.items.filter((value) => value === item).length}</strong></div>)}<small>{t('Demo бүртгэл · Бодит төлбөрийн баримт биш.', 'Demo record · No real payment receipt.')}</small></div>}
        </div>)}
      </section>
    </LearnerPanel>
  </main><ClassroomDialog key={user.id} request={request} onProgress={() => setProgressVersion((version) => version + 1)} /></>;
}
