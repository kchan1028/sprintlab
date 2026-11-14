import { backupFilename, downloadText } from '../lib/download'
import type { SaveError } from '../repository/storage'
import { useAppData } from '../state/useAppData'

const messages: Record<SaveError, string> = {
  quota_exceeded: 'Browser storage is full, so your latest changes were not saved.',
  unavailable: 'Your browser blocked storage, so your latest changes were not saved.',
}

export function SaveErrorBanner({ error }: { error: SaveError }) {
  const { data, retrySave } = useAppData()

  return (
    <section role="alert" aria-labelledby="save-error-title" className="save-error">
      <h2 id="save-error-title">Changes not saved</h2>
      <p>
        {messages[error]} Your changes are still on this page. Download a copy before closing the tab; the browser
        will ask you to confirm if you try.
      </p>
      <div className="actions">
        <button type="button" onClick={retrySave}>
          Try saving again
        </button>
        <button type="button" onClick={() => downloadText(backupFilename(), JSON.stringify(data, null, 2))}>
          Download a copy
        </button>
      </div>
    </section>
  )
}
