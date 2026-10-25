import { useEffect, useRef } from 'react';
import Tr from '../Tr/Tr';
import { useLang } from '../../context/LanguageContext';
import closeOnBackdrop from '../../hooks/dialogBackdrop';

// request – id нэмэгдэх бүрт цуглуулгын мэдэгдэл нээгдэнэ.
export default function CartDialog({ request }) {
  const { t } = useLang();
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!request) return;
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, [request]);

  return (
    <dialog id="cartDialog" ref={dialogRef} onClick={closeOnBackdrop} aria-labelledby="collectionTitle" aria-describedby="collectionDescription">
      <div className="selection-scene" aria-hidden="true">
        <span>MAGIC CODE · COLLECTION</span>
      </div>
      <div className="selection-content">
        <div className="dialog-top">
          <h3 id="collectionTitle"><Tr mn="Тун удахгүй" en="Coming soon" /></h3>
          <button className="icon-btn" data-close aria-label={t('Хаах', 'Close')} onClick={() => dialogRef.current.close()}>
            <span aria-hidden="true" className="selection-close-mark" />
          </button>
        </div>
        <p id="collectionDescription"><Tr mn="Засварлаж байна." en="Under maintenance." /></p>
        <button className="btn full" onClick={() => dialogRef.current.close()}>
          <Tr mn="Ойлголоо" en="Got it" />
        </button>
      </div>
    </dialog>
  );
}
