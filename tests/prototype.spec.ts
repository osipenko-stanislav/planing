import { test, expect } from '@playwright/test';
test.use({ channel: 'chrome' }); test('navigation, validation, persistence and shared representations', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Кадровое планирование' })).toBeVisible();
  await page.goto('/directions/mathematics');
  await expect(page).toHaveURL(/directions\/mathematics/);
  await page.getByRole('link', { name: 'Бизнес математика', exact: true }).click();
  await expect(page).toHaveURL(/courses\/business-math/);
  await page.getByRole('link', { name: /Ветров Артём Павлович/ }).click();
  await page.getByRole('link', { name: 'Редактировать данные' }).click();
  await page.getByLabel('Тип позиции',{exact:true}).click(); await page.getByRole('option',{name:'Оформлен',exact:true}).click(); await page.getByLabel('Личная почта', { exact: true }).fill('invalid');
  await page.getByLabel('Количество пар в неделю').fill('-1');
  await page.getByLabel('Заметки', { exact: true }).fill('Изменения для проверки сохранения');
  await page.getByRole('button', { name: 'Сохранить', exact: true }).click();
  await expect(page.getByText('Введи почту в формате name@example.com')).toBeVisible();
  await expect(page.getByText('Введи целое неотрицательное число')).toBeVisible();
  await expect(page.getByLabel('Заметки', { exact: true })).toHaveValue('Изменения для проверки сохранения');
  await page.getByLabel('Личная почта', { exact: true }).fill('changed@example.com');
  await page.getByLabel('Количество пар в неделю').fill('12');
  await expect(page.getByText('Введи почту в формате name@example.com')).toHaveCount(0);
  await page.getByRole('button', { name: 'Сохранить', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Изменения сохранены' })).toBeVisible();
  await expect(page).toHaveURL(/people\/artem-vetrov\?course=business-math$/);
  await page.reload();
  await expect(page.getByText('Изменения для проверки сохранения')).toBeVisible();
  await page.getByRole('tab', { name: /Контакты/ }).click();
  await expect(page.getByRole('link', { name: 'changed@example.com' })).toBeVisible();
  await page.getByRole('button', { name: 'Взять в работу' }).click();
  await expect(page.getByRole('tab', { name: /Контакты/ })).not.toContainText('Новый');
  await page.getByRole('link', { name: 'Финансовая математика', exact: true }).click();
  await page.getByRole('link', { name: /Ветров Артём Павлович/ }).click();
  await expect(page.getByText('Изменения для проверки сохранения')).toBeVisible();
  await page.goto('/directions/mathematics');
  await expect(page.getByRole('heading', { name: 'Математика' })).toBeVisible();
  const counts = await page.evaluate(() => { const db = JSON.parse(localStorage.getItem('cu-staff-planning:v1')!); return { people: db.people.length, assignments: db.assignments.length }; });
  expect(counts).toEqual({ people: 5, assignments: 7 }); expect(errors).toEqual([]);
});
test('required links and unsaved changes', async ({page}) => {
 await page.goto('/people/new?course=business-math');
 await page.getByRole('button',{name:'Сохранить',exact:true}).click();
 await expect(page.getByText('Укажи Jira-таску',{exact:true})).toBeVisible();
 await expect(page.getByText('Укажи карточку кандидата в Candy',{exact:true})).toBeVisible();
 await page.getByLabel('Заметки',{exact:true}).fill('Несохранённые данные');
 await page.getByRole('button',{name:'Отмена',exact:true}).click();
 await page.getByRole('button',{name:'Продолжить редактирование'}).click();
 await expect(page.getByLabel('Заметки',{exact:true})).toHaveValue('Несохранённые данные');
 await page.getByRole('button',{name:'Отмена',exact:true}).click();
 await page.getByRole('button',{name:'Выйти без сохранения'}).click();
 await expect(page).toHaveURL(/courses/);
});
test('localStorage error preserves input and reports failure', async ({ page }) => {
  await page.goto('/people/alina-rodnikova/edit?course=financial-math');
  await page.getByLabel('Карточка кандидата в Candy *',{exact:true}).fill('https://candy.example/candidates/2'); await page.getByLabel('Jira-таска по кандидату',{exact:true}).fill('https://jira.example/browse/DEMO-1'); await page.getByLabel('Заметки', { exact: true }).fill('Данные не должны потеряться');
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('Quota exceeded', 'QuotaExceededError'); }; });
  await page.getByRole('button', { name: 'Сохранить', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Не смогли сохранить изменения' })).toBeVisible();
  await expect(page.getByLabel('Заметки', { exact: true })).toHaveValue('Данные не должны потеряться');
});
test('responsive screens, assets, keyboard and screenshots', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  for (const width of [1440, 1280, 1024, 768]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [name, path] of [['home', '/'], ['course', '/courses/business-math'], ['person', '/people/artem-vetrov?course=business-math'], ['form', '/people/artem-vetrov/edit?course=business-math']]) {
      await page.goto(path); await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      expect(await page.locator('img').evaluateAll(images => images.every(i => i.complete && i.naturalWidth > 0))).toBe(true);
      await page.screenshot({ path: `test-results/screenshots/${name}-${width}.png`, fullPage: true });
    }
  }
  await page.goto('/people/artem-vetrov/edit');
  await page.getByLabel('Тип позиции', { exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByLabel('Тип позиции', { exact: true })).toBeFocused();
  expect(errors).toEqual([]);
});
