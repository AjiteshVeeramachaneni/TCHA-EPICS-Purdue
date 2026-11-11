import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import Admin from './Admin'
import Announcement from './Announcement'
import './index.css'
import UserAccess from './UserAccess'

const isAdminPage = /^\/admin(?:\/|$)/.test(window.location.pathname)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isAdminPage ? <Admin /> : <><UserAccess><Announcement /><App /></ UserAccess></>}
  </React.StrictMode>,
)
