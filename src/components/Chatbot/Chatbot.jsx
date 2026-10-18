import { useEffect, useRef, useState } from 'react';
import { useLang } from '../../context/LanguageContext';
import reducedMotion from '../../hooks/reducedMotion';
import { chatGreeting, quickQuestions } from '../../data/chat';
import { sendChatMessage } from '../../api/chat';
import { errorMessage } from '../../api/client';
import createBurst from './magicBurst';

// open/onOpenChange-ийг Home барина (Contact хэсгийн товч мөн chat-ийг нээдэг).
export default function Chatbot({ open, onOpenChange }) {
  const { lang, t } = useLang();
  const toggleRef = useRef(null);
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const messagesRef = useRef(null);
  const pending = useRef(false);
  const replying = useRef(false);
  const nextId = useRef(0);
  const timers = useRef([]);
  const burstRef = useRef(null);
  const prevOpen = useRef(open);
  const prevLang = useRef(lang);
  const [messages, setMessages] = useState([]);

  const later = (fn, ms) => {
    timers.current.push(setTimeout(fn, ms));
  };

  // inert атрибутыг React 18 prop-оор дэмждэггүй тул ref-ээр тавина.
  useEffect(() => {
    toggleRef.current.inert = open;
    if (prevOpen.current !== open) {
      if (open) {
        setMessages((m) => (m.length ? m : [{ text: t(chatGreeting.open.mn, chatGreeting.open.en), user: false }]));
        inputRef.current.focus();
      } else {
        toggleRef.current.focus({ preventScroll: true });
      }
      prevOpen.current = open;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Хэл солиход өмнөх мессежүүдийг нэг мэндчилгээгээр солино.
  useEffect(() => {
    if (prevLang.current !== lang) {
      setMessages((m) => (m.length ? [{ text: t(chatGreeting.relang.mn, chatGreeting.relang.en), user: false }] : m));
      prevLang.current = lang;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    const el = messagesRef.current;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) onOpenChange(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      if (burstRef.current) burstRef.current.remove();
    },
    [],
  );

  const openWithMagic = () => {
    if (pending.current) return;
    if (reducedMotion()) {
      onOpenChange(true);
      return;
    }
    pending.current = true;
    const button = toggleRef.current;
    const panel = panelRef.current;
    const burst = createBurst(button.getBoundingClientRect());
    burstRef.current = burst;
    document.body.append(burst);
    button.classList.add('magic-casting');
    later(() => {
      onOpenChange(true);
      panel.classList.remove('magic-opening');
      void panel.offsetWidth;
      panel.classList.add('magic-opening');
      pending.current = false;
    }, 380);
    later(() => button.classList.remove('magic-casting'), 520);
    later(() => {
      burst.remove();
      panel.classList.remove('magic-opening');
    }, 1700);
  };

  // POST /api/chat. Хариу ирэх хүртэл "…" бөмбөлөг харуулж, ирэхээр нь солино.
  const ask = async (question) => {
    if (replying.current) return;
    replying.current = true;
    const id = (nextId.current += 1);
    const history = messages.map((m) => ({ role: m.user ? 'user' : 'assistant', content: m.text }));
    setMessages((m) => [...m, { text: question, user: true }, { id, text: '…', user: false, typing: true }]);
    let text;
    try {
      ({ reply: text } = await sendChatMessage({ message: question, lang, history }));
    } catch (err) {
      text = errorMessage(err, t);
    }
    setMessages((m) => m.map((msg) => (msg.id === id ? { text, user: false } : msg)));
    replying.current = false;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const value = inputRef.current.value.trim();
    if (value) {
      ask(value);
      inputRef.current.value = '';
    }
  };

  return (
    <>
      <button
        className="chat-toggle"
        id="chatToggle"
        ref={toggleRef}
        aria-label={t('Шидэт туслахыг нээх', 'Open magic assistant')}
        aria-expanded={open}
        onClick={() => (open ? onOpenChange(false) : openWithMagic())}
      >
        <span className="chat-robot-portrait" aria-hidden="true" />
      </button>
      <aside className="chat" id="chat" ref={panelRef} hidden={!open} aria-label="Magic Code assistant">
        <div className="chat-head">
          <div className="bot-avatar">
            <img src="/assets/chatbot-wizard.png" alt="" width="48" height="48" />
          </div>
          <div>
            <strong>{t('Шидэт туслах', 'Magic assistant')}</strong>
          </div>
          <button className="icon-btn" id="closeChat" aria-label={t('Туслахыг хаах', 'Close assistant')} onClick={() => onOpenChange(false)}>×</button>
        </div>
        <div className="messages" id="messages" ref={messagesRef} aria-live="polite">
          {messages.map((m, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={i} className={`bubble${m.user ? ' user' : ''}`} aria-busy={m.typing || undefined}>{m.text}</div>
          ))}
        </div>
        <div className="quick">
          {quickQuestions.map((q) => (
            <button key={q.key} onClick={() => ask(q[lang])}>{q[lang]}</button>
          ))}
        </div>
        <form id="chatForm" onSubmit={onSubmit}>
          <input
            id="chatInput"
            ref={inputRef}
            aria-label={t('Таны зурвас', 'Your message')}
            placeholder={t('Асуух зүйлээ бичээрэй…', 'Type your question…')}
            required
            maxLength={500}
          />
          <button aria-label={t('Илгээх', 'Send')}>↑</button>
        </form>
      </aside>
    </>
  );
}
