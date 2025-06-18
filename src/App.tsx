import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import CleaverTestPage from './components/CleaverTestPage'
import CleaverTestInterface from './components/CleaverTestInterface'
import CleaverTestCompleted from './components/CleaverTestCompleted'
import MossTestPage from './components/MossTestPage'
import MossTestInterface from './components/MossTestInterface'
import MossTestCompleted from './components/MossTestCompleted'
import TermanTestPage from './components/TermanTestPage'
import TermanTestInterface from './components/TermanTestInterface'
import TermanTestCompleted from './components/TermanTestCompleted'
import { JobsProvider } from './contexts/JobsContext'
import { CleaverProvider } from './contexts/CleaverContext'
import { MossProvider } from './contexts/MossContext'
import { TermanMerrillProvider } from './contexts/TermanMerrillContext'
import RavenTestPage from './components/RavenTestPage'
import RavenTestInterface from './components/RavenTestInterface'
import RavenTestFinishPage from './components/RavenTestFinishPage'
import RavenTestCompleted from './components/RavenTestCompleted'
import { RavenProvider } from './contexts/RavenContext'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <RavenProvider>
      <CleaverProvider>
        <MossProvider>
          <TermanMerrillProvider>
            <Routes>
              {/* Rutas públicas para tests de candidatos */}
              <Route path="/cleaver-test/:token" element={<CleaverTestPage />} />
              <Route path="/cleaver-test/:token/start" element={<CleaverTestInterface />} />
              <Route path="/cleaver-test/:token/completed" element={<CleaverTestCompleted />} />
              
              {/* Rutas públicas para tests MOSS */}
              <Route path="/moss-test/:token" element={<MossTestPage />} />
              <Route path="/moss-test/:token/start" element={<MossTestInterface />} />
              <Route path="/moss-test/:token/completed" element={<MossTestCompleted />} />
              
              {/* Rutas públicas para tests Terman-Merrill */}
              <Route path="/terman-test/:token" element={<TermanTestPage />} />
              <Route path="/terman-test/:token/start" element={<TermanTestInterface />} />
              <Route path="/terman-test/:token/completed" element={<TermanTestCompleted />} />
              
              /* Rutas públicas para tests Raven */
              <Route path="/raven-test/:token" element={<RavenTestPage />} />
              <Route path="/raven-test/:token/start" element={<RavenTestInterface />} />
              <Route path="/raven-test/:token/finish" element={<RavenTestFinishPage />} />
              <Route path="/raven-test/:token/completed" element={<RavenTestCompleted />} />
              
              {/* Rutas autenticadas */}
              <Route path="/*" element={
                user ? (
                  <JobsProvider>
                    <Dashboard />
                  </JobsProvider>
                ) : (
                  <LandingPage />
                )
              } />
            </Routes>
          </TermanMerrillProvider>
        </MossProvider>
      </CleaverProvider>
      </RavenProvider>
    </Router>
  )
}

export default App