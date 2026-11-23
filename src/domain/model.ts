import { z } from 'zod';

export const candidateStatuses = ['Новый','Оформление удалено','В работе у команды ЦУ','Холд','Оформление отменено','Оффер принят','Обучение','Медосмотр','Ожидание прохождения медосмотра','В работе у команды Т','Предотмена оформления','Получение документов','Документы переданы','Трудоустройство','Уточнение','Подписание','Оформлен'] as const;
export const employeeStatuses = ['Оформлен'] as const;
export const hireStatuses = ['Создан', ...candidateStatuses] as const;
export const roles = ['Лид курса', 'Автор курса', 'Лектор', 'Семинарист', 'Ассистент'] as const;
export const questionnaireOptions = ['—', 'Направлена', 'Заполнена'] as const;
export const scheduleOptions = ['Не заходили', 'На уточнении', 'Учтены'] as const;
export const historyOptions = ['Новый', 'Сотрудничал на этом курсе', 'Сотрудничал в другой роли/на другом курсе'] as const;
export const positionTypes = ['Переоформление','Самопоиск','Новый найм','Оформлен'] as const;
export const employmentTypes = ['ТД', 'ГПД'] as const;
export const occupiesVacancy = (status: string) => !['Оформление удалено', 'Оформление отменено', 'Предотмена оформления'].includes(status);
export const isEmployee = (status: string) => employeeStatuses.some(s => s === status);
const optionalUrl = z.string().refine(v => !v || /^https?:\/\//i.test(v) && URL.canParse(v), 'Введи ссылку в формате https://example.com');
const optionalEmail = z.string().refine(v => !v || z.email().safeParse(v).success, 'Введи почту в формате name@example.com');
export const personSchema = z.object({
  name: z.string().trim(),
  employeeId: z.string(),
  status: z.enum(hireStatuses),
  positionType: z.enum(positionTypes), employmentType: z.string(), masterId: z.string(),
  candyUrl: optionalUrl,
  jiraUrl: optionalUrl,
  passUrl: optionalUrl,
  coordinatorId: z.string(),
  online: z.boolean(), offline: z.boolean(),
  questionnaire: z.enum(questionnaireOptions), notes: z.string(),
  startDate: z.string().refine(v => !v || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))) || (/^\d{2}\.\d{2}\.\d{4}$/.test(v) && !Number.isNaN(Date.parse(v.split('.').reverse().join('-')))), 'Укажи корректную дату'),
  pairs: z.string().refine(v => !v || /^\d+$/.test(v), 'Введи целое неотрицательное число'),
  schedule: z.enum(scheduleOptions), history: z.enum(historyOptions), comment: z.string(),
  telegram: z.string().refine(v => !v || /^@[a-zA-Z0-9_]+$/.test(v), 'Введи Telegram в формате @username'),
  email: optionalEmail, universityEmail: optionalEmail,
}).superRefine((v, ctx) => {
  if (isEmployee(v.status) && !v.employeeId) ctx.addIssue({ code: 'custom', path: ['employeeId'], message: 'Выбери сотрудника' });
  if (v.positionType !== 'Оформлен' && !v.jiraUrl) ctx.addIssue({ code: 'custom', path: ['jiraUrl'], message: 'Укажи Jira-таску' });
  if (v.positionType !== 'Оформлен' && !v.candyUrl) ctx.addIssue({ code: 'custom', path: ['candyUrl'], message: 'Укажи карточку кандидата в Candy' });
});
export type PersonFields = z.infer<typeof personSchema>;
export type Person = PersonFields & { id: string; contactsNew: boolean };
export type Role = typeof roles[number];
export type DirectoryPerson = { id: string; name: string; email: string };
export type Direction = { id: string; name: string; team: Record<string, string> };
export type Course = { id: string; directionIds: string[]; name: string; year: string; semester: string; levels: string[]; intake: string; launch: string; groups: number; lectures: number; seminars: number; plan: Record<Role, number> };
export type Assignment = { id: string; personId: string; courseId: string; role: Role };
export type Database = { version: 1; directions: Direction[]; courses: Course[]; people: Person[]; assignments: Assignment[]; directory: DirectoryPerson[] };
export const emptyPerson: PersonFields = { name: '', employeeId: '', status: 'Создан', positionType: 'Новый найм', employmentType: '', masterId: '', candyUrl: '', jiraUrl: '', passUrl: '', coordinatorId: '', online: false, offline: false, questionnaire: '—', notes: '', startDate: '', pairs: '', schedule: 'Не заходили', history: 'Новый', comment: '', telegram: '', email: '', universityEmail: '' };
export function staffing(db: Database, courseIds: string[]) {
  const assignments = db.assignments.filter(a => courseIds.includes(a.courseId));
  const employees = assignments.filter(a => isEmployee(db.people.find(p => p.id === a.personId)?.status || '')).length;
  const candidates = assignments.filter(a => { const status = db.people.find(p => p.id === a.personId)?.status || ''; return !isEmployee(status) && status !== 'Создан' && occupiesVacancy(status); }).length;
  const plan = db.courses.filter(c => courseIds.includes(c.id)).reduce((n, c) => n + Object.values(c.plan).reduce((s, x) => s + x, 0), 0);
  return { employees, candidates, plan, open: db.courses.filter(c => courseIds.includes(c.id)).reduce((total, course) => total + roles.reduce((sum, role) => sum + Math.max(0, course.plan[role] - assignments.filter(a => a.courseId === course.id && a.role === role && occupiesVacancy(db.people.find(p => p.id === a.personId)?.status || '') && db.people.find(p => p.id === a.personId)?.status !== 'Создан').length), 0), 0), percent: plan ? Math.round(employees / plan * 100) : 0 };
}
