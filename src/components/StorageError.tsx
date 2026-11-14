import { downloadText } from '../lib/download'
import type { LoadError } from '../repository/storage'

const messages: Record<LoadError, { title: string; detail: string }> = {
  corrupt: {
    title: "Your saved data couldn't be read",
    detail:
      'It may have been edited or damaged. Download a copy before resetting, so nothing is lost for good.',
  },
  unsupported_version: {
    title: 'Your saved data is from a newer version of SprintLab',
    detail:
      "This version can't open it safely. Reload to get the latest version, or download a copy before resetting.",
  },
  unavailable: {
    title: "SprintLab can't access browser storage",
    detail:
      'Your browser is blocking site data, so nothing can be loaded or saved. Allow site data for this page and reload.',
  },
}

interface StorageErrorProps {
  error: LoadError
  raw: string | null
  onReset: () => void
  /** Shown when the last reset attempt could not remove the data. */
  resetFailed?: boolean
}

function downloadRaw(raw: string) {
  downloadText('sprintlab-data-backup.json', raw)
}

export function StorageError({ error, raw, onReset, resetFailed = false }: StorageErrorProps) {
  const { title, detail } = messages[error]
  const canRecover = error !== 'unavailable'

  return (
    <section role="alert" aria-labelledby="storage-error-title" className="storage-error">
      <h2 id="storage-error-title">{title}</h2>
      <p>{detail}</p>
      {resetFailed && (
        <p className="field-error">
          Reset didn't work: the browser blocked access to storage. Allow site data for this page, reload, and try
          again.
        </p>
      )}
      {canRecover && (
        <div className="actions">
          {raw !== null && (
            <button type="button" onClick={() => downloadRaw(raw)}>
              Download a copy
            </button>
          )}
          <button type="button" onClick={onReset}>
            Reset data
          </button>
        </div>
      )}
    </section>
  )
}
