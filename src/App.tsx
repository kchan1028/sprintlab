import { useState } from 'react'
import { StorageError } from './components/StorageError'
import { loadData, resetData, type LoadResult } from './repository/storage'

function App() {
  const [loaded, setLoaded] = useState<LoadResult>(() => loadData())

  function handleReset() {
    const confirmed = window.confirm(
      'Reset deletes all SprintLab data saved in this browser. This cannot be undone. Continue?',
    )
    if (!confirmed) return
    resetData()
    setLoaded(loadData())
  }

  return (
    <main className="app">
      <h1>SprintLab</h1>
      <p>A small project and bug tracker for a solo developer.</p>
      {loaded.ok ? (
        loaded.data.projects.length === 0 && <p>No projects yet.</p>
      ) : (
        <StorageError error={loaded.error} raw={loaded.raw} onReset={handleReset} />
      )}
    </main>
  )
}

export default App
