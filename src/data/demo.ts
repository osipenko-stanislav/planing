import { hireStatuses } from '../domain/model';

export const demoCandidates = [
  { id: '1', name: 'Ветров Артём Павлович', email: 'artem.vetrov@example.com', telegram: '@artem_demo', masterId: 'staff-1' },
  { id: '2', name: 'Луговая Марина Игоревна', email: 'marina.lugovaya@example.com', telegram: '@marina_demo', masterId: 'staff-2' },
  { id: '3', name: 'Озерский Тимофей Романович', email: 'timofey.ozersky@example.com', telegram: '@timofey_demo', masterId: 'staff-3' },
];
export function candyCandidate(url: string) {
  return demoCandidates.find(c => url === 'https://candy.example/candidates/' + c.id);
}
export function jiraTask(url: string) {
  if (!url.startsWith('https://jira.example/browse/DEMO-')) return;
  const number = Number(url.split('-').at(-1));
  if (!Number.isInteger(number) || number < 1 || number > 20) return;
  const status = number === 1 ? 'Оффер принят' : number === 2 ? 'Подписание' : number === 3 ? 'Оформлен' : hireStatuses[number - 3];
  return { status, startDate: '2026-12-01', employmentType: number % 2 ? 'ТД' : 'ГПД' };
}
