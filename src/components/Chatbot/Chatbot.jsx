import { useEffect, useRef, useState } from 'react';
import { useLang } from '../../context/LanguageContext';
import { chatGreeting, quickQuestions } from '../../data/chat';
import { sendChatMessage } from '../../api/chat';
import { errorMessage } from '../../api/client';
import getChatViewport from './chatViewport';

const mascotImage = '/assets/chatbot-hedgehog.png';

// open/onOpenChange-ийг Home барина (Contact хэсгийн товч мөн chat-ийг нээдэг).
export default function Chatbot({ open, onOpenChange }) {
  const { lang, t } = useLang();
  const toggleRef = useRef(null);
  const panelRef = useRef(null);
  const inputRef = useRef(null);
  const messagesRef = useRef(null);
  const replying = useRef(false);
  const fullViewportRef = useRef({ height: window.innerHeight, width: window.innerWidth });
  const nextId = useRef(0);
  const prevOpen = useRef(open);
  const prevLang = useRef(lang);
  const [messages, setMessages] = useState([]);

  // inert атрибутыг React 18 prop-оор дэмждэггүй тул ref-ээр тавина.
  useEffect(() => {
    toggleRef.current.inert = open;
    if (prevOpen.current !== open) {
      if (open) {
        setMessages((m) => (m.length ? m : [{ text: t(chatGreeting.open.mn, chatGreeting.open.en), user: false }]));
        inputRef.current.focus({ preventScroll: true });
      } else {
        toggleRef.current.focus({ preventScroll: true });
      }
      prevOpen.current = open;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Follow the visible viewport so the input sits directly above the phone keyboard.
  useEffect(() => {
    if (!open || !window.visualViewport) return;
    const viewport = window.visualViewport;
    const panel = panelRef.current;
    let fullHeight = Math.max(fullViewportRef.current.height, window.innerHeight);
    let viewportWidth = fullViewportRef.current.width;
    let scrollFrame;
    const sync = () => {
      if (window.innerWidth !== viewportWidth) {
        viewportWidth = window.innerWidth;
        fullHeight = window.innerHeight;
      } else {
        fullHeight = Math.max(fullHeight, window.innerHeight);
      }
      fullViewportRef.current = { height: fullHeight, width: viewportWidth };
      const { height, bottom, keyboardOpen } = getChatViewport({
        layoutHeight: document.documentElement.clientHeight,
        fullHeight,
        height: viewport.height,
        offsetTop: viewport.offsetTop,
        scale: viewport.scale,
        inputFocused: document.activeElement === inputRef.current,
      });
      panel.style.setProperty('--chat-viewport-height', `${height}px`);
      panel.style.setProperty('--chat-viewport-bottom', `${bottom}px`);
      panel.dataset.keyboardOpen = String(keyboardOpen);
      cancelAnimationFrame(scrollFrame);
      scrollFrame = requestAnimationFrame(() => {
        const messages = messagesRef.current;
        if (messages) messages.scrollTop = messages.scrollHeight;
      });
    };
    sync();
    viewport.addEventListener('resize', sync);
    viewport.addEventListener('scroll', sync);
    window.addEventListener('resize', sync);
    panel.addEventListener('focusin', sync);
    panel.addEventListener('focusout', sync);
    return () => {
      cancelAnimationFrame(scrollFrame);
      viewport.removeEventListener('resize', sync);
      viewport.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
      panel.removeEventListener('focusin', sync);
      panel.removeEventListener('focusout', sync);
      panel.style.removeProperty('--chat-viewport-height');
      panel.style.removeProperty('--chat-viewport-bottom');
      delete panel.dataset.keyboardOpen;
    };
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
    const observer = new ResizeObserver(() => { el.scrollTop = el.scrollHeight; });
    observer.observe(el);
    return () => observer.disconnect();
  }, [messages, open]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) onOpenChange(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

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
        onClick={() => onOpenChange(!open)}
      >
        <span className="chat-robot-portrait" aria-hidden="true" style={{ backgroundImage: `url("${mascotImage}")` }} />
      </button>
      <aside className="chat" id="chat" ref={panelRef} hidden={!open} aria-label="Magic Code assistant">
        <div className="chat-head">
          <div className="bot-avatar">
            <img src={mascotImage} alt="" width="48" height="48" />
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
