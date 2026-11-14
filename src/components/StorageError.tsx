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
}

function downloadRaw(raw: string) {
  const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'sprintlab-data-backup.json'
  link.click()
  // Revoking in the same tick can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function StorageError({ error, raw, onReset }: StorageErrorProps) {
  const { title, detail } = messages[error]
  const canRecover = error !== 'unavailable'

  return (
    <section role="alert" aria-labelledby="storage-error-title" className="storage-error">
      <h2 id="storage-error-title">{title}</h2>
      <p>{detail}</p>
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
