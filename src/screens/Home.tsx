import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useRepository } from '../data/repository';
import { CourseStatus, Filters, Levels, useCourseFilters } from '../components/Planning';
import { staffing } from '../domain/model';
import { Button } from '../components/ui/button';
export function Home() {
  const navigate = useNavigate(); const { db } = useRepository(); const filters = useCourseFilters();
  return <><div className="page-heading"><h1>Кадровое планирование</h1></div><div className="overview-filters"><Filters filters={filters} onAdd={() => navigate('/courses/new')}/></div><div className="grouped-table"><table className="planning-table"><thead><tr><th>Название курса</th><th>Год</th><th>Семестр</th><th>Уровень</th><th>Статус</th></tr></thead><tbody>{filters.courses.map(c => <tr className="course-row" key={c.id} tabIndex={0} onClick={e => { if (!(e.target as HTMLElement).closest('a,button')) navigate(`/courses/${c.id}`); }}><td className="course-name"><Link to={`/courses/${c.id}`}>{c.name}</Link></td><td>{c.year}</td><td>{c.semester}</td><td><Levels values={c.levels}/></td><td><CourseStatus course={c}/></td></tr>)}{!filters.courses.length && <tr><td colSpan={5} className="empty">Курсы не найдены. Измени условия поиска.</td></tr>}</tbody></table></div><p className="table-footer">Показано {filters.courses.length} из {db.courses.length} курсов</p></>;
}
