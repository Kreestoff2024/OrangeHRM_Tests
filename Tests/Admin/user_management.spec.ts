//import { test, expect } from '@playwright/test';
import { test, expect } from '../fixtures';
import { LoginPage } from '../pages/LoginPage';


test('ajouter un nouvel utilisateur', async ({ page, nouveauNom }) => {

  const champ = (libelle: string) =>
    page.locator('.oxd-input-group').filter({ has: page.getByText(libelle, { exact: true }) });

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('Admin', 'admin123');
  await page.getByRole('link', { name: 'Admin' }).click();
  await page.getByRole('button', { name: 'Add' }).click();

  await champ('User Role').locator('.oxd-select-text').click();
  await page.getByRole('option', { name: 'Admin' }).click();

  await champ('Employee Name').getByPlaceholder('Type for hints...').fill('c');
  const employe = page.getByRole('option').filter({ hasNotText: 'Searching' }).first();
  await expect(employe).toBeVisible();
  await employe.click();
  await expect(champ('Employee Name').getByPlaceholder('Type for hints...')).not.toHaveValue('c');

  await champ('Status').locator('.oxd-select-text').click();
  await page.getByRole('option', { name: 'Enabled' }).click();

  await champ('Username').locator('input').fill(nouveauNom);
  await champ('Password').locator('input').fill('123456789a');
  await champ('Confirm Password').locator('input').fill('123456789a');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Successfully Saved')).toBeVisible();
  await expect(page).toHaveURL(/viewSystemUsers/);

  await champ('Username').locator('input').fill(nouveauNom);
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByRole('row').filter({ hasText: nouveauNom })).toBeVisible();
  
});

test('modifier rôle utilisateur Admin vers ESS', async ({ page, utilisateur }) => { 
  const username = utilisateur

  const champ = (libelle: string) =>
    page.locator('.oxd-input-group').filter({ has: page.getByText(libelle, { exact: true }) });

  await champ('Username').locator('input').fill(username);
  await page.getByRole('button', { name: 'Search' }).click();

  const ligne = page.getByRole('row').filter({ hasText: username });
  await expect(ligne).toBeVisible();
  await ligne.locator('.oxd-table-cell-actions button').nth(1).click(); 

  await champ('User Role').locator('.oxd-select-text').click();
  await page.getByRole('option', { name: 'ESS' }).click();
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully Updated')).toBeVisible();
  await expect(page).toHaveURL(/viewSystemUsers/);

  await champ('Username').locator('input').fill(username);
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByRole('row').filter({ hasText: username }).getByRole('cell').nth(2)).toHaveText('ESS');

});

test.describe('ESS vers Admin', () => {
  test.use({ roleinitial: 'ESS' });

  test('modifier rôle utilisateur ESS vers Admin', async ({ page, utilisateur }) => {
    const username = utilisateur;
    const champ = (libelle: string) =>
      page.locator('.oxd-input-group').filter({ has: page.getByText(libelle, { exact: true }) });

    await champ('Username').locator('input').fill(username);
    await page.getByRole('button', { name: 'Search' }).click();

    const ligne = page.getByRole('row').filter({ hasText: username });
    await expect(ligne).toBeVisible();
    await ligne.locator('.oxd-table-cell-actions button').nth(1).click(); 

    await champ('User Role').locator('.oxd-select-text').click();
    await page.getByRole('option', { name: 'Admin' }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Successfully Updated')).toBeVisible();
    await expect(page).toHaveURL(/viewSystemUsers/);

    await champ('Username').locator('input').fill(username);
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByRole('row').filter({ hasText: username }).getByRole('cell').nth(2)).toHaveText('Admin');

})});


test('supprimer un utilisateur', async ({ page, utilisateur }) => {
  const champ = (libelle: string) =>
    page.locator('.oxd-input-group').filter({ has: page.getByText(libelle, { exact: true }) });

  await champ('Username').locator('input').fill(utilisateur);
  await page.getByRole('button', { name: 'Search' }).click();

  const ligne = page.getByRole('row').filter({ hasText: utilisateur });
  await expect(ligne).toBeVisible();
  await ligne.locator('.oxd-table-cell-actions button').first().click();   
  await page.getByRole('button', { name: 'Yes, Delete' }).click();
  await expect(page.getByText('Successfully Deleted')).toBeVisible();

  await champ('Username').locator('input').fill(utilisateur);
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByText('No Records Found').first()).toBeVisible();
  await expect(ligne).toHaveCount(0);

});