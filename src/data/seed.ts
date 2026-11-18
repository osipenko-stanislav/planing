import { emptyPerson, type Database, type Role } from '../domain/model';
const plan: Record<Role, number> = { 'Лид курса': 1, 'Автор курса': 1, 'Лектор': 2, 'Семинарист': 2, 'Ассистент': 1 };
export function createSeed(): Database {
  return {
    version: 1,
    directory: [
      { id: 'staff-1', name: 'Ветров Артём Павлович', email: 'artem.vetrov@example.com' },
      { id: 'staff-2', name: 'Луговая Марина Игоревна', email: 'marina.lugovaya@example.com' },
      { id: 'staff-3', name: 'Озерский Тимофей Романович', email: 'timofey.ozersky@example.com' },
      { id: 'staff-4', name: 'Рябинина Полина Андреевна', email: 'polina.ryabinina@example.com' },
      { id: 'staff-5', name: 'Леснов Денис Олегович', email: 'denis.lesnov@example.com' },
    ],
    directions: [
      { id: 'mathematics', name: 'Математика', team: { 'Лид направления': 'staff-1', 'HRBP': 'staff-2', 'Координатор ОП': 'staff-3', 'Рекрутер': 'staff-4', 'Менеджер ФК': 'staff-5' } },
      { id: 'computer-science', name: 'Компьютерные науки', team: { 'Лид направления': 'staff-3', 'HRBP': 'staff-2', 'Координатор ОП': 'staff-4', 'Рекрутер': 'staff-5', 'Менеджер ФК': 'staff-1' } },
      { id: 'business', name: 'Бизнес и управление', team: { 'Лид направления': 'staff-2', 'HRBP': 'staff-4', 'Координатор ОП': 'staff-1', 'Рекрутер': 'staff-5', 'Менеджер ФК': 'staff-3' } },
    ],
    courses: [
      { id: 'business-math', directionIds: ['mathematics'], name: 'Бизнес математика', year: '2026', semester: 'Осень', levels: ['МАГ', 'БАК'], intake: '2025, 2026', launch: 'Новый', groups: 5, lectures: 8, seminars: 2, plan: { ...plan } },
      { id: 'databases', directionIds: ['computer-science'], name: 'Базы данных', year: '2026', semester: 'Осень', levels: ['ДПО'], intake: '2026', launch: 'Повторный', groups: 3, lectures: 2, seminars: 2, plan: { ...plan, 'Лектор': 1 } },
      { id: 'financial-math', directionIds: ['mathematics'], name: 'Финансовая математика', year: '2026', semester: 'Весна', levels: ['МАГ'], intake: '2024, 2025', launch: 'Новый', groups: 5, lectures: 8, seminars: 2, plan: { ...plan } },
      { id: 'management', directionIds: ['business'], name: 'Финансовый и стратегический менеджмент в продуктовом управлении', year: '2025', semester: 'Осень', levels: ['ДПО'], intake: '2025', launch: 'Повторный', groups: 2, lectures: 2, seminars: 1, plan: { ...plan, 'Семинарист': 1 } },
      { id: 'calculus', directionIds: ['mathematics'], name: 'Математический анализ', year: '2025', semester: 'Весна', levels: ['БАК'], intake: '2025', launch: 'Повторный', groups: 4, lectures: 4, seminars: 2, plan: { ...plan } },
      { id: 'algorithms', directionIds: ['computer-science'], name: 'Алгоритмы и структуры данных', year: '2026', semester: 'Весна', levels: ['БАК'], intake: '2026', launch: 'Новый', groups: 4, lectures: 4, seminars: 2, plan: { ...plan } },
      { id: 'product-analytics', directionIds: ['business'], name: 'Продуктовая аналитика', year: '2026', semester: 'Осень', levels: ['ДПО'], intake: '2026', launch: 'Новый', groups: 3, lectures: 3, seminars: 2, plan: { ...plan, 'Лектор': 1 } },
      { id: 'linear-algebra', directionIds: ['mathematics'], name: 'Линейная алгебра', year: '2025', semester: 'Осень', levels: ['БАК'], intake: '2025', launch: 'Повторный', groups: 6, lectures: 6, seminars: 3, plan: { ...plan } },
      { id: 'web-development', directionIds: ['computer-science'], name: 'Современная веб-разработка', year: '2026', semester: 'Лето', levels: ['ДПО'], intake: '2026', launch: 'Новый', groups: 2, lectures: 2, seminars: 2, plan: { ...plan, 'Ассистент': 2 } },
    ],
    people: [
      { ...emptyPerson, id: 'artem-vetrov', name: 'Ветров Артём Павлович', employeeId: 'staff-1', status: 'ТД', coordinatorId: 'staff-3', online: true, offline: true, questionnaire: 'Заполнена', notes: 'Готов вести лекции и участвовать в разработке программы курса.', startDate: '2026-09-10', pairs: '10', schedule: 'На уточнении', email: 'artem.vetrov@example.com', telegram: '@artem_demo', jiraUrl: 'https://example.com/tasks/demo-101', passUrl: 'https://example.com/passes/demo-101', contactsNew: false },
      { ...emptyPerson, id: 'marina-lugovaya', name: 'Луговая Марина Игоревна', employeeId: 'staff-2', status: 'ГПД', coordinatorId: 'staff-3', questionnaire: 'Направлена', pairs: '4', history: 'Сотрудничал на этом курсе', email: 'marina.lugovaya@example.com', contactsNew: false },
      { ...emptyPerson, id: 'kirill-berestov', name: 'Берестов Кирилл Максимович', status: 'На оформлении ТД', candyUrl: 'https://example.com/candidates/demo-103', coordinatorId: 'staff-4', telegram: '@kirill_demo', contactsNew: true },
      { ...emptyPerson, id: 'alina-rodnikova', name: 'Родникова Алина Денисовна', status: 'Ожидает оформления', contactsNew: false },
      { ...emptyPerson, id: 'timofey-ozersky', name: 'Озерский Тимофей Романович', employeeId: 'staff-3', status: 'Перевод на ТД', email: 'timofey.ozersky@example.com', contactsNew: false },
    ],
    assignments: [
      { id: 'a1', courseId: 'business-math', personId: 'artem-vetrov', role: 'Лектор' },
      { id: 'a2', courseId: 'business-math', personId: 'kirill-berestov', role: 'Семинарист' },
      { id: 'a3', courseId: 'business-math', personId: 'marina-lugovaya', role: 'Лид курса' },
      { id: 'a4', courseId: 'financial-math', personId: 'artem-vetrov', role: 'Лектор' },
      { id: 'a5', courseId: 'financial-math', personId: 'alina-rodnikova', role: 'Ассистент' },
      { id: 'a6', courseId: 'databases', personId: 'timofey-ozersky', role: 'Лид курса' },
      { id: 'a7', courseId: 'management', personId: 'marina-lugovaya', role: 'Автор курса' },
    ],
  };
}
