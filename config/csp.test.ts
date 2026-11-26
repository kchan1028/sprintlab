// @vitest-environment node
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { contentSecurityPolicy, cspMetaPlugin, inlineScriptHashes } from './csp.ts'

const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8')

function transform(html: string): string {
  const hook = cspMetaPlugin().transformIndexHtml
  if (!hook || typeof hook === 'function') throw new Error('expected an object hook')
  return hook.handler.call({} as never, html, {} as never) as string
}

describe('content security policy', () => {
  it('hashes exactly the inline classic scripts, not module or external ones', () => {
    const html = '<script>a()</script><script type="module" src="/x.js"></script><script>b()</script>'
    const hash = (body: string) => `'sha256-${createHash('sha256').update(body).digest('base64')}'`
    expect(inlineScriptHashes(html)).toEqual([hash('a()'), hash('b()')])
  })

  it("allows index.html's theme script and nothing inline beyond it", () => {
    const [themeScriptHash] = inlineScriptHashes(indexHtml)
    expect(themeScriptHash).toBeDefined()
    const policy = contentSecurityPolicy(indexHtml)
    expect(policy).toContain(`script-src 'self' ${themeScriptHash}`)
    expect(policy).not.toContain('unsafe-inline')
    expect(policy).not.toContain('unsafe-eval')
    for (const directive of ["object-src 'none'", "base-uri 'none'", "default-src 'self'"]) {
      expect(policy).toContain(directive)
    }
  })

  it('puts the policy right after <meta charset>, before any script it governs', () => {
    const out = transform(indexHtml)
    const policy = out.indexOf('http-equiv="Content-Security-Policy"')
    expect(out.indexOf('<meta charset')).toBeGreaterThan(-1)
    expect(policy).toBeGreaterThan(out.indexOf('<meta charset'))
    expect(policy).toBeLessThan(out.indexOf('<script'))
  })
})
