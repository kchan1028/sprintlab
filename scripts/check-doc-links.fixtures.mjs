import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const checker = fileURLToPath(new URL('./check-doc-links.mjs', import.meta.url))

function check(files, tracked = Object.keys(files)) {
  const cwd = mkdtempSync(join(tmpdir(), 'sprintlab-doc-links-'))
  try {
    execFileSync('git', ['init', '-q'], { cwd })
    for (const [name, contents] of Object.entries(files)) {
      writeFileSync(join(cwd, name), contents)
    }
    execFileSync('git', ['add', '--', ...tracked], { cwd })
    return spawnSync(process.execPath, [checker], { cwd, encoding: 'utf8' })
  } finally {
    rmSync(cwd, { recursive: true, force: true })
  }
}

test('accepts local files, images, anchors, reference links, and external URLs', () => {
  const result = check({
    'README.md': '# Home\n[Guide](guide.md#details)\n![Image](image.svg)\n[Self](#home)\n[Web](https://example.com)\n[Ref][guide]\n[guide]: guide.md#details\n',
    'guide.md': '# Guide\n## Details\n',
    'image.svg': '<svg/>',
  })
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /2 Markdown files checked/)
})

test('rejects a missing target with its source location', () => {
  const result = check({ 'README.md': '[Missing](missing.md)\n' })
  assert.equal(result.status, 1)
  assert.match(result.stderr, /README.md: missing.md \(file not found\)/)
})

test('rejects a missing heading in an existing Markdown file', () => {
  const result = check({ 'README.md': '[Missing](guide.md#absent)\n', 'guide.md': '# Present\n' })
  assert.equal(result.status, 1)
  assert.match(result.stderr, /guide.md#absent \(heading not found\)/)
})

test('ignores link-shaped examples inside code and headings inside fences', () => {
  const result = check({ 'README.md': '# Real\n`[Example](missing.md)`\n```md\n[Example](missing.md)\n# Fake\n```\n[Fake](#fake)\n' })
  assert.equal(result.status, 1)
  assert.match(result.stderr, /#fake \(heading not found\)/)
  assert.doesNotMatch(result.stderr, /missing.md/)
})

test('handles repeated headings and explicit HTML anchors', () => {
  const result = check({ 'README.md': '# Repeat\n# Repeat\n<a id="manual"></a>\n[Second](#repeat-1)\n[Manual](#manual)\n' })
  assert.equal(result.status, 0, result.stderr)
})

test('does not inspect untracked Markdown', () => {
  const result = check({ 'README.md': '# Home\n', 'scratch.md': '[Missing](absent.md)\n' }, ['README.md'])
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /1 Markdown files checked/)
})
