import { useEffect, useRef } from 'react';
import { useLang } from '../../context/LanguageContext';

export default function WorkspaceTabs({ tabs, activeTab, onChange, prefix, label, className = '' }) {
  const { t } = useLang();
  const listRef = useRef(null);
  useEffect(() => {
    const list = listRef.current;
    const selected = list?.querySelector('[aria-selected="true"]');
    if (!selected) return;
    const bounds = list.getBoundingClientRect();
    const tab = selected.getBoundingClientRect();
    if (tab.left < bounds.left) list.scrollLeft += tab.left - bounds.left;
    else if (tab.right > bounds.right) list.scrollLeft += tab.right - bounds.right;
  }, [activeTab]);
  return <div ref={listRef} className={`workspace-tabs ${className}`} role="tablist" aria-label={label}>
    {tabs.map((tab, index) => <button
      key={tab.id}
      id={`${prefix}-tab-${tab.id}`}
      type="button"
      role="tab"
      aria-selected={activeTab === tab.id}
      aria-controls={`${prefix}-${tab.id}`}
      tabIndex={activeTab === tab.id ? 0 : -1}
      onClick={() => onChange(tab.id)}
      onKeyDown={(event) => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        onChange(tabs[next].id);
        event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next].focus({ preventScroll: true });
      }}
    >{t(tab.mn, tab.en)}</button>)}
  </div>;
}
