import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuthPage from './AuthPage.jsx'
import Terms from './Terms.jsx'
import Support from './Support.jsx'
import NotFound from './NotFound.jsx'

const path = window.location.pathname.replace(/\/+$/, '') || '/'

// /privacy is served as static HTML from public/privacy.html
const pages = {
  '/': () => <App />,
  '/login': () => <AuthPage mode="login" />,
  '/signup': () => <AuthPage mode="signup" />,
  '/terms': () => <Terms />,
  '/support': () => <Support />,
}
const render = pages[path] || (() => <NotFound />)

createRoot(document.getElementById('root')).render(
  <StrictMode>{render()}</StrictMode>,
)
