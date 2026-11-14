import axe from 'axe-core'

/**
 * Runs axe-core against the rendered DOM and returns readable violations.
 * jsdom has no layout engine, so color contrast is checked in a real browser instead.
 */
export async function axeViolations(root: Element = document.body): Promise<string[]> {
  const results = await axe.run(root, {
    rules: { 'color-contrast': { enabled: false } },
  })
  return results.violations.map(
    (v) => `${v.id} (${v.impact}): ${v.help} → ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
  )
}
