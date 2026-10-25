// Бүх API дуудлага энэ файлаар дамжина.
// VITE_USE_MOCK=false болгоход mock-ийн оронд VITE_API_URL руу бодит хүсэлт явна.
// Тохиргоо: .env.example, гэрээ: docs/API.md

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(status, code, message, fields) {
    super(message);
    this.name = 'ApiError';
    this.status = status; // HTTP статус, сүлжээний алдаа бол 0
    this.code = code; // docs/API.md дахь алдааны код
    this.fields = fields; // validation_error үед: { email: '...' }
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @param {string} path  '/courses' гэх мэт, BASE_URL-ийн араас залгагдана
 * @param {object} options
 * @param {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} [options.method]
 * @param {object} [options.body]  JSON болгон илгээнэ
 * @param {AbortSignal} [options.signal]
 * @param {() => any} options.mock  Mock горимд дуудагдах функц (ApiError шидэж болно)
 */
export async function request(path, { method = 'GET', body, signal, mock } = {}) {
  if (USE_MOCK) {
    // Бодит сүлжээ шиг бага зэрэг хүлээлгэж, ачааллах төлөвийг харагдуулна.
    await wait(300 + Math.random() * 300);
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    return structuredClone(await mock());
  }

  let res;
  try {
    res = await fetch(BASE_URL + path, {
      method,
      signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError(0, 'network_error', 'Network request failed');
  }

  if (res.status === 204) return null;
  const isJson = (res.headers.get('content-type') ?? '').includes('application/json');
  const data = isJson ? await res.json().catch(() => undefined) : undefined;
  if (!res.ok) {
    const e = data?.error;
    throw new ApiError(res.status, e?.code ?? 'http_error', e?.message ?? `HTTP ${res.status}`, e?.fields);
  }
  // Буруу хаяг руу хандвал JSON биш (жишээ нь index.html) ирж болно.
  if (data === undefined) throw new ApiError(res.status, 'invalid_response', 'Expected a JSON response');
  return data;
}

const MESSAGES = {
  validation_error: ['Мэдээллээ шалгаад дахин оролдоно уу.', 'Please check your details and try again.'],
  not_found: ['Хайсан зүйл олдсонгүй.', 'We could not find what you were looking for.'],
  enrollment_closed: ['Энэ сургалтын бүртгэл одоогоор хаалттай байна.', 'Enrollment for this course is currently closed.'],
  already_enrolled: ['Та энэ сургалтад аль хэдийн бүртгүүлсэн байна.', 'You are already enrolled in this course.'],
  network_error: ['Сервертэй холбогдож чадсангүй. Интернэтээ шалгаад дахин оролдоно уу.', 'Could not reach the server. Check your connection and try again.'],
  configuration_error: ['Gemini API key буруу эсвэл тохируулагдаагүй байна. .env.local файлаа шалгаад server-ээ restart хийнэ үү.', 'The Gemini API key is invalid or missing. Check .env.local and restart the server.'],
  rate_limited: ['Хэт олон хүсэлт явсан байна. Түр хүлээгээд дахин оролдоно уу.', 'Too many requests. Please wait and try again.'],
  ai_error: ['Gemini хариу өгөхөөс татгалзлаа. Асуултаа өөрөөр бичиж дахин оролдоно уу.', 'Gemini did not return text. Try rephrasing your question.'],
};
const FALLBACK = ['Алдаа гарлаа. Дахин оролдоно уу.', 'Something went wrong. Please try again.'];

/** Алдааны кодыг хэрэглэгчид харуулах текст болгоно. `t` нь useLang()-ийн t. */
export function errorMessage(error, t) {
  const [mn, en] = MESSAGES[error?.code] ?? FALLBACK;
  return t(mn, en);
}
