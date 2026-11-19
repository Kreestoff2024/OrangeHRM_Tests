import { test as base, expect, Page } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

type MesFixtures = {
  roleinitial: string;
  utilisateur: string;
  nouveauNom: string;
};

const champ = (page: Page, libelle: string) =>
  page.locator('.oxd-input-group').filter({ has: page.getByText(libelle, { exact: true }) });

async function supprimerSiExiste(page: Page, username: string) {
  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/admin/viewSystemUsers');

  const boutonLogin = page.getByRole('button', { name: 'Login' });
  const rechercheUsername = champ(page, 'Username').locator('input');
  await expect(rechercheUsername.or(boutonLogin)).toBeVisible();
  if (await boutonLogin.isVisible()) return;

  await rechercheUsername.fill(username);
  await page.getByRole('button', { name: 'Search' }).click();

  const ligne = page.getByRole('row').filter({ hasText: username });
  await expect(ligne.or(page.getByText('No Records Found').first())).toBeVisible();
  if (await ligne.count() > 0) {
    await ligne.locator('.oxd-table-cell-actions button').first().click();
    await page.getByRole('button', { name: 'Yes, Delete' }).click();
    await expect(page.getByText('Successfully Deleted')).toBeVisible();
  }
}

export const test = base.extend<MesFixtures>({
  roleinitial: ['Admin', { option: true }],

  nouveauNom: async ({ page }, use) => {
    const username = `kristof_${Math.floor(Math.random() * 100000)}`;
    await use(username);
    await supprimerSiExiste(page, username);
  },

  utilisateur: async ({ page, roleinitial }, use) => {
    const username = `kristof_${Math.floor(Math.random() * 100000)}`;

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('Admin', 'admin123');
    await page.getByRole('link', { name: 'Admin' }).click();
    await page.getByRole('button', { name: 'Add' }).click();

    await champ(page, 'User Role').locator('.oxd-select-text').click();
    await page.getByRole('option', { name: roleinitial, exact: true }).click();

    await champ(page, 'Employee Name').getByPlaceholder('Type for hints...').fill('c');
    const employe = page.getByRole('option').filter({ hasNotText: 'Searching' }).first();
    await expect(employe).toBeVisible();
    await employe.click();
    await expect(champ(page, 'Employee Name').getByPlaceholder('Type for hints...')).not.toHaveValue('c');

    await champ(page, 'Status').locator('.oxd-select-text').click();
    await page.getByRole('option', { name: 'Enabled' }).click();

    await champ(page, 'Username').locator('input').fill(username);
    await champ(page, 'Password').locator('input').fill('123456789a');
    await champ(page, 'Confirm Password').locator('input').fill('123456789a');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Successfully Saved')).toBeVisible();
    await expect(page).toHaveURL(/viewSystemUsers/);

    await use(username);

    await supprimerSiExiste(page, username);
  },
});

export { expect };