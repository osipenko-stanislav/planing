import { useEffect, useRef, useState } from 'react';
import type { Option } from './select';

export function FilterSelect({ label, values, onChange, options }: { label: string; values: string[]; onChange: (values: string[]) => void; options: readonly (string | Option)[] }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const normalized = options.map(option => typeof option === 'string' ? { value: option, label: option } : option);
  const selected = normalized.filter(option => values.includes(option.value));
  const active = selected.length > 0;
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  return <span ref={root} className="filter-control" data-selected={active} data-open={open} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <button ref={trigger} type="button" aria-label={label} aria-expanded={open} className="filter-button" onClick={() => setOpen(!open)}>
      <span>{label}{active ? `: ${selected[0].label}` : ''}</span>
      {selected.length > 1 && <span className="filter-count">+{selected.length - 1}</span>}
      {(!active || open) && <img className="filter-chevron" src={import.meta.env.BASE_URL + 'assets/filter-chevron-down.svg'} alt=""/>}
    </button>
    {active && !open && <button type="button" className="filter-clear" aria-label={`Сбросить фильтр «${label}»`} onClick={() => onChange([])}><img src={import.meta.env.BASE_URL + 'assets/filter-clear.svg'} alt=""/></button>}
    {open && <span className="filter-options select-content" role="group" aria-label={label}>
      {normalized.map(option => <button type="button" role="checkbox" aria-checked={values.includes(option.value)} className="filter-option" key={option.value} onClick={() => onChange(values.includes(option.value) ? values.filter(value => value !== option.value) : [...values, option.value])}><span className="filter-option-check" aria-hidden="true">{values.includes(option.value) ? '✓' : ''}</span><span>{option.label}</span></button>)}
      {active && <button type="button" className="filter-reset" onClick={() => onChange([])}>Сбросить</button>}
    </span>}
  </span>;
}
