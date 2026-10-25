import { Fragment } from 'react';
import { useLang } from '../../../context/LanguageContext';
import Tr from '../../../components/Tr/Tr';
import { chartBars, courseCodeArt, courseKeys } from '../../../data/courses';
import ContentImage from '../../../components/ContentImage/ContentImage';

export default function CourseArt({ course }) {
  const { lang } = useLang();
  const code = courseCodeArt[lang];
  return (
    <div className={`course-art ${course.art}${course.image ? ' course-art--image' : ''}`}>
      {course.image && <ContentImage image={course.image} sizes="(max-width: 640px) calc(100vw - 40px), 550px" />}
      <span className="tag"><Tr text={course.tag} /></span>
      {!course.image && course.kind === 'code' && (
        <div className="art-code">
          {code.lines.map((line) => (
            <Fragment key={line}>
              {line}
              <br />
            </Fragment>
          ))}
          <span style={{ color: '#b8d5a9' }}>{code.ok}</span>
        </div>
      )}
      {!course.image && course.kind === 'chart' && (
        <div className="chart">
          {chartBars.map((h) => (
            <i key={h} style={{ '--h': h }} />
          ))}
        </div>
      )}
      {!course.image && course.kind === 'keys' && (
        <div className="keys">
          {courseKeys.map((k) => (
            <b key={k}>{k}</b>
          ))}
        </div>
      )}
    </div>
  );
}
