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
    const savedUser = window.sessionStorage.getItem('policyMateUser')
    if (!savedUser) {
      window.location.href = '/login' // simple redirect for this demo
      return
    }

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

  const fetchRecommendation = useCallback(async (currentProfile) => {
    // Prevent multiple simultaneous requests
    if (loading) {
      return
    }

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
      // Ensure age is a number
      const sanitizedProfile = {
        ...currentProfile,
        age: Number(currentProfile.age) || currentProfile.age,
      }
      
      const response = await axios.post(
        'http://localhost:5001/api/recommend',
        sanitizedProfile,
        { signal: controller.signal, withCredentials: true },
      )
      setRecommendation(response.data)
      cacheRecommendation(response.data)
      setError('')
      addToast('success', 'Recommendations loaded')
      window.sessionStorage.setItem('policyMateProfile', JSON.stringify(sanitizedProfile))
      window.scrollTo({ top: 680, behavior: 'smooth' })
    } catch (err) {
      // Clear abort controller reference
      abortRef.current = null
      
      if (axios.isCancel(err)) {
        setLoading(false)
        return
      }
      
      // Handle HTTP errors - do NOT retry automatically
      if (err.response) {
        const errorData = err.response.data
        let msg = 'Failed to load recommendations.'
        
        if (err.response.status === 400 && errorData?.errors) {
          msg = Object.values(errorData.errors).join(', ')
        } else if (errorData?.error) {
          msg = errorData.error
          
          // Add specific actions based on error type
          if (errorData.type === 'no_policies_error') {
            msg += ' Please contact your administrator to upload policy documents.'
          } else if (errorData.type === 'ai_service_error') {
            msg += ' The AI service is temporarily unavailable.'
          } else if (errorData.type === 'validation_error') {
            msg = errorData.error
          }
        }
        
        setError(msg)
        addToast('error', msg)
        setLoading(false)
        return
      }

      // Network error (no response) - do NOT retry automatically
      setError('Network error. Check your connection and try again.')
      addToast('error', 'Network error. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line no-unused-vars
  }, [cacheRecommendation, offline, readCachedRecommendation, addToast, loading])

  const handleSubmit = useCallback(
    (nextProfile) => {
      setProfile(nextProfile)
      setError('')
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current)
      }
      debounceRef.current = window.setTimeout(() => {
        fetchRecommendation(nextProfile)
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
