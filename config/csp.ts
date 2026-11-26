import { createHash } from 'node:crypto'
import type { Plugin } from 'vite'

/** SHA-256 sources for every inline classic `<script>`, so the policy allows exactly those and no other inline code. */
export function inlineScriptHashes(html: string): string[] {
  return [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
    ([, body]) => `'sha256-${createHash('sha256').update(body).digest('base64')}'`,
  )
}

/** Same-origin only: the app has no third-party scripts, styles, fonts or images. */
export function contentSecurityPolicy(html: string): string {
  return [
    "default-src 'self'",
    ["script-src 'self'", ...inlineScriptHashes(html)].join(' '),
    "style-src 'self'",
    "img-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
  ].join('; ')
}

/**
 * Adds the policy as a `<meta>` so it applies on every host, including GitHub Pages, which can't send headers.
 * Build only: the dev server relies on inline scripts that a strict policy would block.
 * `frame-ancestors` can't be set by `<meta>`, so Cloudflare sends it in public/_headers.
 */
export function cspMetaPlugin(): Plugin {
  return {
    name: 'sprintlab-csp-meta',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const meta = `<meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy(html)}" />`
        // Right after <meta charset> (which must stay first), and before any script it governs.
        const charset = /<meta charset[^>]*>/i
        return charset.test(html) ? html.replace(charset, (tag) => `${tag}\n    ${meta}`) : html.replace('<head>', `<head>\n    ${meta}`)
      },
    },
  }
}
