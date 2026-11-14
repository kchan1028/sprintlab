import { Link } from 'react-router'

export function NotFound() {
  return (
    <section aria-labelledby="page-not-found-heading">
      <h2 id="page-not-found-heading">Page not found</h2>
      <Link to="/">Back to all projects</Link>
    </section>
  )
}
