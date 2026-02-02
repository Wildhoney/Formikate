import { test, expect } from '@playwright/test';

test.describe('Simple multi-step form', () => {
    test('should complete a 3-step form flow and submit', async ({ page }) => {
        await page.goto('/');

        await expect(page.getByRole('heading', { name: 'Registration Form' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Back' })).toBeDisabled();
        await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();

        await page.locator('input[name="name"]').fill('John Doe');
        await page.locator('input[name="age"]').fill('30');
        await page.getByRole('button', { name: 'Next' }).click();

        await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
        await page.waitForTimeout(2500);

        await expect(page.locator('input[name="telephone"]')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Back' })).toBeEnabled();

        await page.locator('input[name="telephone"]').fill('555-1234');
        await page.getByRole('button', { name: 'Next' }).click();

        await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
        await page.waitForTimeout(2500);

        await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
        await expect(page.getByText('Name: John Doe')).toBeVisible();
        await expect(page.getByText('Telephone: 555-1234')).toBeVisible();

        await page.getByRole('button', { name: 'Submit' }).click();

        await expect(page.getByRole('button', { name: 'Submit' })).toBeDisabled();
        await page.waitForTimeout(2500);

        await expect(page.getByText('Form submitted successfully!')).toBeVisible();
    });

    test('should skip steps and hide fields when guest checkbox is checked', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('input[name="age"]')).toBeVisible();

        await page.locator('input[name="guest"]').check();

        await expect(page.locator('input[name="age"]')).not.toBeVisible();

        await page.locator('input[name="name"]').fill('Guest User');
        await page.getByRole('button', { name: 'Next' }).click();

        await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
        await page.waitForTimeout(2500);

        await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
        await expect(page.getByText('Name: Guest User')).toBeVisible();
        await expect(page.getByText('Guest: Yes')).toBeVisible();

        await page.getByRole('button', { name: 'Submit' }).click();

        await expect(page.getByRole('button', { name: 'Submit' })).toBeDisabled();
        await page.waitForTimeout(2500);

        await expect(page.getByText('Form submitted successfully!')).toBeVisible();
    });

    test('should reset to first step when clicking reset button', async ({ page }) => {
        await page.goto('/');

        await page.locator('input[name="name"]').fill('Test User');
        await page.locator('input[name="age"]').fill('25');
        await page.getByRole('button', { name: 'Next' }).click();

        await page.waitForTimeout(2500);

        await expect(page.locator('input[name="telephone"]')).toBeVisible();

        await page.getByRole('button', { name: 'Reset' }).click();

        await expect(page.locator('input[name="name"]')).toBeVisible();
        await expect(page.locator('input[name="name"]')).toHaveValue('Test User');
        await expect(page.getByRole('button', { name: 'Back' })).toBeDisabled();
    });

    test('should navigate back to first step from review using handleGoto', async ({ page }) => {
        await page.goto('/');

        await page.locator('input[name="name"]').fill('Order Test');
        await page.locator('input[name="age"]').fill('40');
        await page.getByRole('button', { name: 'Next' }).click();

        await page.waitForTimeout(2500);

        await page.locator('input[name="telephone"]').fill('999-8888');
        await page.getByRole('button', { name: 'Next' }).click();

        await page.waitForTimeout(2500);

        await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();

        await page.getByRole('button', { name: 'Reset' }).click();

        await expect(page.locator('input[name="name"]')).toBeVisible();
        await expect(page.locator('input[name="name"]')).toHaveValue('Order Test');
    });

    test('should show validation error and stay on step when validation fails', async ({ page }) => {
        await page.goto('/');

        await page.getByRole('button', { name: 'Next' }).click();

        await page.waitForTimeout(2500);

        await expect(page.locator('input[name="name"]')).toBeVisible();
        await expect(page.getByText('Name is required')).toBeVisible();

        await page.locator('input[name="name"]').fill('Valid Name');
        await page.getByRole('button', { name: 'Next' }).click();

        await page.waitForTimeout(2500);

        await expect(page.getByText('Age must be at least 2 characters')).toBeVisible();
    });

    test('should navigate to step with validation error on submit', async ({ page }) => {
        await page.goto('/');

        await page.locator('input[name="name"]').fill('Test User');
        await page.locator('input[name="age"]').fill('25');
        await page.getByRole('button', { name: 'Next' }).click();

        await page.waitForTimeout(2500);

        await page.locator('input[name="telephone"]').fill('555-1234');
        await page.getByRole('button', { name: 'Next' }).click();

        await page.waitForTimeout(2500);

        await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();

        await page.getByRole('button', { name: 'Back' }).click();
        await page.getByRole('button', { name: 'Back' }).click();

        await expect(page.locator('input[name="name"]')).toBeVisible();
        await page.locator('input[name="name"]').clear();

        await page.getByRole('button', { name: 'Next' }).click();

        await page.waitForTimeout(2500);

        await expect(page.locator('input[name="name"]')).toBeVisible();
        await expect(page.getByText('Name is required')).toBeVisible();
    });
});
