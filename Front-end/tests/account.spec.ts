import { test, expect, Page, APIRequestContext } from '@playwright/test';

test.describe('Account Page visuals and interactions', () => {
  test('navigates via header and matches baseline', async ({ page }: { page: Page }) => {
    // Go to home and navigate by clicking the header account button
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const accountBtn = page.getByRole('button', { name: /compte/i });
    await expect(accountBtn).toBeVisible();
    await accountBtn.click();

    // Verify route and key elements
    await expect(page).toHaveURL(/\/compte$/);
    await expect(page.getByRole('heading', { name: /connectez-vous à votre compte/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /déjà enregistré/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /nouveau client/i })).toBeVisible();
    await expect(page.getByLabel(/e-mail/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible();

    // Visual regression on the page container
    const container = page.locator('.account-page');
    await expect(container).toBeVisible();
    await expect(container).toHaveScreenshot('account-page.png', {
      maxDiffPixelRatio: 0.01,
    });
  });

  test('shows user name and logout after login', async ({ page, request }: { page: Page; request: APIRequestContext }) => {
    const email = 'test+' + Date.now() + '@example.com';
    const password = 'Password123';
    const regRes = await request.post('http://localhost:3001/api/v1/auth/register', {
      data: { email, password, firstName: 'Test', lastName: 'User' },
    });
    const regJson = await regRes.json();
    const accessToken = regJson?.data?.tokens?.accessToken;
    const refreshToken = regJson?.data?.tokens?.refreshToken;

    await page.addInitScript(([at, rt]) => {
      localStorage.setItem('accessToken', at as string);
      localStorage.setItem('refreshToken', rt as string);
    }, [accessToken, refreshToken]);

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('button', { name: /test user/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /deconnexion/i })).toBeVisible();
  });
});
