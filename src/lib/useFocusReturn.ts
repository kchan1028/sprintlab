import { useCallback, useRef } from 'react'

/**
 * Returns keyboard focus to a control after the UI that replaced it closes.
 *
 * Forms here open in place of their trigger button, so the button unmounts.
 * Call `returnTo(key)` before closing; the element registered with
 * `focusTarget(key)` takes focus when it mounts again.
 */
export function useFocusReturn() {
  const pending = useRef<string | null>(null)

  const returnTo = useCallback((key: string) => {
    pending.current = key
  }, [])

  const focusTarget = useCallback(
    (key: string) => (el: HTMLElement | null) => {
      if (el && pending.current === key) {
        el.focus()
        pending.current = null
      }
    },
    [],
  )

  return { returnTo, focusTarget }
}
