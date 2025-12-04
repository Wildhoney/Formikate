import { test, expect } from '@playwright/test';

test.describe('Multi-step form', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should display initial step', async ({ page }) => {
        await expect(
            page.getByRole('heading', { name: 'Personal Information' }),
        ).toBeVisible();
        await expect(page.locator('input[name="name"]')).toBeVisible();
        await expect(page.locator('input[name="age"]')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Back' })).toBeDisabled();
        await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();
    });

    test('should navigate to next step', async ({ page }) => {
        await page.locator('input[name="name"]').fill('John');
        await page.locator('input[name="age"]').fill('30');
        await page.getByRole('button', { name: 'Next' }).click();

        await expect(
            page.getByRole('heading', { name: 'Contact Details' }),
        ).toBeVisible();
        await expect(page.locator('input[name="telephone"]')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Back' })).toBeEnabled();
    });

    test('should preserve values when navigating back', async ({ page }) => {
        await page.locator('input[name="name"]').fill('John');
        await page.locator('input[name="age"]').fill('30');
        await page.getByRole('button', { name: 'Next' }).click();

        await expect(
            page.getByRole('heading', { name: 'Contact Details' }),
        ).toBeVisible();

        await page.getByRole('button', { name: 'Back' }).click();

        await expect(
            page.getByRole('heading', { name: 'Personal Information' }),
        ).toBeVisible();
        await expect(page.locator('input[name="name"]')).toHaveValue('John');
        await expect(page.locator('input[name="age"]')).toHaveValue('30');
    });

    test('should preserve form state through multiple navigations', async ({
        page,
    }) => {
        await page.locator('input[name="name"]').fill('Jane');
        await page.locator('input[name="age"]').fill('25');
        await page.getByRole('button', { name: 'Next' }).click();

        await expect(
            page.getByRole('heading', { name: 'Contact Details' }),
        ).toBeVisible();
        await page.locator('input[name="telephone"]').fill('123456789');

        await page.getByRole('button', { name: 'Back' }).click();
        await expect(page.locator('input[name="name"]')).toHaveValue('Jane');
        await expect(page.locator('input[name="age"]')).toHaveValue('25');

        await page.getByRole('button', { name: 'Next' }).click();
        await expect(page.locator('input[name="telephone"]')).toHaveValue(
            '123456789',
        );
    });

    test('should show/hide age field based on guest checkbox', async ({
        page,
    }) => {
        await expect(page.locator('input[name="age"]')).toBeVisible();

        await page.locator('input[name="guest"]').check();
        await expect(page.locator('input[name="age"]')).not.toBeVisible();

        await page.locator('input[name="guest"]').uncheck();
        await expect(page.locator('input[name="age"]')).toBeVisible();
    });

    test('should navigate to first step when clicking reset', async ({
        page,
    }) => {
        await page.locator('input[name="name"]').fill('Test');
        await page.locator('input[name="age"]').fill('99');
        await page.getByRole('button', { name: 'Next' }).click();

        await expect(
            page.getByRole('heading', { name: 'Contact Details' }),
        ).toBeVisible();

        await page.getByRole('button', { name: 'Reset' }).click();

        await expect(
            page.getByRole('heading', { name: 'Personal Information' }),
        ).toBeVisible();
        await expect(page.locator('input[name="name"]')).toHaveValue('Test');
        await expect(page.locator('input[name="age"]')).toHaveValue('99');
    });
});

test.describe('Virtual field behavior', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should not deregister fields when virtual parent hides', async ({
        page,
    }) => {
        await page.locator('input[name="name"]').fill('Virtual Test');
        await page.locator('input[name="age"]').fill('42');

        await page.getByRole('button', { name: 'Next' }).click();
        await expect(
            page.getByRole('heading', { name: 'Contact Details' }),
        ).toBeVisible();

        await page.getByRole('button', { name: 'Back' }).click();
        await expect(
            page.getByRole('heading', { name: 'Personal Information' }),
        ).toBeVisible();

        await expect(page.locator('input[name="name"]')).toHaveValue(
            'Virtual Test',
        );
        await expect(page.locator('input[name="age"]')).toHaveValue('42');
    });

    test('should deregister conditionally rendered fields', async ({
        page,
    }) => {
        await page.locator('input[name="age"]').fill('50');

        await page.locator('input[name="guest"]').check();
        await expect(page.locator('input[name="age"]')).not.toBeVisible();

        await page.locator('input[name="guest"]').uncheck();
        await expect(page.locator('input[name="age"]')).toBeVisible();
        await expect(page.locator('input[name="age"]')).toHaveValue('');
    });
});
