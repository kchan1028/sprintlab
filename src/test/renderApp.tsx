import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../App'

/** Renders the whole app at a given URL, the way a user would land on it. */
export function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}
