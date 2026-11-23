import { Paginated } from '../components/Pagination'; import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useRepository } from '../data/repository';
import { CourseStatus, Filters, Levels, useCourseFilters } from '../components/Planning';
import { staffing } from '../domain/model';
import { StaffingCard } from '../components/Planning';
import { Button } from '../components/ui/button';
export function Home() {
  const navigate = useNavigate(); const { db } = useRepository(); const filters = useCourseFilters();
  const grouped = db.directions.map(d => ({ direction:d, courses: filters.courses.filter(c => c.directionIds.includes(d.id)) })).filter(x => x.courses.length);
  return <><div className="page-heading"><h1>Кадровое планирование</h1></div><div className='overview-filters'><Filters filters={filters} onAdd={() => navigate('/courses/new')}/></div><div className='dashboard-row home-dashboard'><StaffingCard courseIds={filters.courses.map(c=>c.id)}/></div><h2>Направления и курсы</h2><div className="grouped-table"><div className="group-table-head"><span>Название</span><span>Год</span><span>Семестр</span><span>Уровень</span><span>Статус</span></div><Paginated items={grouped} name="page" label="Направления">{groups => groups.map(({direction,courses}) => <section className="direction-group" key={direction.id}><div className="direction-row"><Link to={`/directions/${direction.id}`}>{direction.name}</Link><span className="muted">{courses.length} курсов</span></div><Paginated items={courses} name={"courses-"+direction.id} label={"Курсы: "+direction.name}>{rows => <table><tbody>{rows.map(c => <tr className="course-row" key={c.id} tabIndex={0} onClick={e => { if (!(e.target as HTMLElement).closest('a,button')) navigate(`/courses/${c.id}`); }}><td className="course-name"><Link to={`/courses/${c.id}`}>{c.name}</Link></td><td>{c.year}</td><td>{c.semester}</td><td><Levels values={c.levels}/></td><td><CourseStatus course={c}/></td></tr>)}</tbody></table>}</Paginated></section>)}</Paginated>{!grouped.length && <div className="empty">Курсы не найдены. Измени условия поиска.</div>}</div></>;
}
