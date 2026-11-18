import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBeforeUnload, useBlocker, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useRepository } from '../data/repository';
import { emptyPerson, personSchema, hireStatuses, isEmployee, roles, questionnaireOptions, scheduleOptions, historyOptions, type PersonFields, type Person } from '../domain/model';
import { Button } from '../components/ui/button';
import { Dialog } from '../components/ui/dialog';
import { Select } from '../components/ui/select';
import { DatePicker } from '../components/ui/date-picker';
import { useFeedback } from '../components/Feedback';
import { NotFound } from './NotFound';
export function PersonEditor() {
  const { id } = useParams(); const { db } = useRepository(); const [params] = useSearchParams();
  const person = db.people.find(p => p.id === id); const creating = id === undefined;
  if (!creating && !person) return <NotFound/>;
  const courseId = params.get('course') || '';
  if (creating && !db.courses.some(c => c.id === courseId)) return <NotFound/>;
  return <EditorForm key={person?.id || 'new'} person={person} courseId={courseId} role={params.get('role') || roles[0]}/>;
}
function EditorForm({ person, courseId, role }: { person?: Person; courseId: string; role: string }) {
  const { db, update } = useRepository(); const feedback = useFeedback(); const navigate = useNavigate(); const [cancel, setCancel] = useState(false); const [saving, setSaving] = useState(false); const [saveError, setSaveError] = useState('');
  const bypass = useRef(false);
  const { register, control, watch, handleSubmit, formState: { errors, isDirty }, reset, setValue } = useForm<PersonFields>({ resolver: zodResolver(personSchema), defaultValues: person || { ...emptyPerson }, mode: 'onSubmit', reValidateMode: 'onChange' });
  const status = watch('status'); const employee = isEmployee(status);
  const target = person ? `/people/${person.id}${courseId ? `?course=${courseId}` : ''}` : `/courses/${courseId}`;
  const blocker = useBlocker(({ currentLocation, nextLocation }) => !bypass.current && isDirty && (currentLocation.pathname !== nextLocation.pathname || currentLocation.search !== nextLocation.search));
  useBeforeUnload(useCallback((event: BeforeUnloadEvent) => { if (isDirty && !bypass.current) { event.preventDefault(); event.returnValue = ''; } }, [isDirty]));
  useEffect(() => { bypass.current = false; }, []);
  async function save(values: PersonFields) {
    setSaving(true); setSaveError('');
    try {
      const selected = db.directory.find(p => p.id === values.employeeId);
      const data = { ...values, startDate: values.startDate && /^\d{2}\.\d{2}\.\d{4}$/.test(values.startDate) ? values.startDate.split('.').reverse().join('-') : values.startDate, name: employee && selected ? selected.name : values.name };
      const contactsChanged = (['telegram', 'email', 'universityEmail'] as const).some(k => Boolean(data[k]) && data[k] !== (person?.[k] || ''));
      const personId = person?.id || crypto.randomUUID();
      update(d => ({ ...d, people: person ? d.people.map(p => p.id === person.id ? { ...p, ...data, contactsNew: p.contactsNew || contactsChanged } : p) : [...d.people, { ...data, id: personId, contactsNew: contactsChanged }], assignments: person ? d.assignments : [...d.assignments, { id: crypto.randomUUID(), personId, courseId, role: roles.includes(role as typeof roles[number]) ? role as typeof roles[number] : roles[0] }] }));
      bypass.current = true; reset(data); feedback(person ? 'Изменения сохранены' : 'Карточка добавлена'); navigate(`/people/${personId}${courseId ? `?course=${courseId}` : ''}`, { replace: !person });
    } catch { setSaveError('Не смогли сохранить изменения. Проверь доступ к хранилищу браузера и попробуй снова.'); } finally { setSaving(false); }
  }
  const select = (key: keyof PersonFields, options: readonly string[] | { value: string; label: string; description?: string }[], onChangeExtra?: (v: string) => void) => <Controller name={key} control={control} render={({ field }) => <Select id={key} value={String(field.value)} onChange={v => { field.onChange(v); onChangeExtra?.(v); }} options={options} invalid={!!errors[key]} disabled={saving}/>}/>;
  const field = (key: keyof PersonFields, label: string, child: ReactNode) => <div className="field" key={key}><label htmlFor={key}>{label}</label>{child}{errors[key] && <small id={`${key}-error`} className="field-error" role="alert">{errors[key]?.message}</small>}</div>;
  const input = (key: keyof PersonFields, label: string, type = 'text', placeholder?: string) => field(key, label, <input id={key} type={type} placeholder={placeholder} {...register(key)} disabled={saving} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${key}-error` : undefined}/>);
  const textarea = (key: 'notes' | 'comment', label: string) => field(key, label, <textarea id={key} {...register(key)} disabled={saving}/>);
  return <><h1>{person ? 'Редактировать данные' : 'Добавить кандидата / сотрудника'}</h1><form className="person-form" noValidate onSubmit={handleSubmit(save, () => setSaveError('Проверь выделенные поля. Введённые данные сохранены в форме.'))}><fieldset disabled={saving}><legend>Общая информация</legend>{field('status', 'Статус найма', select('status', hireStatuses))}{employee ? field('employeeId', 'Сотрудник', select('employeeId', db.directory.map(p => ({ value: p.id, label: p.name, description: p.email })), v => { const p = db.directory.find(p => p.id === v); if (p) setValue('name', p.name, { shouldDirty: true, shouldValidate: true }); })) : input('name', 'Кандидат', 'text', 'Введи имя кандидата')}{!employee && input('candyUrl', 'Карточка кандидата в Candy', 'url', 'https://')}{input('jiraUrl', `Jira-таска по ${employee ? 'сотруднику' : 'кандидату'}`, 'url', 'https://')}{input('passUrl', 'Заявка на пропуск', 'url', 'https://')}{field('coordinatorId', 'Ответственный координатор', select('coordinatorId', [{ value: 'none', label: 'Не назначен' }, ...db.directory.map(p => ({ value: p.id, label: p.name, description: p.email }))]))}<div className="form-two-columns">{(['online', 'offline'] as const).map((key, i) => <div className="field" key={key}><label htmlFor={key}>Онбординг {i === 0 ? 'онлайн' : 'офлайн'}</label><label className="checkbox-block"><input id={key} type="checkbox" {...register(key)}/>Приглашение отправлено</label></div>)}</div>{field('questionnaire', 'Анкета ППС', select('questionnaire', questionnaireOptions))}{textarea('notes', 'Заметки')}{field('startDate', 'Дата выхода', <Controller name="startDate" control={control} render={({ field }) => <DatePicker value={String(field.value || '')} onChange={field.onChange} invalid={!!errors.startDate} disabled={saving}/>}/>) }</fieldset><fieldset disabled={saving}><legend>Сотрудничество</legend>{input('pairs', 'Количество пар в неделю', 'number', 'Введи количество')}{field('schedule', 'Пожелания по расписанию', select('schedule', scheduleOptions))}{field('history', 'История сотрудничества', select('history', historyOptions))}{textarea('comment', 'Комментарий по сотрудничеству')}</fieldset><fieldset disabled={saving}><legend>Контакты</legend>{input('telegram', 'Telegram', 'text', '@username')}{input('email', 'Личная почта', 'email', 'name@example.com')}{employee && input('universityEmail', 'Почта ЦУ', 'email', 'name@example.com')}</fieldset>{saveError && <div role="alert" className="form-error">{saveError}</div>}<div className="form-actions"><span className="muted" role="status">{saving ? 'Сохранение…' : isDirty ? 'Есть несохранённые изменения' : ''}</span><Button type="button" variant="outline" onClick={() => isDirty ? setCancel(true) : navigate(target)} disabled={saving}>Отмена</Button><Button type="submit" disabled={saving}>{saving ? 'Сохранение…' : 'Сохранить'}</Button></div></form><Dialog open={cancel || blocker.state === 'blocked'} onOpenChange={open => { if (!open) { setCancel(false); if (blocker.state === 'blocked') blocker.reset(); } }} title="Оставить изменения несохранёнными?" description="Изменения в карточке будут потеряны. Можно вернуться к редактированию."><div className="dialog-actions"><Button variant="outline" onClick={() => { setCancel(false); if (blocker.state === 'blocked') blocker.reset(); }}>Продолжить редактирование</Button><Button onClick={() => { bypass.current = true; if (blocker.state === 'blocked') blocker.proceed(); else { reset(); setCancel(false); navigate(target); } }}>Выйти без сохранения</Button></div></Dialog></>;
}
