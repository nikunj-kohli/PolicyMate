import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    // Mock authentication for the demo
    window.sessionStorage.setItem('policyMateUser', JSON.stringify({ email }))
    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--color-shadow)]">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">{isLogin ? 'Welcome back' : 'Create an account'}</h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            {isLogin ? 'Log in to view your saved recommendations' : 'Sign up to save your health profile securely'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 focus:border-[var(--color-primary)] focus:ring focus:ring-blue-200"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 focus:border-[var(--color-primary)] focus:ring focus:ring-blue-200"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="mt-6 inline-flex w-full items-center justify-center rounded-[12px] bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.02]"
          >
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-[var(--color-muted)]">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="font-semibold text-[var(--color-primary)] hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  )
}
