import { Link, useParams } from 'react-router-dom';
import { useRepository } from '../data/repository';
import { CourseTable, StaffingCard, Filters, useCourseFilters } from '../components/Planning';
import { NotFound } from './NotFound';
export function Direction() {
  const { id } = useParams(); const { db } = useRepository(); const filters = useCourseFilters();
  const direction = db.directions.find(d => d.id === id);
  if (!direction) return <NotFound/>;
  const courses = filters.courses.filter(c => c.directionIds.includes(direction.id));
  return <div className="direction-page"><h1>{direction.name}</h1><p className="subtitle">{courses.length} курсов</p><Filters filters={filters}/><div className="dashboard-row"><StaffingCard courseIds={courses.map(c => c.id)}/><section className="summary-card product-team"><div className="card-title">Продуктовая команда</div><div className="team-grid">{Object.entries(direction.team).map(([role, personId]) => { const person = db.directory.find(p => p.id === personId); return <div className="team-member" key={role}><p className="muted">{role}</p><div><span>{person?.name || '—'}{person && <a href={'mailto:'+person.email}>{person.email}</a>}</span></div></div>; })}</div></section></div><CourseTable courses={courses} showLead/><Link to="/">Все направления</Link></div>;
}
