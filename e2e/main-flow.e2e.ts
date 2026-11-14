import { expect, test } from '@playwright/test'

// Smoke test of the main flow in a real browser against the production build:
// create a project, add a work item, move it to Done, and confirm it survives a reload.
test('create a project, add an item, move it to Done', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Projects · SprintLab')
  await expect(page.getByText('No projects yet.')).toBeVisible()

  await page.getByRole('button', { name: 'New project' }).click()
  await page.getByLabel('Name (required)').fill('E2E project')
  await page.getByRole('button', { name: 'Create project' }).click()
  await page.getByRole('link', { name: 'E2E project' }).click()
  await expect(page).toHaveTitle('E2E project · SprintLab')

  await page.getByRole('button', { name: 'New work item' }).click()
  await page.getByLabel('Title (required)').fill('Ship the smoke test')
  await page.getByRole('button', { name: 'Create work item' }).click()

  const backlog = page.getByRole('region', { name: /^Backlog/ })
  await expect(backlog.getByRole('heading', { name: 'Ship the smoke test' })).toBeVisible()

  await page.getByLabel('Status of Ship the smoke test').selectOption('Done')

  const done = page.getByRole('region', { name: /^Done/ })
  await expect(done.getByRole('heading', { name: 'Ship the smoke test' })).toBeVisible()
  await expect(backlog.getByText('No items')).toBeVisible()

  await page.reload()
  await expect(page.getByRole('region', { name: /^Done/ }).getByRole('heading', { name: 'Ship the smoke test' })).toBeVisible()
})
