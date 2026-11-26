import { useRef } from 'react'
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
  const confirmRef = useRef<HTMLDialogElement>(null)

  return (
    <>
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
          <button type="button" onClick={() => confirmRef.current?.showModal()}>
            Reset data
          </button>
        </div>
      )}
    </section>
    {canRecover && (
      <dialog
        ref={confirmRef}
        aria-labelledby="reset-confirm-title"
        aria-describedby="reset-confirm-detail"
        onClose={(event) => {
          // Esc closes with an empty returnValue; reset it so a stale choice can't leak into the next close.
          const choice = event.currentTarget.returnValue
          event.currentTarget.returnValue = ''
          if (choice === 'reset') onReset()
        }}
      >
        <h1 id="reset-confirm-title">Reset all SprintLab data?</h1>
        <p id="reset-confirm-detail">
          This deletes everything SprintLab saved in this browser and can't be undone.
          {raw !== null && ' Download a copy first if you might need it.'}
        </p>
        <form method="dialog" className="actions">
          {/* Cancel comes first, so it's the safe action that gets focus when the dialog opens. */}
          <button value="cancel">Cancel</button>
          <button value="reset" className="danger-button">
            Reset everything
          </button>
        </form>
      </dialog>
    )}
    </>
  )
}
