import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { MuseumContentProvider } from './content'
import './index.css'

const AdminApp = lazy(() => import('./admin/AdminApp'))
const isAdmin = /^\/admin(?:\/|$)/.test(window.location.pathname)
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MuseumContentProvider>
      {isAdmin ? <Suspense fallback={<main className="admin-loading" role="status">Opening the admin portal…</main>}><AdminApp /></Suspense> : <App />}
    </MuseumContentProvider>
  </React.StrictMode>,
)
