import { expect, it } from 'vitest'

// Deliberately failing test: proves CI blocks a PR with a failing test (#3). Do not merge.
it('fails on purpose', () => {
  expect(1 + 1).toBe(3)
})
