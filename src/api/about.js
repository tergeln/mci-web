// The About profile always comes from the backend, including when demo commerce is enabled.
export async function getAbout({ signal } = {}) {
  const base = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
  const response = await fetch(`${base}/site/about`, { signal, cache: 'no-store' });
  if (!response.ok) throw new Error('Could not load the About profile');
  return response.json();
}
