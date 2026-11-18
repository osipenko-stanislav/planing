import { Link } from 'react-router-dom';
export function NotFound() { return <div className="empty-page"><h1>Запись не найдена</h1><p>Возможно, она была удалена или ссылка указана неверно.</p><Link to="/">Вернуться к кадровому планированию</Link></div>; }
