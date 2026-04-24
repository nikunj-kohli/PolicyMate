import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import ProfileForm from '../components/ProfileForm.jsx'
import RecommendationOutput from '../components/RecommendationOutput.jsx'
import { ChatExplainer } from '../components/ChatExplainer.jsx'
import { ToastManager } from '../components/ToastManager.jsx'
import { ErrorBoundary } from '../components/ErrorBoundary.jsx'

const initialProfile = {
  fullName: '',
  age: '',
  lifestyle: 'Sedentary',
  conditions: [],
  income: 'under 3L',
  city: 'Metro',
}

function getStorageKey(profile) {
  return `policyMateRecommendation:${btoa(JSON.stringify(profile))}`
}

function HomePage() {
  const [profile, setProfile] = useState(initialProfile)
  const [recommendation, setRecommendation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [chatOpen, setChatOpen] = useState(false)
  const [offline, setOffline] = useState(!navigator.onLine)
  const [toastList, setToastList] = useState([])
  const abortRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    const saved = window.sessionStorage.getItem('policyMateProfile')
    if (saved) {
      try {
        setProfile(JSON.parse(saved))
      } catch {
        setProfile(initialProfile)
      }
    }
  }, [])

  useEffect(() => {
    const handleOnline = () => setOffline(false)
    const handleOffline = () => setOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const profileHash = useMemo(() => getStorageKey(profile), [profile])

  const cacheRecommendation = useCallback((data) => {
    const entry = { data, savedAt: Date.now() }
    sessionStorage.setItem(profileHash, JSON.stringify(entry))
  }, [profileHash])

  const readCachedRecommendation = useCallback(() => {
    const cached = sessionStorage.getItem(profileHash)
    if (!cached) return null
    try {
      const parsed = JSON.parse(cached)
      if (Date.now() - parsed.savedAt < 1000 * 60 * 5) {
        return parsed.data
      }
    } catch {
      return null
    }
    return null
  }, [profileHash])

  const addToast = useCallback((type, message) => {
    const id = crypto.randomUUID()
    setToastList((current) => [...current, { id, type, message }])
    window.setTimeout(() => {
      setToastList((current) => current.filter((toast) => toast.id !== id))
    }, 3000)
  }, [])

  const fetchRecommendation = useCallback(async () => {
    if (offline) {
      setError('You are offline. Connect to the internet and try again.')
      return
    }

    const cached = readCachedRecommendation()
    if (cached) {
      setRecommendation(cached)
      addToast('success', 'Recommendations loaded from cache')
      return
    }

    if (abortRef.current) {
      abortRef.current.abort()
    }

    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    setError('')

    try {
      const response = await axios.post(
        'http://localhost:5001/api/recommend',
        profile,
        { signal: controller.signal, withCredentials: true },
      )
      setRecommendation(response.data)
      cacheRecommendation(response.data)
      setError('')
      addToast('success', 'Recommendations loaded')
      window.sessionStorage.setItem('policyMateProfile', JSON.stringify(profile))
      window.scrollTo({ top: 680, behavior: 'smooth' })
    } catch (err) {
      if (axios.isCancel(err)) {
        return
      }
      setError('Failed to load recommendations. Retrying...')
      addToast('error', 'Failed to load recommendations. Retrying...')
      setTimeout(fetchRecommendation, 1000)
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }, [cacheRecommendation, offline, profile, readCachedRecommendation, addToast])

  const handleSubmit = useCallback(
    (nextProfile) => {
      setProfile(nextProfile)
      setError('')
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current)
      }
      debounceRef.current = window.setTimeout(() => {
        fetchRecommendation()
      }, 300)
    },
    [fetchRecommendation],
  )

  const toggleChat = useCallback(() => {
    setChatOpen((value) => !value)
  }, [])

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-8 md:px-6">
      <ToastManager toasts={toastList} />
      {offline && (
        <div className="rounded-2xl border border-orange-300 bg-orange-50 p-4 text-sm text-orange-800" role="status">
          You are offline. Some features will be limited until connection is restored.
        </div>
      )}
      <section className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold leading-tight">Find the right insurance for you</h1>
          <p className="max-w-2xl text-sm text-[var(--color-muted)]">
            Enter your profile once, then receive a grounded recommendation with explainable coverage details.
          </p>
        </div>
      </section>

      <ErrorBoundary>
        <section className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--color-shadow)]">
          <ProfileForm profile={profile} onSubmit={handleSubmit} loading={loading} />
        </section>
      </ErrorBoundary>

      <ErrorBoundary>
        <section aria-live="polite" className="space-y-6">
          <RecommendationOutput data={recommendation} loading={loading} error={error} />
        </section>
      </ErrorBoundary>

      <ChatExplainer
        isOpen={chatOpen}
        onToggle={toggleChat}
        profile={profile}
        recommendation={recommendation}
        disabled={loading}
      />
    </div>
  )
}

export default HomePage
