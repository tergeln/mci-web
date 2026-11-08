import { useEffect, useRef, useState } from 'react';
import { useLang } from '../../context/LanguageContext';
import { getCoursePreview, getLessonVideo } from '../../api/commerce';

// Cloudflare R2 дээрх хичээлийн видео. Backend 2 цагийн хугацаатай линк өгнө;
// линкийн хугацаа дууссан бол (видео алдаа заавал) нэг удаа шинэ линк авч дахин ачаална.
export default function SignedVideo({ courseId, lessonId, preview = false, title }) {
  const { t } = useLang();
  const [state, setState] = useState({ url: null, error: false });
  const [attempt, setAttempt] = useState(0);
  const refreshed = useRef(false);

  useEffect(() => {
    let active = true;
    setState({ url: null, error: false });
    (preview ? getCoursePreview(courseId) : getLessonVideo(courseId, lessonId))
      .then((result) => { if (active) setState({ url: /^https:\/\//.test(result?.url) ? result.url : null, error: !/^https:\/\//.test(result?.url) }); })
      .catch(() => { if (active) setState({ url: null, error: true }); });
    return () => { active = false; };
  }, [courseId, lessonId, preview, attempt]);

  const retry = () => { refreshed.current = false; setAttempt((value) => value + 1); };
  if (state.error) return <div className="lesson-video lesson-video--message" role="alert">
    <p>{t('Видеог ачаалж чадсангүй.', 'Could not load the video.')}</p>
    <button type="button" className="btn secondary" onClick={retry}>{t('Дахин оролдох', 'Retry')}</button>
  </div>;
  if (!state.url) return <div className="lesson-video lesson-video--message" role="status">{t('Видео ачаалж байна…', 'Loading video…')}</div>;
  return <div className="lesson-video">
    <video key={state.url} src={state.url} title={title} controls playsInline preload="metadata" controlsList="nodownload" disablePictureInPicture
      onContextMenu={(event) => event.preventDefault()}
      onError={() => { if (refreshed.current) setState({ url: null, error: true }); else { refreshed.current = true; setAttempt((value) => value + 1); } }} />
  </div>;
}
