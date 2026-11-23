import { Paginated } from './Pagination'; import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useRepository } from '../data/repository';
import { staffing, roles, positionTypes, type Course, isEmployee } from '../domain/model';
import { Icon } from './Icon';
import { Button } from './ui/button';
import type { Option } from './ui/select';
import { FilterSelect } from './ui/filter-select';
export function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: string }) { return <span className={`badge badge-${tone}`}>{children}</span>; }
export function HireStatus({ status }: { status: string }) { return <span className={`hire-status ${isEmployee(status) ? 'hire-employee' : ['Оформление удалено','Оформление отменено','Предотмена оформления'].includes(status) ? 'hire-cancelled' : 'hire-candidate'}`}><i aria-hidden="true"/>{status}</span>; }
export function RoleIndicator({ complete }: { complete: boolean }) { return <span className="role-indicator" aria-label={complete ? 'Комплект' : 'Есть открытые вакансии'}><Icon name={complete ? 'check' : 'clock'}/></span>; }
export function CourseStatus({ course }: { course: Course }) { const { db } = useRepository(); const s = staffing(db, [course.id]); return s.employees >= s.plan && s.plan > 0 ? <Badge tone="green">● Комплект</Badge> : s.employees + s.candidates > 0 ? <span className="recruitment-badge"><i/>Идет набор</span> : <span className="muted">—</span>; }
export function Levels({ values }: { values: string[] }) { return <span className="levels">{values.map(v => <Badge key={v} tone={v === 'БАК' ? 'lime' : v === 'МАГ' ? 'lavender' : 'purple'}>{v}</Badge>)}</span>; }
export function StaffingCard({ courseIds }: { courseIds: string[] }) {
  const { db } = useRepository(); const s = staffing(db, courseIds);
  const employeeAngle = s.plan ? Math.min(180, s.employees / s.plan * 180) : 0;
  const candidateAngle = s.plan ? Math.min(180, (s.employees + s.candidates) / s.plan * 180) : 0;
  return <section className="summary-card staffing-card" aria-label="Кадровые показатели"><div className="card-title"><Icon name="user"/>Вакансий закрыто</div><div className="staffing-bottom"><div className="gauge"><div className="gauge-ring" style={{ background: `conic-gradient(from 270deg, #00b884 0deg ${employeeAngle}deg, #ffb800 ${employeeAngle}deg ${candidateAngle}deg, #f4f4f5 ${candidateAngle}deg 180deg, transparent 180deg)` }}/><div className="gauge-caption"><strong>{s.percent}%</strong><span>из {s.plan} вакансий</span></div></div><div className="gauge-legend"><div><i className="dot green"/>Сотрудников <b>{s.employees}</b></div><div><i className="dot amber"/>Кандидатов <b>{s.candidates}</b></div><div><i className="dot"/>Вакансий открыто <b>{s.open}</b></div></div></div></section>;
}
export function useCourseFilters() {
  const [params, setParams] = useSearchParams(); const { db } = useRepository();
  const set = (name: string, value: string | string[]) => { const next = new URLSearchParams(params); next.delete(name); for (const item of Array.isArray(value) ? value : [value]) if (item && item !== 'all') next.append(name, item); for (const key of [...next.keys()]) if (key === 'page' || key.startsWith('courses-') && !key.endsWith('Size')) next.delete(key); setParams(next, { replace: true }); };
  const courses = db.courses.filter(c => {
    const s = staffing(db, [c.id]);
    return (!params.get('q') || c.name.toLowerCase().includes(params.get('q')!.toLowerCase()))
      && (!params.get('direction') || c.directionIds.some(direction => params.getAll('direction').includes(direction)))
      && (!params.get('year') || params.getAll('year').includes(c.year))
      && (!params.get('semester') || params.getAll('semester').includes(c.semester))
      && (!params.get('level') || c.levels.some(level => params.getAll('level').includes(level)))
      && (!params.get('course') || params.getAll('course').includes(c.id)) && (!params.get('positionType') || db.assignments.some(a => a.courseId === c.id && params.getAll('positionType').includes(db.people.find(p => p.id === a.personId)?.positionType || 'Новый найм')))
      && (!params.get('recruitment') || params.getAll('recruitment').some(status => status === 'complete' ? s.employees >= s.plan : s.employees < s.plan))
      && (!params.get('role') || db.assignments.some(a => a.courseId === c.id && params.getAll('role').includes(a.role)))
      && (!params.get('type') || db.assignments.some(a => a.courseId === c.id && (params.get('type') === 'employee' ? ['Оформлен'].includes(db.people.find(p => p.id === a.personId)!.status) : !['Оформлен'].includes(db.people.find(p => p.id === a.personId)!.status))));
  });
  return { params, set, courses };
}
export function Filters({ filters, onAdd }: { filters: ReturnType<typeof useCourseFilters>; onAdd?: () => void }) {
  const { db } = useRepository(); const [searchOpen, setSearchOpen] = useState(Boolean(filters.params.get('q')));
  const configs: [string, string, (string | Option)[]][] = [
    ['direction', 'Направление', db.directions.map(d => ({value:d.id,label:d.name}))], ['course','Курс',db.courses.map(c=>({value:c.id,label:c.name}))], ['positionType','Тип позиции',[...positionTypes]], ['role','Роль',[...roles]], ['year', 'Год', [...new Set(db.courses.map(c => c.year))].sort().reverse()],
    ['semester', 'Семестр', ['Осень', 'Весна', 'Зима', 'Лето']],
    ['level', 'Уровень', ['БАК', 'МАГ', 'ДПО']],
    ['recruitment', 'Статус набора', [{ value: 'hiring', label: 'Идет набор' }, { value: 'complete', label: 'Комплект' }]],
    
  ];
  return <div className="toolbar"><div className="filters">{[...configs].sort((a,b)=>['direction','year','semester','level','recruitment','course','role','positionType'].indexOf(a[0])-['direction','year','semester','level','recruitment','course','role','positionType'].indexOf(b[0])).map(([key, title, options]) => <FilterSelect key={key} label={title} values={filters.params.getAll(key)} onChange={v => filters.set(key, v)} options={options}/>)}</div><div className="toolbar-actions">{searchOpen && <input autoFocus className="search-input" aria-label="Поиск курсов" placeholder="Найти курс" value={filters.params.get('q') || ''} onChange={e => filters.set('q', e.target.value)}/>}<Button variant="ghost" size="icon" aria-label="Поиск" onClick={() => setSearchOpen(!searchOpen)}><Icon name="search"/></Button>{onAdd && <Button onClick={onAdd}><Icon name="plus"/>Курс</Button>}</div></div>;
}
export function CourseTable({ courses, showLead = false }: { courses: Course[]; showLead?: boolean }) {
  const { db } = useRepository(); const navigate = useNavigate(); const [reverse, setReverse] = useState(false);
  const sorted = [...courses].sort((a, b) => a.name.localeCompare(b.name, 'ru') * (reverse ? -1 : 1));
  return <Paginated items={sorted} name="page" label="Курсы направления">{rows => <div className={showLead ? 'table-scroll direction-courses' : 'table-scroll'}><table><thead><tr><th><button className="table-sort" onClick={() => setReverse(!reverse)}>Курс {reverse ? '↓' : '↑'}</button></th>{showLead && <th>Лид курса</th>}<th>Год</th><th>Семестр</th><th>Уровень</th><th>Статус</th>{showLead && <><th>План</th><th>Факт</th><th>Открыто</th></>}</tr></thead><tbody>{rows.map(c => { const s = staffing(db, [c.id]); const lead = db.people.find(p => db.assignments.some(a => a.personId === p.id && a.courseId === c.id && a.role === 'Лид курса')); const openCourse = (event: React.MouseEvent<HTMLTableRowElement>) => { if ((event.target as HTMLElement).closest('a,button')) return; navigate(`/courses/${c.id}`); }; return <tr key={c.id} className="course-row" tabIndex={0} onClick={openCourse} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); navigate(`/courses/${c.id}`); } }}><td className="course-name"><Link to={`/courses/${c.id}`}>{c.name}</Link></td>{showLead && <td>{lead ? <Link to={`/people/${lead.id}?course=${c.id}`}>{lead.name}</Link> : '—'}</td>}<td>{c.year}</td><td>{c.semester}</td><td><Levels values={c.levels}/></td><td><CourseStatus course={c}/></td>{showLead && <><td>{s.plan}</td><td>{s.employees}</td><td>{s.open}</td></>}</tr>; })}{!courses.length && <tr><td colSpan={showLead ? 9 : 5} className="empty">Курсы не найдены. Измени условия поиска.</td></tr>}</tbody></table></div>}</Paginated>;
}
