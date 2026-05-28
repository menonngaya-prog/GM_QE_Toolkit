const { test, expect } = require('@playwright/test');

test('Facebook login test', async ({ page }) => {

  // Open Facebook
  await page.goto('https://www.facebook.com/');

  // Enter email
  await page
    .getByRole('textbox', { name: 'Email or mobile number' })
    .fill('your-email@gmail.com');

  // Enter password
  await page
    .getByRole('textbox', { name: 'Password' })
    .fill('your-password');

  // Click login
  await page
    .getByRole('button', { name: 'Log In' })
    .click();

  // Wait few seconds
  await page.waitForTimeout(5000);

});