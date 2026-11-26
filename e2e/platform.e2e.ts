import { expect, test, type Page } from '@playwright/test'

// Browser-platform behaviour that jsdom can't show: theming before scripts run,
// the native modal <dialog>, forced colors, and the production Content-Security-Policy.

const DARK_TEXT = 'rgb(230, 237, 243)'

function collectCspViolations(page: Page): string[] {
  const violations: string[] = []
  page.on('console', (message) => {
    if (/Content Security Policy/i.test(message.text())) violations.push(message.text())
  })
  return violations
}

test('a saved appearance applies before any app script runs', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.addInitScript(() => localStorage.setItem('sprintlab:appearance', 'dark'))
  // Block the app bundle: only index.html's inline script can apply the theme.
  await page.route(/\.js$/, (route) => route.abort())
  await page.goto('/')
  await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute('content', 'dark')
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark')
  await expect(page.locator('body')).toHaveCSS('color', DARK_TEXT)
})

test('the production build carries a CSP that the app runs under without violations', async ({ page }) => {
  const violations = collectCspViolations(page)
  await page.goto('/')
  await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveAttribute('content', /object-src 'none'/)
  await page.getByRole('button', { name: 'add a demo project' }).click()
  await page.getByRole('link', { name: 'SprintLab (demo)' }).click()
  await page.getByLabel('Appearance').selectOption('dark')
  await page.getByRole('link', { name: 'Your data', exact: true }).click()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download all data' }).click()
  await download
  expect(violations).toEqual([])
})

test('reset asks in a modal dialog that defaults to Cancel and closes with Esc', async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('sprintlab:data', '{not json')
      sessionStorage.setItem('seeded', '1')
    }
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Reset data' }).click()
  const dialog = page.getByRole('dialog', { name: 'Reset all SprintLab data?' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(page.getByRole('button', { name: 'Reset data' })).toBeFocused()
  expect(await page.evaluate(() => localStorage.getItem('sprintlab:data'))).toBe('{not json')

  await page.getByRole('button', { name: 'Reset data' }).click()
  await dialog.getByRole('button', { name: 'Reset everything' }).click()
  await expect(page.getByText('No projects yet.')).toBeVisible()
})

test('progress bars keep a visible fill in forced colors mode', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' })
  await page.goto('/')
  await page.getByRole('button', { name: 'add a demo project' }).click()
  const progress = page.getByRole('progressbar', { name: 'Project work for SprintLab (demo)' })
  // Computed styles of ::-webkit-progress-* aren't exposed, so compare pixels: if the fill were
  // invisible, the bar at 7 of 12 would look the same as the bar at 0.
  const filled = await progress.screenshot()
  await progress.evaluate((element) => element.setAttribute('value', '0'))
  const empty = await progress.screenshot()
  expect(filled.equals(empty)).toBe(false)
})
