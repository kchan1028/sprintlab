import type { Appearance } from '../repository/appearance'

/**
 * Reflects the appearance in `<meta name="color-scheme">`, which CSS maps to `color-scheme`.
 * index.html sets the saved value before first paint; this keeps it current afterwards.
 */
export function applyAppearance(appearance: Appearance, doc: Document = document) {
  let meta = doc.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')
  if (!meta) {
    meta = doc.createElement('meta')
    meta.name = 'color-scheme'
    doc.head.append(meta)
  }
  meta.content = appearance === 'system' ? 'light dark' : appearance
}
