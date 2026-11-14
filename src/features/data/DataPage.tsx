import { useRef, useState, type ChangeEvent } from 'react'
import type { AppData } from '../../domain/types'
import { backupFilename, downloadText } from '../../lib/download'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { useAppData } from '../../state/useAppData'
import { MAX_IMPORT_BYTES, TOO_LARGE_MESSAGE, checkImport, summarize } from './importFile'
import { useAddDemo } from './useAddDemo'

type ImportState =
  | { kind: 'idle' }
  | { kind: 'error'; fileName: string; message: string }
  | { kind: 'ready'; fileName: string; data: AppData }

export function DataPage() {
  useDocumentTitle('Your data')
  const { data, dispatch } = useAppData()
  const [importState, setImportState] = useState<ImportState>({ kind: 'idle' })
  const [status, setStatus] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const statusRef = useRef<HTMLParagraphElement>(null)
  const addDemo = useAddDemo()

  function announce(message: string) {
    setStatus(message)
    requestAnimationFrame(() => statusRef.current?.focus())
  }

  function exportAll() {
    const name = backupFilename()
    downloadText(name, JSON.stringify(data, null, 2))
    setStatus(`Downloaded ${name} with ${summarize(data)}.`)
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    setStatus(null)
    const file = event.target.files?.[0]
    if (!file) return
    // Refuse oversized files before reading them into memory.
    if (file.size > MAX_IMPORT_BYTES) {
      setImportState({ kind: 'error', fileName: file.name, message: TOO_LARGE_MESSAGE })
      return
    }
    let text: string
    try {
      text = await file.text()
    } catch {
      setImportState({ kind: 'error', fileName: file.name, message: 'The file couldn’t be read.' })
      return
    }
    const check = checkImport(text, file.size)
    setImportState(
      check.ok
        ? { kind: 'ready', fileName: file.name, data: check.data }
        : { kind: 'error', fileName: file.name, message: check.message },
    )
  }

  function resetImport() {
    setImportState({ kind: 'idle' })
    if (fileInput.current) {
      fileInput.current.value = ''
      fileInput.current.focus()
    }
  }

  function confirmImport() {
    if (importState.kind !== 'ready') return
    dispatch({ type: 'data/replaced', data: importState.data })
    const message = `Imported ${importState.fileName}: ${summarize(importState.data)}.`
    setImportState({ kind: 'idle' })
    if (fileInput.current) fileInput.current.value = ''
    announce(message)
  }

  return (
    <section aria-labelledby="data-heading">
      <h2 id="data-heading">Your data</h2>
      <p>
        SprintLab keeps everything in this browser only. Nothing is sent to a server, so a backup file is the only
        copy outside this browser.
      </p>

      {status && (
        <p ref={statusRef} tabIndex={-1} role="status" className="announcement">
          {status}
        </p>
      )}

      <section aria-labelledby="export-heading" className="data-section">
        <h3 id="export-heading">Export</h3>
        <p>Download all projects, work items and sprints as a JSON file ({summarize(data)}).</p>
        <button type="button" onClick={exportAll}>
          Download all data
        </button>
      </section>

      <section aria-labelledby="demo-heading" className="data-section">
        <h3 id="demo-heading">Demo data</h3>
        <p>
          Add a sample project based on SprintLab’s own backlog, with completed, active and planned sprints. It’s added
          next to your projects; delete it any time.
        </p>
        <button type="button" onClick={() => announce(`Added the demo project “${addDemo()}”.`)}>
          Add demo project
        </button>
      </section>

      <section aria-labelledby="import-heading" className="data-section">
        <h3 id="import-heading">Import</h3>
        <p>
          Importing a backup <strong>replaces</strong> all data in this browser. The file is checked first, and
          nothing changes until you confirm.
        </p>
        <div className="field">
          <label htmlFor="import-file">Backup file (.json)</label>
          <input
            id="import-file"
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            onChange={handleFile}
            aria-describedby={importState.kind === 'error' ? 'import-error' : undefined}
          />
        </div>

        {importState.kind === 'error' && (
          <div id="import-error" role="alert" className="field-error">
            <p>
              <strong>{importState.fileName}</strong> wasn’t imported. {importState.message} Your current data
              hasn’t changed.
            </p>
          </div>
        )}

        {importState.kind === 'ready' && (
          <section className="danger-panel" aria-labelledby="import-confirm-heading">
            <h4 id="import-confirm-heading">Replace your data with {importState.fileName}?</h4>
            <p>
              The file contains {summarize(importState.data)}. It will replace what’s here now ({summarize(data)}).
              <strong> This can’t be undone</strong> unless you download your current data first.
            </p>
            <div className="actions">
              <button type="button" onClick={exportAll}>
                Download current data first
              </button>
              <button type="button" className="danger-button" onClick={confirmImport}>
                Replace my data
              </button>
              <button type="button" onClick={resetImport} autoFocus>
                Cancel
              </button>
            </div>
          </section>
        )}
      </section>
    </section>
  )
}
