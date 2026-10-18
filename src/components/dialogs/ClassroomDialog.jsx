import { useEffect, useRef, useState } from 'react';
import Tr from '../Tr/Tr';
import { useLang } from '../../context/LanguageContext';
import closeOnBackdrop from '../../hooks/dialogBackdrop';
import { readStorage, writeStorage } from '../../hooks/useLocalStorage';
import { courseLessons } from '../../data/lessons';

function loadCompleted() {
  try {
    const saved = JSON.parse(readStorage('mc-lessons-v1', '[]'));
    if (Array.isArray(saved)) return [...new Set(saved.filter((id) => courseLessons.some((l) => l.id === id)))];
  } catch {
    /* эвдэрсэн өгөгдлийг алгасна */
  }
  return [];
}

function loadLast() {
  const last = Number(readStorage('mc-last-lesson', ''));
  return Number.isInteger(last) && last >= 0 && last < courseLessons.length ? last : 0;
}

// request – id нэмэгдэх бүрт dialog нээгдэж, видеог ачаална.
export default function ClassroomDialog({ request }) {
  const { t } = useLang();
  const dialogRef = useRef(null);
  const [current, setCurrent] = useState(loadLast);
  const [completed, setCompleted] = useState(loadCompleted);
  const [videoId, setVideoId] = useState(null);

  const lesson = courseLessons[current];

  const play = (index) => {
    setCurrent(index);
    setVideoId(courseLessons[index].id);
    writeStorage('mc-last-lesson', String(index));
  };

  useEffect(() => {
    if (!request) return;
    play(current);
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  const toggleComplete = () => {
    const next = completed.includes(lesson.id) ? completed.filter((x) => x !== lesson.id) : [...completed, lesson.id];
    setCompleted(next);
    writeStorage('mc-lessons-v1', JSON.stringify(next));
  };

  return (
    <dialog id="classroom" ref={dialogRef} onClick={closeOnBackdrop} onClose={() => setVideoId(null)}>
      <div className="classroom-top">
        <div>
          <small>MAGIC CODE · LEARNING SPACE</small>
          <h3><Tr mn="Өгөгдлийн шинжилгээ ба Power BI" en="Data Analysis & Power BI" /></h3>
        </div>
        <button type="button" className="icon-btn" id="closeClassroom" aria-label="Close lessons" onClick={() => dialogRef.current.close()}>×</button>
      </div>
      <div className="classroom-layout">
        <div className="classroom-main">
          <div className="lesson-video">
            <iframe
              id="lessonPlayer"
              title="Course video"
              src={videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0` : undefined}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <small id="lessonCreator">{lesson.creator} · YouTube</small>
          <h3 id="lessonTitle">{t(lesson.mn, lesson.en)}</h3>
          <p>
            <Tr
              mn="Түр сан: бусад бүтээгчдийн нээлттэй YouTube хичээлүүд · Англи хэлээр."
              en="Preview library: public YouTube lessons from independent creators · In English."
            />
          </p>
          <a id="lessonYoutube" href={`https://www.youtube.com/watch?v=${lesson.id}`} target="_blank" rel="noopener noreferrer">
            <Tr mn="YouTube дээр үзэх" en="Watch on YouTube" />
          </a>
          <div className="lesson-actions">
            <button className="btn" id="completeLesson" onClick={toggleComplete}>
              {completed.includes(lesson.id)
                ? t('Үзсэн тэмдэглэгээг авах', 'Undo completion')
                : t('Үзсэн гэж тэмдэглэх', 'Mark as completed')}
            </button>
            <button className="btn secondary" id="nextLesson" disabled={current === courseLessons.length - 1} onClick={() => play(current + 1)}>
              <Tr mn="Дараагийн хичээл" en="Next lesson" />
            </button>
          </div>
        </div>
        <div className="classroom-sidebar">
          <h3><Tr mn="Хичээлийн агуулга" en="Course content" /></h3>
          <p id="lessonProgress" aria-live="polite">
            {t('Дууссан: ', 'Completed: ')}
            {completed.length} / {courseLessons.length}
          </p>
          <progress id="lessonProgressBar" value={completed.length} max={4} />
          <div id="lessonList">
            {courseLessons.map((l, i) => (
              <button key={l.id} type="button" className="lesson-choice" aria-current={i === current ? 'true' : 'false'} onClick={() => play(i)}>
                <span>{completed.includes(l.id) ? '✓' : String(i + 1).padStart(2, '0')}</span>
                <span>{t(l.mn, l.en)}</span>
              </button>
            ))}
          </div>
          <small><Tr mn="Тэмдэглэсэн явц энэ хөтөч дээр хадгалагдана." en="Completion marks are saved in this browser." /></small>
        </div>
      </div>
    </dialog>
  );
}
