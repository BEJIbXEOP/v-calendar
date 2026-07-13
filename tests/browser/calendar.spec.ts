import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/browser/');
  await expect(page.locator('#interaction-calendar')).toBeVisible();
});

test('supports pointer and keyboard date selection', async ({ page }) => {
  const day = page.locator(
    '#interaction-calendar .id-2024-01-15 .vc-day-content',
  );

  await day.click();
  await expect(page.locator('#selected-date')).toHaveText('2024-01-15');

  await page
    .locator('#interaction-calendar .id-2024-01-16 .vc-day-content')
    .focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#selected-date')).toHaveText('2024-01-16');
});

test('applies layout custom properties without selector overrides', async ({
  page,
}) => {
  const calendar = page.locator('#variable-calendar');

  await expect(calendar.locator('.vc-day-content').first()).toHaveCSS(
    'width',
    '31px',
  );
  await expect(calendar.locator('.vc-header').first()).toHaveCSS(
    'margin-top',
    '0px',
  );
  await expect(calendar.locator('.vc-pane').first()).toHaveCSS(
    'min-width',
    '220px',
  );
  await expect(calendar.locator('.vc-time-picker')).toHaveCSS(
    'flex-direction',
    'row',
  );
  await expect(
    calendar.locator('.vc-time-select-group .vc-base-icon'),
  ).toHaveCSS('display', 'none');
  await expect(
    calendar.locator('.vc-time-select-group select').first(),
  ).toHaveCSS('background-color', 'rgb(1, 2, 3)');
  await expect(
    calendar.locator('.vc-time-select-group select').first(),
  ).toHaveCSS('width', '22px');
});

test('supports a real touch tap in WebKit', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'webkit-touch');
  const day = page.locator(
    '#interaction-calendar .id-2024-01-17 .vc-day-content',
  );
  const box = await day.boundingBox();
  expect(box).not.toBeNull();

  await page.touchscreen.tap(box!.x + box!.width / 2, box!.y + box!.height / 2);

  await expect(page.locator('#selected-date')).toHaveText('2024-01-17');
});

test('honors explicit themes and reacts only in automatic mode', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('#explicit-light')).toHaveClass(/vc-light/);
  await expect(page.locator('#explicit-dark')).toHaveClass(/vc-dark/);
  await expect(page.locator('#automatic')).toHaveClass(/vc-dark/);

  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('#automatic')).toHaveClass(/vc-light/);
  await expect(page.locator('#explicit-dark')).toHaveClass(/vc-dark/);
});

test('keeps theme state isolated between instances', async ({ page }) => {
  await expect(page.locator('#instance-light')).toHaveClass(/vc-light/);
  await expect(page.locator('#instance-dark')).toHaveClass(/vc-dark/);
});

test('uses the iframe document theme and cleans up on unmount', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  const frame = page.frameLocator('#theme-frame');
  await expect(frame.locator('#iframe-calendar')).toHaveClass(/vc-light/);

  await page.locator('#unmount-frame').click();
  await expect(frame.locator('#iframe-calendar')).toHaveCount(0);
});

test('closes popovers on outside pointer, Escape, focus loss, and trigger removal', async ({
  page,
}) => {
  await page.locator('#click-trigger').click();
  await expect(page.locator('#click-popover-content')).toBeVisible();
  await page.locator('#outside').click();
  await expect(page.locator('#click-popover-content')).toHaveCount(0);

  await page.locator('#click-trigger').click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#click-popover-content')).toHaveCount(0);

  await page.locator('#focus-trigger').focus();
  await expect(page.locator('#focus-popover-content')).toBeVisible();
  await page.locator('#outside').focus();
  await expect(page.locator('#focus-popover-content')).toHaveCount(0);

  await page.locator('#click-trigger').click();
  await page.locator('#remove-click-trigger').click();
  await expect(page.locator('#click-popover-content')).toHaveCount(0);
});

test('removes media-query and popover listeners during unmount', async ({
  page,
}) => {
  const mediaBefore = await page.evaluate(() => window.__mediaListenerCount);
  await page.locator('#toggle-automatic').click();
  await expect
    .poll(() => page.evaluate(() => window.__mediaListenerCount))
    .toBe(mediaBefore - 1);

  const popoversBefore = await page.evaluate(
    () => window.__popoverListenerCount,
  );
  await page.locator('#toggle-lifecycle').click();
  await expect(page.locator('#lifecycle-calendar')).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.__popoverListenerCount))
    .toBe(popoversBefore + 10);
  await page.locator('#toggle-lifecycle').click();
  await expect
    .poll(() => page.evaluate(() => window.__popoverListenerCount))
    .toBe(popoversBefore);
});
