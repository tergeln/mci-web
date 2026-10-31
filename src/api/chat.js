import { ApiError, USE_MOCK, request } from './client';
import { chatSystemPrompt } from '../data/chat';

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.5-flash-lite';

/**
 * Chatbot-ийн хариу авна.
 * - VITE_USE_MOCK=false: backend-ийн POST /api/chat (Gemini key зөвхөн серверт байна).
 * - Mock горим (локал хөгжүүлэлт): өмнөх шигээ Gemini-г шууд дуудна (VITE_GEMINI_API_KEY хэрэгтэй).
 */
export function sendChatMessage({ message, lang, history = [] }) {
  if (!USE_MOCK) {
    return request('/chat', { method: 'POST', body: { message, lang, history: history.slice(-10) } });
  }
  return generateGeminiReply({ message, lang, history });
}

async function generateGeminiReply({ message, lang, history }) {
  if (!API_KEY) throw new ApiError(500, 'configuration_error', 'Gemini API key is not configured');

  const historyContents = history.slice(-10).map(({ role, content }) => ({
    role: role === 'assistant' ? 'model' : 'user',
    parts: [{ text: content }],
  }));
  const firstUserMessage = historyContents.findIndex(({ role }) => role === 'user');
  const contents = [
    ...(firstUserMessage === -1 ? [] : historyContents.slice(firstUserMessage)),
    { role: 'user', parts: [{ text: message }] },
  ];

  let response;
  try {
    response = await fetch(`${API_URL}/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: chatSystemPrompt[lang] }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
      }),
    });
  } catch (error) {
    throw new ApiError(0, 'network_error', error.message);
  }

  const data = await response.json().catch(() => undefined);
  if (!response.ok) {
    const code = response.status === 429
      ? 'rate_limited'
      : [400, 401, 403].includes(response.status) ? 'configuration_error' : 'ai_error';
    throw new ApiError(response.status, code, data?.error?.message || `Gemini request failed (${response.status})`);
  }

  const candidate = data?.candidates?.[0];
  const reply = candidate?.content?.parts?.map((part) => part.text || '').join('').trim();
  if (!reply) {
    const reason = candidate?.finishReason || data?.promptFeedback?.blockReason || 'empty_response';
    throw new ApiError(502, 'ai_error', `Gemini returned no text (${reason})`);
  }
  return { reply };
}
