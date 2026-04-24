import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Link } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import HomePage from './pages/HomePage.jsx'
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'))

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
            <nav className="flex gap-3 items-center">
              <NavLink
                to="/app"
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]'
                  }`
                }
              >
                Try Demo
              </NavLink>
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
          </div>
        </header>
        <main id="main-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<HomePage />} />
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
