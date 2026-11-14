import { toDateString } from '../../domain/dates'
import { buildDemo } from '../../domain/demo'
import { useAppData } from '../../state/useAppData'

/** Adds the demo project next to any existing data and returns its name. */
export function useAddDemo() {
  const { dispatch } = useAppData()
  return () => {
    const now = new Date()
    const demo = buildDemo(toDateString(now), now.toISOString(), () => crypto.randomUUID())
    dispatch({ type: 'records/added', ...demo })
    return demo.project.name
  }
}
