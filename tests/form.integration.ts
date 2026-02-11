import { test, expect, type Page } from '@playwright/test';

async function submitAndWait(page: Page) {
    const button = page.getByRole('button', { name: /Next|Submit/ });
    await button.click();
    await expect(button).toBeDisabled();
    await expect(button).toBeEnabled({ timeout: 5_000 });
}

test.describe('Multi-step form', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('completes full 3-step flow and submits', async ({ page }) => {
        await page.locator('input[name="name"]').fill('John Doe');
        await page.locator('input[name="age"]').fill('30');
        await submitAndWait(page);

        await expect(page.locator('input[name="telephone"]')).toBeVisible();
        await page.locator('input[name="telephone"]').fill('555-1234');
        await submitAndWait(page);

        await expect(
            page.getByRole('button', { name: 'Submit' }),
        ).toBeVisible();
        await expect(page.getByText('Name: John Doe')).toBeVisible();
        await expect(page.getByText('Age: 30')).toBeVisible();
        await expect(page.getByText('Telephone: 555-1234')).toBeVisible();

        const submit = page.getByRole('button', { name: 'Submit' });
        await submit.click();
        await expect(submit).toBeDisabled();
        await expect(
            page.getByText('Form submitted successfully!'),
        ).toBeVisible({ timeout: 5_000 });
    });

    test('skips steps when guest is checked', async ({ page }) => {
        await expect(page.locator('input[name="age"]')).toBeVisible();
        await page.locator('input[name="guest"]').click();
        await expect(page.locator('input[name="age"]')).not.toBeVisible();

        await page.locator('input[name="name"]').fill('Guest User');
        await submitAndWait(page);

        await expect(
            page.getByRole('button', { name: 'Submit' }),
        ).toBeVisible();
        await expect(page.getByText('Name: Guest User')).toBeVisible();
        await expect(page.getByText('Guest: Yes')).toBeVisible();
        await expect(page.getByText('Age:')).not.toBeVisible();
        await expect(page.getByText('Telephone:')).not.toBeVisible();

        const submit = page.getByRole('button', { name: 'Submit' });
        await submit.click();
        await expect(
            page.getByText('Form submitted successfully!'),
        ).toBeVisible({ timeout: 5_000 });
    });

    test('toggles guest on then off — fields reappear with reset values', async ({
        page,
    }) => {
        await page.locator('input[name="age"]').fill('25');
        await page.locator('input[name="guest"]').click();
        await expect(page.locator('input[name="age"]')).not.toBeVisible();

        await page.locator('input[name="guest"]').click();
        await expect(page.locator('input[name="age"]')).toBeVisible();
        await expect(page.locator('input[name="age"]')).toHaveValue('');
    });

    test('resets to first step preserving field values', async ({ page }) => {
        await page.locator('input[name="name"]').fill('Test User');
        await page.locator('input[name="age"]').fill('25');
        await submitAndWait(page);

        await expect(page.locator('input[name="telephone"]')).toBeVisible();
        await page.getByRole('button', { name: 'Reset' }).click();

        await expect(page.locator('input[name="name"]')).toBeVisible();
        await expect(page.locator('input[name="name"]')).toHaveValue(
            'Test User',
        );
        await expect(page.getByRole('button', { name: 'Back' })).toBeDisabled();
    });

    test('navigates back through steps', async ({ page }) => {
        await page.locator('input[name="name"]').fill('Nav Test');
        await page.locator('input[name="age"]').fill('40');
        await submitAndWait(page);

        await page.locator('input[name="telephone"]').fill('999-8888');
        await submitAndWait(page);

        await expect(
            page.getByRole('button', { name: 'Submit' }),
        ).toBeVisible();

        await page.getByRole('button', { name: 'Back' }).click();
        await expect(page.locator('input[name="telephone"]')).toBeVisible();
        await expect(page.locator('input[name="telephone"]')).toHaveValue(
            '999-8888',
        );

        await page.getByRole('button', { name: 'Back' }).click();
        await expect(page.locator('input[name="name"]')).toBeVisible();
        await expect(page.locator('input[name="name"]')).toHaveValue(
            'Nav Test',
        );
        await expect(page.getByRole('button', { name: 'Back' })).toBeDisabled();
    });

    test('shows validation errors and stays on step', async ({ page }) => {
        const next = page.getByRole('button', { name: 'Next' });
        await next.click();

        await expect(page.locator('input[name="name"]')).toBeVisible();
        await expect(page.getByText('Name is required')).toBeVisible();

        await page.locator('input[name="name"]').fill('Valid Name');
        await next.click();

        await expect(
            page.getByText('Age must be at least 2 characters'),
        ).toBeVisible();
    });

    test('clears validation errors after fixing fields', async ({ page }) => {
        const next = page.getByRole('button', { name: 'Next' });
        await next.click();
        await expect(page.getByText('Name is required')).toBeVisible();

        await page.locator('input[name="name"]').fill('Fixed');
        await page.locator('input[name="age"]').fill('30');
        await submitAndWait(page);

        await expect(page.getByText('Name is required')).not.toBeVisible();
        await expect(page.locator('input[name="telephone"]')).toBeVisible();
    });

    test('disables buttons during submission', async ({ page }) => {
        await page.locator('input[name="name"]').fill('John');
        await page.locator('input[name="age"]').fill('25');

        const next = page.getByRole('button', { name: 'Next' });
        const reset = page.getByRole('button', { name: 'Reset' });

        await next.click();
        await expect(next).toBeDisabled();
        await expect(reset).toBeDisabled();
        await expect(next).toBeEnabled({ timeout: 5_000 });
    });

    test('updates progress sidebar on navigation', async ({ page }) => {
        const sidebar = page.getByText('Form State').locator('..');
        const progress = sidebar.getByText('Progress').locator('..');
        await expect(progress.getByText('name', { exact: true })).toBeVisible();
        await expect(
            progress.getByText('address', { exact: true }),
        ).toBeVisible();
        await expect(
            progress.getByText('review', { exact: true }),
        ).toBeVisible();

        await page.locator('input[name="name"]').fill('Test');
        await page.locator('input[name="age"]').fill('30');
        await submitAndWait(page);

        await expect(
            progress.getByText('address', { exact: true }),
        ).toBeVisible();
    });

    test('displays form values in sidebar', async ({ page }) => {
        const sidebar = page.getByText('Form State').locator('..');

        await page.locator('input[name="name"]').fill('Sidebar Test');
        await expect(sidebar).toContainText('Sidebar Test');

        await page.locator('input[name="age"]').fill('42');
        await expect(sidebar).toContainText('42');
    });
});
