import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PreferencesProvider } from './context/PreferencesContext'
import Splash from './pages/Splash'
import Welcome from './pages/Welcome'
import PrefsTextLanguage from './pages/PrefsTextLanguage'
import PrefsWording from './pages/PrefsWording'
import PrefsSaved from './pages/PrefsSaved'
import SignUp from './pages/SignUp'
import Placeholder from './pages/Placeholder'
import DesignSystem from './pages/DesignSystem'

export default function App() {
  return (
    <PreferencesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/preferences/1" element={<PrefsTextLanguage />} />
          <Route path="/preferences/2" element={<PrefsWording />} />
          <Route path="/preferences/saved" element={<PrefsSaved />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Placeholder title="Log in" message="Log in isn’t part of this demo. Please create a new account." />} />
          <Route path="/settings" element={<Placeholder title="Settings" message="The settings page is built in a later phase." />} />
          <Route path="/step/:n" element={<Placeholder title="Account opening" message="The six steps are built in Phase 3." />} />
          <Route path="/design-system" element={<DesignSystem />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </PreferencesProvider>
  )
}