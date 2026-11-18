import { createContext, useContext, useState, type ReactNode } from 'react';
import { createSeed } from './seed';
import { hireStatuses, roles, type Database } from '../domain/model';
const KEY = 'cu-staff-planning:v1';
function validDatabase(v: unknown): v is Database {
  if (!v || typeof v !== 'object') return false;
  const d = v as Database;
  return d.version === 1 && [d.people, d.assignments, d.courses, d.directions, d.directory].every(Array.isArray)
    && d.people.every(p => typeof p.id === 'string' && typeof p.name === 'string' && hireStatuses.includes(p.status))
    && d.courses.every(c => typeof c.id === 'string' && Array.isArray(c.directionIds) && Array.isArray(c.levels) && c.plan && roles.every(r => Number.isInteger(c.plan[r]) && c.plan[r] >= 0))
    && d.directions.every(x => typeof x.id === 'string' && typeof x.name === 'string' && x.team)
    && d.assignments.every(a => d.people.some(p => p.id === a.personId) && d.courses.some(c => c.id === a.courseId) && roles.includes(a.role));
}
function load() {
  try { const raw = localStorage.getItem(KEY); if (!raw) return { db: createSeed(), warning: '' }; const parsed: unknown = JSON.parse(raw); if (validDatabase(parsed)) return { db: parsed, warning: '' }; }
  catch { /* Keep unreadable storage intact until an explicit successful save/reset. */ }
  return { db: createSeed(), warning: 'Не удалось прочитать сохранённые данные. Открыта демоверсия. Можно восстановить исходные данные в меню прототипа.' };
}
type Store = { db: Database; warning: string; update: (fn: (d: Database) => Database) => void; reset: () => void };
const Context = createContext<Store | null>(null);
export function RepositoryProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(load);
  const [db, setDb] = useState(initial.db);
  const [warning, setWarning] = useState(initial.warning);
  function commit(next: Database) { localStorage.setItem(KEY, JSON.stringify(next)); setDb(next); setWarning(''); }
  return <Context value={{ db, warning, update: fn => commit(fn(db)), reset: () => commit(createSeed()) }}>{children}</Context>;
}
export function useRepository() { const store = useContext(Context); if (!store) throw new Error('Missing repository provider'); return store; }
