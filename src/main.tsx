import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import { readAppearance } from './repository/appearance'

// Set before mounting so the first rendered screen uses the saved preference.
document.documentElement.dataset.appearance = readAppearance()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Matches Vite's `base`: "/" normally, "/sprintlab/" on GitHub Pages. */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
