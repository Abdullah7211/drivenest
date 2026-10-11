import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Privacy from './Privacy.jsx'
import Terms from './Terms.jsx'
import Support from './Support.jsx'
import NotFound from './NotFound.jsx'

const path = window.location.pathname.replace(/\/+$/, '') || '/'

const pages = {
  '/': App,
  '/privacy': Privacy,
  '/terms': Terms,
  '/support': Support,
}
const Page = pages[path] || NotFound

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
