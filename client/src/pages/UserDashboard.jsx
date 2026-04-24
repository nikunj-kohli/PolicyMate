import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function UserDashboard() {
  const [profile, setProfile] = useState(null)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  
  useEffect(() => {
    // Check auth
    const savedUser = window.sessionStorage.getItem('policyMateUser')
    if (!savedUser) {
      navigate('/login')
      return
    }
    setUser(JSON.parse(savedUser))

    // Load mock profile
    const savedProfile = window.sessionStorage.getItem('policyMateProfile')
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile))
      } catch {
        // empty
      }
    }
  }, [navigate])

  const handleLogout = () => {
    window.sessionStorage.removeItem('policyMateUser')
    navigate('/')
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-[var(--color-muted)]">Welcome back, {user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/app" 
            className="rounded-full bg-[var(--color-primary)] px-6 py-3 font-semibold text-white transition hover:opacity-90"
          >
            New Recommendation
          </Link>
          <button 
            onClick={handleLogout}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3 font-semibold transition hover:bg-[var(--color-background)]"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-1">
          <section className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">My Health Profile</h2>
            {profile ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                  <span className="text-[var(--color-muted)]">Name</span>
                  <span className="font-medium">{profile.fullName}</span>
                </div>
                <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                  <span className="text-[var(--color-muted)]">Age</span>
                  <span className="font-medium">{profile.age}</span>
                </div>
                <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                  <span className="text-[var(--color-muted)]">Lifestyle</span>
                  <span className="font-medium">{profile.lifestyle}</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-[var(--color-muted)]">Conditions</span>
                  <span className="font-medium">{profile.conditions?.join(', ') || 'None'}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-muted)]">No profile saved yet. Run a recommendation to save your details.</p>
            )}
            <Link to="/app" className="mt-4 block text-center text-sm font-semibold text-[var(--color-primary)] hover:underline">
              Edit Profile
            </Link>
          </section>
        </div>

        <div className="space-y-6 md:col-span-2">
          <section className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Saved Recommendations</h2>
            <div className="space-y-4">
              <div className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Health Plus Elite</h3>
                    <p className="text-sm text-[var(--color-muted)]">Aarogya Aid</p>
                  </div>
                  <span className="rounded-full bg-[var(--color-primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
                    Score: 92
                  </span>
                </div>
                <p className="mb-3 text-sm text-[var(--color-muted)]">Saved on Apr 24, 2026</p>
                <button className="text-sm font-semibold text-[var(--color-primary)] hover:underline">View details</button>
              </div>

              <div className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Care Shield</h3>
                    <p className="text-sm text-[var(--color-muted)]">Care Insure</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    Score: 75
                  </span>
                </div>
                <p className="mb-3 text-sm text-[var(--color-muted)]">Saved on Apr 20, 2026</p>
                <button className="text-sm font-semibold text-[var(--color-primary)] hover:underline">View details</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
