// @ts-nocheck
/// <reference path="./styles.d.ts" />
/// <reference path="./vite-env.d.ts" />
/// <reference path="./react.d.ts" />
import { useEffect, useRef, useState } from "react";
import "./ChatWidget.css";

type Role = "user" | "assistant";
type Message = {
  id: number;
  role: Role;
  content: string;
  error?: boolean;
  followups?: string[];
};
type Suggestion = { label: string; question: string };

type Props = {
  apiUrl?: string;
  business?: "course" | "web" | "merch";
  title?: string;
  greeting?: string;
  avatarUrl?: string;
  suggestions?: Suggestion[];
};

const API_URL = (import.meta.env.VITE_CHAT_API_URL as string | undefined) ?? "";
const GENERIC_ERROR = "Түр алдаа гарлаа. Дахин оролдоно уу.";
const MOBILE_QUERY = "(max-width: 480px)";   // ChatWidget.css-ийн @media-тай ижил байх ёстой

// Хариулт дахь холбоосыг товч болгоно. Зөвхөн итгэмжлэгдсэн домэйн, имэйлийг: ботыг хууран
// гадны холбоос гаргуулсан ч энгийн текст хэвээр үлдэж, дарагдахгүй.
const TRUSTED_DOMAINS = ["mci.mn", "facebook.com"];
const TRUSTED_EMAILS = ["magiccodeai@gmail.com"];
const LINK_RE = /https?:\/\/[^\s<>()"']+[^\s<>()"'.,;:!?]|[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;

function linkFor(token: string): { href: string; label: string } | null {
  if (!token.startsWith("http")) {
    return TRUSTED_EMAILS.includes(token.toLowerCase()) ? { href: `mailto:${token}`, label: token } : null;
  }
  try {
    const url = new URL(token);
    const host = url.hostname.replace(/^www\./, "");
    if (!TRUSTED_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`))) return null;
    return { href: url.href, label: host.endsWith("facebook.com") ? "Facebook" : host };
  } catch {
    return null;
  }
}

function renderText(text: string) {
  const parts = [];
  let last = 0;
  for (const match of text.matchAll(LINK_RE)) {
    const link = linkFor(match[0]);
    if (!link) continue;
    parts.push(text.slice(last, match.index));
    parts.push(
      <a key={match.index} className="cw-link" href={link.href} target="_blank" rel="noopener noreferrer">
        {link.label} ↗
      </a>,
    );
    last = match.index! + match[0].length;
  }
  parts.push(text.slice(last));
  return parts;
}

// "- a - b - c" гэж нэг мөрөнд нийлсэн жагсаалтыг мөр болгон задалж, "- " мөрүүдийг <ul> болгоно.
// (Үнийн "500,000₮ – 1,200,000₮" нь урт зураас тул хамаарахгүй.)
function renderAnswer(text: string) {
  const normalized =
    !/\n\s*-\s/.test(text) && (text.match(/\s-\s/g) ?? []).length >= 2
      ? text.replace(/\s+-\s+/g, "\n- ")
      : text;
  const blocks = [];
  let items: string[] = [];
  const flush = () => {
    if (items.length) {
      blocks.push(
        <ul key={blocks.length}>
          {items.map((it, i) => <li key={i}>{renderText(it)}</li>)}
        </ul>,
      );
      items = [];
    }
  };
  for (const raw of normalized.split("\n")) {
    const line = raw.trim();
    if (/^[-•]\s+/.test(line)) {
      items.push(line.replace(/^[-•]\s+/, ""));
    } else if (line) {
      flush();
      blocks.push(<p key={blocks.length}>{renderText(line)}</p>);
    }
  }
  flush();
  return blocks;
}

export default function ChatWidget({
  apiUrl = API_URL,
  business,
  title = "Magi Шидэт туслах",
  greeting = "Сайн уу! Намайг Magi гэдэг. Би Magic Code AI-ийн туслах. Танд юугаар туслах вэ?",
  avatarUrl = "/assets/chatbot-owl-96.webp",
  suggestions = [
    { label: "Сургалтууд", question: "Ямар сургалтууд байдаг вэ?" },
    { label: "Вебсайтын үнэ", question: "Вебсайт хийлгэхэд хэдэн төгрөг вэ?" },
    { label: "Холбогдох", question: "Тантай хэрхэн холбогдох вэ?" },
  ],
}: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const idRef = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const requestRef = useRef<AbortController | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  useEffect(() => {
    // Утсан дээр автомат фокус гарыг шууд гаргаж чатыг таглана: зөвхөн хулганатай төхөөрөмж дээр
    if (open && window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
    else if (!open && wasOpen.current) launcherRef.current?.focus(); // хаасны дараа фокусыг шувуунд буцаана
    wasOpen.current = open;
  }, [open]);

  // Утсан дээр бүтэн дэлгэц: ард байгаа сайтыг гүйлгэхгүй, гар гарахад панелыг харагдах хэсэгт тааруулна
  useEffect(() => {
    const root = rootRef.current;
    if (!open || !root || !window.matchMedia(MOBILE_QUERY).matches) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const vv = window.visualViewport;
    const sync = () => {
      if (!vv) return;
      root.style.setProperty("--cw-vh", `${vv.height}px`);
      root.style.setProperty("--cw-top", `${vv.offsetTop}px`);
    };
    sync();
    vv?.addEventListener("resize", sync);
    vv?.addEventListener("scroll", sync);
    return () => {
      document.body.style.overflow = prevOverflow;
      vv?.removeEventListener("resize", sync);
      vv?.removeEventListener("scroll", sync);
      root.style.removeProperty("--cw-vh");
      root.style.removeProperty("--cw-top");
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function push(message: Omit<Message, "id">) {
    setMessages((prev) => [...prev, { ...message, id: idRef.current++ }]);
  }

  function reset() {
    requestRef.current?.abort(); // хүлээгдэж буй хариу шинэ чатад орж ирэхгүй
    requestRef.current = null;
    setMessages([]);
    setInput("");
    setLoading(false);
    inputRef.current?.focus();
  }

  async function send(text: string) {
    const question = text.trim();
    if (!question || loading) return;

    const history = messages
      .filter((m) => !m.error)
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));

    push({ role: "user", content: question });
    setInput("");

    if (!apiUrl) {
      console.error("VITE_CHAT_API_URL тохируулагдаагүй байна");
      push({ role: "assistant", content: GENERIC_ERROR, error: true });
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    requestRef.current = controller;
    let timedOut = false;
    const timer = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 30000);

    try {
      const res = await fetch(`${apiUrl.replace(/\/$/, "")}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, history, ...(business ? { business } : {}) }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(typeof data?.detail === "string" ? data.detail : GENERIC_ERROR);
      }
      push({
        role: "assistant",
        content: String(data.answer ?? ""),
        followups: Array.isArray(data.followups)
          ? data.followups.filter((q: unknown) => typeof q === "string").slice(0, 3)
          : [],
      });
    } catch (e) {
      if (controller.signal.aborted && !timedOut) return; // reset() цуцалсан
      const message =
        e instanceof DOMException && e.name === "AbortError"
          ? "Хариу удаан байна. Дахин оролдоно уу."
          : e instanceof TypeError
            ? "Сүлжээний алдаа. Интернэт холболтоо шалгана уу."
            : e instanceof Error
              ? e.message
              : GENERIC_ERROR;
      push({ role: "assistant", content: message, error: true });
    } finally {
      window.clearTimeout(timer);
      if (requestRef.current === controller) {
        requestRef.current = null;
        setLoading(false);
      }
    }
  }

  // Эхэнд анхны товчнууд, дараа нь сүүлийн хариултын санал болгосон дараагийн асуултууд
  const last = messages[messages.length - 1];
  const chips: Suggestion[] =
    messages.length === 0
      ? suggestions
      : !loading && last.role === "assistant"
        ? (last.followups ?? []).map((q) => ({ label: q, question: q }))
        : [];

  return (
    <div ref={rootRef} className={"cw-root" + (open ? " cw-open" : "")}>
      {open && (
        <section className="cw-panel" role="dialog" aria-label={title}>
          {/* <header> биш: сайтын глобал `header {position: fixed}` дүрэмд өртөхгүйн тулд */}
          <div className="cw-header">
            <img className="cw-avatar" src={avatarUrl} alt="" width="44" height="44" />
            <div className="cw-title">
              <strong>{title}</strong>
              <span className="cw-status">
                <i aria-hidden="true" />
                Онлайн
              </span>
            </div>
            <button
              type="button"
              className="cw-icon-btn cw-refresh"
              onClick={reset}
              disabled={messages.length === 0 && !loading}
              aria-label="Чатыг шинээр эхлүүлэх"
              title="Чатыг шинээр эхлүүлэх"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 11a8 8 0 1 0-2.34 5.66" />
                <path d="M20 4v7h-7" />
              </svg>
            </button>
            <button type="button" className="cw-icon-btn cw-close" onClick={() => setOpen(false)} aria-label="Хаах">
              ×
            </button>
          </div>

          <div className="cw-messages" ref={listRef} aria-live="polite">
            <div className="cw-row">
              <img className="cw-mini" src={avatarUrl} alt="" width="28" height="28" />
              <div className="cw-msg cw-assistant">
                <p>{greeting}</p>
              </div>
            </div>

            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="cw-msg cw-user">
                  <p>{m.content}</p>
                </div>
              ) : (
                <div key={m.id} className="cw-row">
                  <img className="cw-mini" src={avatarUrl} alt="" width="28" height="28" />
                  <div className={"cw-msg cw-assistant" + (m.error ? " cw-error" : "")}>
                    {renderAnswer(m.content)}
                  </div>
                </div>
              ),
            )}

            {loading && (
              <div className="cw-row">
                <img className="cw-mini" src={avatarUrl} alt="" width="28" height="28" />
                <div className="cw-msg cw-assistant cw-pending" aria-label="Хариулж байна">
                  <span className="cw-typing">
                    <i />
                    <i />
                    <i />
                  </span>
                  <small>Magi бичиж байна</small>
                </div>
              </div>
            )}

            {/* Сүүлийн хариултын доор, мессежүүдтэй хамт гүйлгэгдэнэ */}
            {chips.length > 0 && (
              <div className={"cw-chips" + (messages.length ? " cw-chips--next" : "")}>
                <span className="cw-chips-label">{messages.length ? "Санал болгох асуулт" : "Түгээмэл асуулт"}</span>
                {chips.map((s) => (
                  <button type="button" key={s.label} onClick={() => send(s.question)} disabled={loading}>
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            className="cw-form"
            onSubmit={(e: any) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e: any) => setInput(e.target.value)}
              placeholder="Асуух зүйлээ бичээрэй…"
              maxLength={500}
              aria-label="Асуулт"
            />
            <button type="submit" disabled={loading || !input.trim()} aria-label="Илгээх">
              ↑
            </button>
          </form>
        </section>
      )}

      {/* Чат нээлттэй үед шувуу нуугдана, хаахдаа × эсвэл Esc */}
      {!open && (
        <button
          type="button"
          className="cw-launcher"
          ref={launcherRef}
          onClick={() => setOpen(true)}
          aria-label="Magi шидэт туслахыг нээх"
        >
          <img src={avatarUrl} srcSet={avatarUrl === '/assets/chatbot-owl-96.webp' ? '/assets/chatbot-owl-96.webp 96w, /assets/chatbot-owl-128.webp 128w, /assets/chatbot-owl-160.webp 160w, /assets/chatbot-owl-192.webp 192w' : undefined} sizes="(max-width:480px) 64px, 76px" alt="" width="76" height="76" loading="eager" fetchpriority="low" decoding="async" />
        </button>
      )}
    </div>
  );
}
