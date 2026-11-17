import { createRequire } from 'node:module'
import { expect, test } from '@playwright/test'

async function openDemo(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'add a demo project' }).click()
  await page.getByRole('link', { name: 'SprintLab (demo)' }).click()
}

test('active work, explicit all-items filter, assignment, and completion stay accessible', async ({ page }) => {
  await openDemo(page)
  await expect(page.getByLabel('Show')).toHaveValue(/.+/)
  await expect(page.locator('.sprint-history')).not.toHaveAttribute('open')
  await expect(page.locator('.card')).toHaveCount(3)
  const current = await page.locator('.current-sprint').boundingBox()
  const board = await page.getByRole('region', { name: 'Board', exact: true }).boundingBox()
  expect(current && board && current.y < board.y).toBeTruthy()
  await page.getByRole('button', { name: 'Show all' }).click()
  await expect(page).toHaveURL(/sprint=all/)
  await page.reload()
  await expect(page.getByLabel('Show')).toHaveValue('all')
  expect(await page.locator('.card').count()).toBeGreaterThan(3)
  const card = page.locator('.card').first()
  await card.getByText('Details and sprint').click()
  await expect(card.getByLabel(/^Sprint for/)).toBeVisible()
  await expect(card.getByRole('list')).toBeVisible()
  await page.getByRole('button', { name: 'Complete Sprint 3', exact: true }).click()
  await page.getByRole('button', { name: 'Complete sprint', exact: true }).click()
  await expect(page.locator('.sprint-history')).toHaveAttribute('open')
  await expect(page.locator('.announcement')).toBeFocused()
  await page.getByRole('button', { name: /review and retro for Sprint 3$/i }).click()
  await expect(page.getByLabel('What was delivered?')).toBeVisible()
})

test('appearance follows system, remembers overrides, and fits narrow screens', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await openDemo(page)
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'light dark')
  await expect(page.locator('body')).toHaveCSS('color', 'rgb(230, 237, 243)')
  await page.getByLabel('Appearance').selectOption('light')
  await expect(page.locator('body')).toHaveCSS('color', 'rgb(31, 35, 40)')
  await page.reload()
  await expect(page.getByLabel('Appearance')).toHaveValue('light')
  await page.getByLabel('Appearance').selectOption('dark')
  await expect(page.locator('body')).toHaveCSS('color', 'rgb(230, 237, 243)')
  for (const width of [1280, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 860 })
    const overflow = await page.evaluate('document.documentElement.scrollWidth > window.innerWidth')
    expect(overflow, `horizontal overflow at ${width}px`).toBe(false)
    for (const control of await page.locator('button:visible, select:visible, summary:visible').all()) {
      const bounds = await control.boundingBox()
      expect(bounds?.height, `small target: ${await control.textContent()}`).toBeGreaterThanOrEqual(44)
    }
  }
  await page.getByRole('link', { name: 'Your data', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Download all data' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('data-appearance', 'dark')
})


test('light and dark forms pass browser accessibility checks and contain long content', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: 'add a demo project' }).click()
  const edit = await page.getByRole('button', { name: 'Edit SprintLab (demo)' }).boundingBox()
  expect(edit?.height).toBe(44)
  expect(edit?.width).toBeGreaterThan(48)
  await page.getByRole('link', { name: 'SprintLab (demo)' }).click()
  await page.addScriptTag({ path: createRequire(import.meta.url).resolve('axe-core/axe.min.js') })
  for (const appearance of ['light', 'dark']) {
    await page.getByLabel('Appearance').selectOption(appearance)
    await page.getByRole('button', { name: 'New work item' }).click()
    const title = `Long ${appearance} ${'A'.repeat(100)}`
    await page.getByLabel('Title (required)').fill(title)
    await page.getByLabel('Description').fill('https://example.com/' + 'long-content'.repeat(25))
    const violations = await page.evaluate(`axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] }
    }).then(result => result.violations.map(({id, nodes}) => ({id, targets: nodes.map(node => node.target)})))`)
    expect(violations, `${appearance} accessibility`).toEqual([])
    expect(await page.evaluate('document.documentElement.scrollWidth > window.innerWidth')).toBe(false)
    await page.getByRole('button', { name: 'Create work item', exact: true }).click()
    const longCard = page.locator('.card').filter({ has: page.getByRole('heading', { name: title, exact: true }) })
    await expect(longCard).toBeVisible()
    await longCard.getByText('Details and sprint').click()
    expect(await page.evaluate('document.documentElement.scrollWidth > window.innerWidth')).toBe(false)
    await page.getByRole('button', { name: 'Delete project', exact: true }).click()
    const dangerViolations = await page.evaluate(`axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] }
    }).then(result => result.violations.map(({id, nodes}) => ({id, targets: nodes.map(node => node.target)})))`)
    expect(dangerViolations, `${appearance} destructive confirmation accessibility`).toEqual([])
    await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  }
})


test('project and sprint progress update from real status changes and retain their scope', async ({ page }) => {
  await openDemo(page)
  const progress = page.getByRole('progressbar', { name: 'Sprint work for Sprint 3' })
  await expect(progress).toHaveAttribute('value', '1')
  await expect(progress).toHaveAttribute('max', '3')
  await page.getByLabel('Status of Data safety: delete, export and import').selectOption('done')
  await expect(progress).toHaveAttribute('value', '2')
  await expect(progress).toHaveAttribute('aria-valuetext', '2 of 3 items done')
  await page.getByLabel('Show').selectOption('none')
  await expect(progress).toHaveAttribute('value', '2')
  await expect(progress).toHaveAttribute('max', '3')
  await page.getByRole('link', { name: 'Projects', exact: true }).click()
  const project = page.getByRole('progressbar', { name: 'Project work for SprintLab (demo)' })
  await expect(project).toHaveAttribute('value', '8')
  await expect(project).toHaveAttribute('max', '12')
  await page.reload()
  await expect(project).toHaveAttribute('aria-valuetext', '8 of 12 items done')
})
