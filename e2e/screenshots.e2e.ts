import { expect, test } from '@playwright/test'

// Regenerates the README screenshots from the production build with demo data.
// Skipped unless SCREENSHOTS=1, so CI doesn't rewrite images: `npm run screenshots`.
test.skip(!process.env.SCREENSHOTS, 'Set SCREENSHOTS=1 to regenerate screenshots')
test.use({ viewport: { width: 1280, height: 860 }, colorScheme: 'light' })

const out = (name: string) => `docs/screenshots/${name}.png`

test('README screenshots', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'add a demo project' }).click()
  await expect(page.getByRole('link', { name: 'SprintLab (demo)' })).toBeVisible()
  await page.screenshot({ path: out('projects') })

  await page.getByRole('link', { name: 'SprintLab (demo)' }).click()
  await expect(page.getByRole('region', { name: 'Board' })).toBeVisible()
  async function captureWorkspace(name: string) {
    await page.setViewportSize({ width: 1280, height: 1100 })
    const currentSprint = await page.locator('.current-sprint').boundingBox()
    const board = await page.getByRole('region', { name: 'Board', exact: true }).boundingBox()
    if (!currentSprint || !board) throw new Error('Workspace preview needs the active sprint and board')
    await page.screenshot({
      path: out(name),
      clip: {
        x: currentSprint.x - 8,
        y: currentSprint.y - 8,
        width: currentSprint.width + 16,
        height: board.y + board.height - currentSprint.y + 16,
      },
    })
    await page.setViewportSize({ width: 1280, height: 860 })
  }
  await captureWorkspace('workspace-preview')
  await page.screenshot({ path: out('project-board'), fullPage: true })
  await page.getByLabel('Appearance').selectOption('dark')
  await captureWorkspace('workspace-preview-dark')
  await page.screenshot({ path: out('project-board-dark'), fullPage: true })
  await page.getByLabel('Appearance').selectOption('light')

  await page.getByRole('button', { name: 'Complete Sprint 3' }).click()
  await page.getByRole('form', { name: 'Complete Sprint 3?' }).screenshot({ path: out('complete-sprint') })
  await page.getByRole('button', { name: 'Cancel' }).click()

  await page.getByRole('link', { name: 'Your data' }).click()
  await expect(page.getByRole('heading', { name: 'Your data' })).toBeVisible()
  await page.screenshot({ path: out('your-data') })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('link', { name: 'SprintLab (demo)' }).click()
  await expect(page.getByRole('heading', { level: 2, name: 'SprintLab (demo)', exact: true })).toBeVisible()
  await page.screenshot({ path: out('mobile'), fullPage: true })
  await page.getByLabel('Appearance').selectOption('dark')
  await page.screenshot({ path: out('mobile-dark'), fullPage: true })
})
