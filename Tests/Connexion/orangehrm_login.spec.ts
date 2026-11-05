import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

let loginPage: LoginPage

   test.beforeEach(async ({ page }) => {
      loginPage = new LoginPage(page);
      await loginPage.goto();
  });

//Tests passants

test('connexion à OrangeHRM', async ({ page }) => {
  await loginPage.login('Admin', 'admin123');

  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByText('Time at Work')).toBeVisible();
});

test('déconnexion de OrangeHRM', async ({ page }) => {
  await loginPage.login('Admin', 'admin123');
  await page.getByRole('banner').getByText('John Doe').click();
  await page.getByRole('menuitem', { name: 'Logout' }).click();

  await expect(page).toHaveURL(/login/);
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();

});


//Tests non passants

const cas = [
  { titre: 'mauvais nom d\'utilisateur', user: 'Chris', mdp: 'admin123' },
  { titre: 'mauvais mot de passe', user: 'Admin', mdp: '123456a' },
];

for (const { titre, user, mdp } of cas) {
  test(`connexion refusée avec ${titre}`, async ({ page }) => {
    await loginPage.login(user, mdp);

    await expect(page).toHaveURL(/login/);
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });
}

const cas2 = [
  { titre: 'champs vides', user: '', mdp: '', attendu: 2 },
  { titre: 'nom d\'utilisateur vide', user: '', mdp: 'admin123', attendu: 1 },
  { titre: 'mot de passe vide', user: 'Admin', mdp:'', attendu: 1 },
];
for (const { titre, user, mdp, attendu } of cas2) {
  test(`connexion invalide avec ${titre}`, async ({ page }) => {
    await loginPage.login(user, mdp);

    await expect(page).toHaveURL(/login/);
    await expect(page.getByText('Required')).toHaveCount(attendu);
  });
}
