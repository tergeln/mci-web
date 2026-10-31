import { useEffect, useId, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Tr from '../Tr/Tr';
import { useLang } from '../../context/LanguageContext';
import closeOnBackdrop from '../../hooks/dialogBackdrop';
import { LOGO_SHAPES } from '../BrandLogo/logoShapes';
import './collection-dialog.css';

// request – id нэмэгдэх бүрт цуглуулгын мэдэгдэл нээгдэнэ.
export default function CartDialog({ request }) {
  const { t } = useLang();
  const dialogRef = useRef(null);
  const patternId = useId();
  const clipId = useId();
  const { key: locationKey } = useLocation();

  useEffect(() => {
    dialogRef.current?.close();
  }, [locationKey]);

  useEffect(() => {
    if (!request) return;
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
      dialog.focus({ preventScroll: true });
    }
  }, [request]);

  return (
    <dialog id="cartDialog" className="collection-dialog" ref={dialogRef} onClick={closeOnBackdrop} tabIndex={-1} autoFocus aria-labelledby="collectionTitle" aria-describedby="collectionDescription">
      <div className="collection-ambient" aria-hidden="true" />
      <div className="collection-topline">
        <span><Tr mn="САГС" en="BAG" /></span>
        <button className="collection-close" style={{ outline: 'none', border: 0, boxShadow: 'none', background: 'transparent' }} aria-label={t('Хаах', 'Close')} onClick={() => dialogRef.current.close()}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
      </div>
      <div className="collection-visual" aria-hidden="true">
        <svg className="collection-mark" viewBox="0 0 360 230" fill="none">
          <g className="collection-orbits" stroke="currentColor" strokeWidth=".7">
            <path d="m24 88 83-47 142 7 80 111-136 48L24 88ZM107 41l86 166m56-159L24 88m305 71L107 41" />
          </g>
          <g transform="translate(180 119) scale(70 -70)">
            <defs>
              <pattern id={patternId} width=".075" height=".075" patternUnits="userSpaceOnUse"><circle cx=".025" cy=".025" r=".013" fill="currentColor" /></pattern>
              <clipPath id={clipId}>{LOGO_SHAPES.map((shape, index) => <polygon key={index} points={shape.map((point) => point.join(',')).join(' ')} />)}</clipPath>
            </defs>
            <rect x="-2" y="-1.2" width="4" height="2.4" fill={`url(#${patternId})`} clipPath={`url(#${clipId})`} />
          </g>
          <g className="collection-stars" fill="currentColor">
            {[[24,88,2.8],[107,41,2.4],[249,48,3],[329,159,2.2],[193,207,3],[41,183,1],[303,39,1],[145,20,1],[292,205,1]].map(([cx,cy,r],index) => <circle key={index} cx={cx} cy={cy} r={r} />)}
          </g>
        </svg>
      </div>
      <div className="collection-copy">
        <h3 id="collectionTitle"><Tr mn="Тун удахгүй" en="Coming soon" /></h3>
        <p id="collectionDescription"><Tr mn="Засварлаж байна." en="Under maintenance." /></p>
      </div>
    </dialog>
  );
}
