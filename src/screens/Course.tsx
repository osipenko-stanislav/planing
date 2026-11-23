import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useRepository } from '../data/repository';
import { hireStatuses, roles, isEmployee, occupiesVacancy } from '../domain/model';
import { Badge, CourseStatus, HireStatus, RoleIndicator, Levels, StaffingCard } from '../components/Planning';
import { Avatar, Icon } from '../components/Icon';
import { Button } from '../components/ui/button';
import { FilterSelect } from '../components/ui/filter-select';
import { NotFound } from './NotFound';
export function Course() {
  const { id } = useParams(); const { db } = useRepository(); const [params, setParams] = useSearchParams();
  const [expanded, setExpanded] = useState<string[]>([...roles]);
  const course = db.courses.find(c => c.id === id);
  if (!course) return <NotFound/>;
  const assignments = db.assignments.filter(a => a.courseId === course.id);
  return <><div className="page-heading course-heading"><h1>{course.name}</h1><CourseStatus course={course}/><Button asChild className="heading-action" variant="ghost" size="icon"><Link aria-label="Редактировать курс" to={`/courses/${course.id}/edit`}><Icon name="edit"/></Link></Button></div>
    <div className="dashboard-row course-dashboard"><StaffingCard courseIds={[course.id]}/></div>
    <div className="tabs" role="tablist" aria-label="Разделы курса">{[['team', 'Команда'], ['info', 'Общая информация']].map(([key, label]) => <button key={key} role="tab" aria-selected={(params.get('tab') || 'team') === key} onClick={() => { const next = new URLSearchParams(params); next.set('tab', key); setParams(next); }}>{label}</button>)}</div>
    {params.get('tab') === 'info' ? <dl className="details"><dt>Поднаправление</dt><dd>{course.directionIds.map(id => <span key={id}>{db.directions.find(d=>d.id===id)?.name}</span>)}</dd><dt>Семестр</dt><dd>{course.year} {course.semester}</dd><dt>Уровень образования</dt><dd><Levels values={course.levels}/></dd><dt>Набор студентов</dt><dd>{course.intake}</dd><dt>Тип запуска</dt><dd>{course.launch}</dd></dl> : <><div className="toolbar team-toolbar"><FilterSelect label="Статус найма" values={params.getAll('status')} onChange={values => { const next = new URLSearchParams(params); next.delete('status'); values.forEach(value => next.append('status', value)); setParams(next, { replace: true }); }} options={hireStatuses}/></div>
    <div className="table-scroll"><table className="team-table"><colgroup><col className="team-position"/><col className="team-metric"/><col className="team-metric"/><col className="team-metric"/><col className="team-actions"/></colgroup><thead><tr><th>Позиция</th><th>План</th><th>Факт</th><th>Вакансии</th><th/></tr></thead>
    {roles.map(role => {
      const rows = assignments.filter(a => a.role === role).map(a => ({ assignment: a, person: db.people.find(p => p.id === a.personId)! }));
      const employees = rows.filter(row => isEmployee(row.person.status)).length;
      const vacant = Math.max(0, course.plan[role] - rows.filter(row => occupiesVacancy(row.person.status)).length);
      if (!course.plan[role] && !rows.length) return null;
      const open = expanded.includes(role);
      return <tbody key={role} className="role-group"><tr className="role-row"><td><button aria-expanded={open} onClick={() => setExpanded(values => open ? values.filter(value => value !== role) : [...values, role])}><RoleIndicator complete={course.plan[role] > 0 && employees >= course.plan[role]}/>{role}</button></td><td>{course.plan[role]}</td><td>{employees || '—'}</td><td>{vacant || '—'}</td><td><button className="role-toggle" aria-label={`${open ? 'Свернуть' : 'Развернуть'} ${role}`} onClick={() => setExpanded(values => open ? values.filter(value => value !== role) : [...values, role])}><img src={import.meta.env.BASE_URL + 'assets/filter-chevron-down.svg'} className={open ? 'rotate' : ''} alt=""/></button></td></tr>
      {open && <>{rows.filter(row => !params.getAll('status').length || params.getAll('status').includes(row.person.status)).map(({ assignment, person }) => <tr className="person-row" key={assignment.id}><td colSpan={5}><div className="team-person-grid"><Link className="person-link" to={`/people/${person.id}?course=${course.id}`}><Avatar name={person.name} size={24}/><span className="person-name" title={person.name}>{person.name || 'Кандидат не указан'}</span>{person.contactsNew && <Badge tone="purple">Новый</Badge>}</Link><HireStatus status={person.status}/><Button asChild variant="ghost" size="icon" className="person-edit"><Link aria-label="Редактировать карточку" to={`/people/${person.id}/edit?course=${course.id}`}><Icon name="edit"/></Link></Button></div></td></tr>)}
      {!params.getAll('status').length && Array.from({ length: vacant }, (_, index) => <tr className="vacancy-row" key={`vacancy-${index}`}><td colSpan={5}><div className="vacancy-content"><span className="vacancy-label"><span className="vacancy-avatar" aria-hidden="true"/>Вакансия открыта</span><Button asChild variant="ghost" size="icon"><Link aria-label={`Заполнить вакансию: ${role}, ${index + 1}`} to={`/people/new?course=${course.id}&role=${encodeURIComponent(role)}`}><Icon name="edit"/></Link></Button></div></td></tr>)}</>}
      </tbody>;
    })}</table></div></>}
  </>;
}
