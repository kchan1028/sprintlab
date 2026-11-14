import type { AppData } from '../../domain/types'
import { parseAppData } from '../../repository/storage'
import { integrityProblem } from '../../repository/validate'

/** Larger than any realistic SprintLab backup, and near browser storage limits. */
export const MAX_IMPORT_BYTES = 5 * 1024 * 1024
export const TOO_LARGE_MESSAGE = 'This file is larger than 5 MB, which is too large for a SprintLab backup.'

export type ImportCheck = { ok: true; data: AppData } | { ok: false; message: string }

/** Validates a backup file's text with the same rules as loading, plus cross-record checks. */
export function checkImport(text: string, sizeBytes: number): ImportCheck {
  if (sizeBytes > MAX_IMPORT_BYTES) {
    return { ok: false, message: TOO_LARGE_MESSAGE }
  }
  const parsed = parseAppData(text)
  if (!parsed.ok) {
    return {
      ok: false,
      message:
        parsed.error === 'unsupported_version'
          ? 'This backup is from a newer version of SprintLab and can’t be opened by this version.'
          : 'This file isn’t a valid SprintLab backup. It may be damaged, edited, or a different kind of file.',
    }
  }
  const problem = integrityProblem(parsed.data)
  if (problem) return { ok: false, message: `This backup is inconsistent: ${problem}` }
  return { ok: true, data: parsed.data }
}

export function summarize(data: AppData): string {
  const n = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`
  return `${n(data.projects.length, 'project', 'projects')}, ${n(data.workItems.length, 'work item', 'work items')} and ${n(data.sprints.length, 'sprint', 'sprints')}`
}
