import { useCallback, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Splash from './components/Splash.jsx'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Stories, { StoryPage } from './pages/Stories.jsx'
import Works from './pages/Works.jsx'
import Quotes from './pages/Quotes.jsx'
import Gallery from './pages/Gallery.jsx'
import Sources from './pages/Sources.jsx'
import Videos from './pages/Videos.jsx'
import Biography from './pages/Biography.jsx'

const seen = () => { try { return sessionStorage.getItem('splash') === '1' } catch { return true } }

export default function App() {
  const [splash, setSplash] = useState(() => !seen())
  const done = useCallback(() => { try { sessionStorage.setItem('splash', '1') } catch {} setSplash(false) }, [])
  return (
    <>
      {splash && <Splash onDone={done} />}
      <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="tarjimai-hol" element={<Biography />} />
        <Route path="hikoyalar" element={<Stories />} />
        <Route path="hikoyalar/:id" element={<StoryPage />} />
        <Route path="asarlar" element={<Works />} />
        <Route path="iqtiboslar" element={<Quotes />} />
        <Route path="galereya" element={<Gallery />} />
        <Route path="videolar" element={<Videos />} />
        <Route path="manbalar" element={<Sources />} />
      </Route>
      </Routes>
    </>
  )
}
