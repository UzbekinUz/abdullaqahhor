import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import Shell from './pages/Shell.jsx'
import Overview from './pages/Overview.jsx'
import SiteEditor from './pages/SiteEditor.jsx'
import Resource from './pages/Resource.jsx'
import { resources } from './pages/resources.js'

export default function App() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route element={<Shell />}>
        <Route index element={<Overview />} />
        <Route path="sayt" element={<SiteEditor />} />
        {Object.entries(resources).map(([key, cfg]) => (
          <Route key={key} path={key} element={<Resource name={key} cfg={cfg} />} />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
