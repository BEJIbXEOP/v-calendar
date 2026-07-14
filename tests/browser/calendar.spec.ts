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
  await expect(
    calendar.locator('.id-2023-12-31 .vc-day-content'),
  ).toHaveCSS('opacity', '0.35');
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

test('displays dates from adjacent months in every monthly pane', async ({
  page,
}) => {
  const singlePane = page.locator('#interaction-calendar .vc-pane').first();
  const periodPanes = page.locator('#period-calendar .vc-pane');

  await expect(
    singlePane.locator('.id-2023-12-31 .vc-day-content'),
  ).toHaveText('31');
  await expect(
    singlePane.locator('.id-2023-12-31 .vc-day-content'),
  ).toHaveCSS('opacity', '0.6');
  await expect(
    singlePane.locator('.id-2024-02-01 .vc-day-content'),
  ).toHaveCSS('opacity', '0.6');

  await expect(
    periodPanes.nth(0).locator('.id-2023-12-31 .vc-day-content'),
  ).toHaveCSS('opacity', '0.6');
  await expect(
    periodPanes.nth(1).locator('.id-2024-01-28 .vc-day-content'),
  ).toHaveCSS('opacity', '0.6');
  await expect(
    periodPanes.nth(1).locator('.id-2024-03-01 .vc-day-content'),
  ).toHaveCSS('opacity', '0.6');
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

test('renders a two-month period horizontally with per-pane controls', async ({
  page,
}) => {
  const calendar = page.locator('#period-calendar');
  const panes = calendar.locator('.vc-pane');

  await expect(panes).toHaveCount(2);
  const firstBox = await panes.nth(0).boundingBox();
  const secondBox = await panes.nth(1).boundingBox();
  expect(firstBox).not.toBeNull();
  expect(secondBox).not.toBeNull();
  expect(secondBox!.x).toBeGreaterThanOrEqual(firstBox!.x + firstBox!.width);
  await expect(panes.nth(0).locator('.vc-arrow')).toHaveCount(2);
  await expect(panes.nth(1).locator('.vc-arrow')).toHaveCount(2);
  await expect(panes.nth(0).locator('.vc-title')).toHaveText('January 2024');
  await expect(panes.nth(1).locator('.vc-title')).toHaveText('February 2024');

  await panes.nth(1).locator('.vc-next').click();
  await expect(panes.nth(0).locator('.vc-title')).toHaveText('February 2024');
  await expect(panes.nth(1).locator('.vc-title')).toHaveText('March 2024');

  await panes.nth(1).locator('.vc-title').click();
  await page.locator('.vc-nav-item[data-id="2024.06"]').click();
  await expect(panes.nth(0).locator('.vc-title')).toHaveText('May 2024');
  await expect(panes.nth(1).locator('.vc-title')).toHaveText('June 2024');
});

test('keeps trimmed period panes at the same week count', async ({ page }) => {
  const panes = page.locator('#balanced-period-calendar .vc-pane');

  await expect(panes).toHaveCount(2);
  await expect(panes.nth(0).locator('.vc-week')).toHaveCount(6);
  await expect(panes.nth(1).locator('.vc-week')).toHaveCount(6);

  const firstWeeksBox = await panes.nth(0).locator('.vc-weeks').boundingBox();
  const secondWeeksBox = await panes.nth(1).locator('.vc-weeks').boundingBox();
  expect(firstWeeksBox).not.toBeNull();
  expect(secondWeeksBox).not.toBeNull();
  expect(firstWeeksBox!.height).toBe(secondWeeksBox!.height);
});

test('keeps compact period headers inside their panes', async ({ page }) => {
  const panes = page.locator('#balanced-period-calendar .vc-pane');

  for (let index = 0; index < 2; index += 1) {
    const paneBox = await panes.nth(index).boundingBox();
    const headerBox = await panes.nth(index).locator('.vc-header').boundingBox();
    const prevBox = await panes.nth(index).locator('.vc-prev').boundingBox();
    const nextBox = await panes.nth(index).locator('.vc-next').boundingBox();

    expect(paneBox).not.toBeNull();
    expect(headerBox).not.toBeNull();
    expect(prevBox).not.toBeNull();
    expect(nextBox).not.toBeNull();
    expect(headerBox!.x).toBeGreaterThanOrEqual(paneBox!.x);
    expect(headerBox!.x + headerBox!.width).toBeLessThanOrEqual(
      paneBox!.x + paneBox!.width,
    );
    expect(prevBox!.x).toBeGreaterThanOrEqual(headerBox!.x);
    expect(nextBox!.x + nextBox!.width).toBeLessThanOrEqual(
      headerBox!.x + headerBox!.width,
    );
  }
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

  await frame.locator('#iframe-date-trigger').focus();
  const iframePopover = frame.locator(
    'body > .vc-popover-content-wrapper .vc-date-picker-content',
  );
  await expect(iframePopover).toBeVisible();
  await expect(
    page.locator(
      'body > .vc-popover-content-wrapper .vc-date-picker-content',
    ),
  ).toHaveCount(0);

  await page.locator('#unmount-frame').click();
  await expect(frame.locator('#iframe-calendar')).toHaveCount(0);
  await expect(iframePopover).toHaveCount(0);
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

test('teleports a date picker popover outside clipping ancestors and removes it on unmount', async ({
  page,
}) => {
  await page.locator('#teleport-trigger').focus();

  const teleportedPopover = page.locator(
    'body > .vc-popover-content-wrapper .vc-date-picker-content',
  );
  await expect(teleportedPopover).toBeVisible();
  await expect(
    page.locator('#teleport-clipping-parent .vc-popover-content-wrapper'),
  ).toHaveCount(0);

  await page.locator('#outside').click();
  await expect(teleportedPopover).toHaveCount(0);

  await page.locator('#teleport-trigger').focus();
  await expect(teleportedPopover).toBeVisible();

  await page.locator('#toggle-teleported-picker').click();

  await expect(teleportedPopover).toHaveCount(0);
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
