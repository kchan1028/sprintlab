import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Vitest globals are off, so Testing Library can't auto-clean between tests.
afterEach(() => {
  cleanup()
})

// jsdom has no modal <dialog>. A minimal stand-in so components can be tested; the real behaviour
// (focus, Esc, inert page) is covered by the Playwright tests in a browser.
// Node-environment test files have no DOM at all, so check before touching it.
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement, value?: string) {
    if (!this.hasAttribute('open')) return
    if (value !== undefined) this.returnValue = value
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
  document.addEventListener('submit', (event) => {
    const form = event.target as HTMLFormElement
    if (form.getAttribute('method') !== 'dialog') return
    event.preventDefault()
    const submitter = (event as SubmitEvent).submitter
    form.closest('dialog')?.close(submitter?.getAttribute('value') ?? '')
  })
}
