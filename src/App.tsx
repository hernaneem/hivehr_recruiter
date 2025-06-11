import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import CleaverTestPage from './components/CleaverTestPage'
import CleaverTestInterface from './components/CleaverTestInterface'
import CleaverTestCompleted from './components/CleaverTestCompleted'
import { JobsProvider } from './contexts/JobsContext'
import { CleaverProvider } from './contexts/CleaverContext'

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
      <CleaverProvider>
        <Routes>
          {/* Rutas públicas para tests de candidatos */}
          <Route path="/cleaver-test/:token" element={<CleaverTestPage />} />
          <Route path="/cleaver-test/:token/start" element={<CleaverTestInterface />} />
          <Route path="/cleaver-test/:token/completed" element={<CleaverTestCompleted />} />
          
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
      </CleaverProvider>
    </Router>
  )
}

export default App