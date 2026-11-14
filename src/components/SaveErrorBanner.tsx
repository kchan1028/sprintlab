import type { SaveError } from '../repository/storage'

const messages: Record<SaveError, string> = {
  quota_exceeded: 'Browser storage is full, so your latest changes were not saved.',
  unavailable: 'Your browser blocked storage, so your latest changes were not saved.',
}

export function SaveErrorBanner({ error }: { error: SaveError }) {
  return (
    <p role="alert" className="save-error">
      {messages[error]} Keep this tab open, and they will be saved on your next successful change.
    </p>
  )
}
