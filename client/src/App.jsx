import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import HomePage from './pages/HomePage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import UserDashboard from './pages/UserDashboard.jsx'
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'))

function Navigation() {
  const location = useLocation()
  const isAuth = !!window.sessionStorage.getItem('policyMateUser')
  
  // Force re-render of nav when location changes (like after login/logout)
  // This is a simple trick to keep the nav in sync with sessionStorage for the demo
  const navKey = location.pathname

  return (
    <nav key={navKey} className="flex gap-3 items-center">
      {isAuth ? (
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              isActive ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]'
            }`
          }
        >
          Dashboard
        </NavLink>
      ) : (
        <NavLink
          to="/login"
          className={({ isActive }) =>
            `rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              isActive ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]'
            }`
          }
        >
          Sign In
        </NavLink>
      )}
      <NavLink
        to="/admin"
        className={({ isActive }) =>
          `rounded-2xl px-4 py-2 text-sm font-semibold transition ${
            isActive ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]'
          }`
        }
      >
        Admin
      </NavLink>
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
      <a className="visually-hidden" href="#main-content">
        Skip to content
      </a>
      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
        <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur sticky top-0 z-30">
          <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4 md:px-6">
            <div>
              <Link to="/" className="text-2xl font-semibold text-inherit no-underline">PolicyMate</Link>
            </div>
            <Navigation />
          </div>
        </header>
        <main id="main-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<HomePage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route
              path="/admin"
              element={
                <Suspense fallback={<div className="p-8 text-center text-[var(--color-muted)]">Loading admin panel…</div>}>
                  <AdminPage />
                </Suspense>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
