/** Saves text as a file in the browser's downloads. */
export function downloadText(filename: string, text: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  // Revoking in the same tick can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

/** Date-stamped backup filename, e.g. sprintlab-backup-2026-11-14.json */
export function backupFilename(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `sprintlab-backup-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`
}
