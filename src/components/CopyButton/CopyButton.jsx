import { useState } from 'react';
import { useLang } from '../../context/LanguageContext';
import './CopyButton.css';

export default function CopyButton({ value, label }) {
  const { t } = useLang();
  const [result, setResult] = useState('');
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setResult('copied');
    } catch { setResult('failed'); }
  }
  return <span className="copy-control">
    <button type="button" className="copy-button" aria-label={label} onClick={copy}>{result === 'copied' ? t('Хуулсан ✓', 'Copied ✓') : t('Хуулах', 'Copy')}</button>
    <span className="copy-feedback" role="status">{result === 'failed' ? t('Хуулж чадсангүй. Текстийг сонгож хуулна уу.', 'Could not copy. Select and copy the text manually.') : result === 'copied' ? t('Хуулсан', 'Copied') : ''}</span>
  </span>;
}
