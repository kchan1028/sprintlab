import { Link } from 'react-router'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export function NotFound() {
  useDocumentTitle('Page not found')
  return (
    <section aria-labelledby="page-not-found-heading">
      <h2 id="page-not-found-heading">Page not found</h2>
      <Link to="/">Back to all projects</Link>
    </section>
  )
}
