import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const initialForm = { username: '', password: '' }

function AdminPanel() {
  const navigate = useNavigate()
  const [authenticated, setAuthenticated] = useState(false)
  const [credentials, setCredentials] = useState(initialForm)
  const [documents, setDocuments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState(null)
  const [meta, setMeta] = useState({ policyName: '', insurer: '' })
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef(null)

  const fetchDocuments = useCallback(async () => {
    setLoadingDocs(true)
    setError('')
    try {
      const response = await axios.get('http://localhost:5001/api/admin/docs', { withCredentials: true })
      setDocuments(response.data.documents || [])
    } catch (err) {
      setError('Unable to load documents. Please login first.')
    } finally {
      setLoadingDocs(false)
    }
  }, [])

  useEffect(() => {
    if (authenticated) {
      fetchDocuments()
    }
  }, [authenticated, fetchDocuments])

  const handleLogin = useCallback(
    async (event) => {
      event.preventDefault()
      setError('')
      try {
        await axios.post('http://localhost:5001/api/admin/login', credentials, { withCredentials: true })
        setAuthenticated(true)
        setSuccess('Admin login successful')
        setTimeout(() => setSuccess(''), 2500)
      } catch (err) {
        setError('Login failed. Check your credentials.')
      }
    },
    [credentials],
  )

  const handleUpload = useCallback(async () => {
    if (!file || !meta.policyName || !meta.insurer) {
      setError('Choose a file and enter policy metadata.')
      return
    }

    const body = new FormData()
    body.append('policy', file)
    body.append('policyName', meta.policyName)
    body.append('insurer', meta.insurer)

    setUploading(true)
    setError('')
    try {
      await axios.post('http://localhost:5001/api/admin/upload', body, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setSuccess('Policy uploaded successfully')
      setFile(null)
      setMeta({ policyName: '', insurer: '' })
      fetchDocuments()
      fileInputRef.current.value = ''
    } catch (err) {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [file, meta, fetchDocuments])

  const handleUpdate = useCallback(async (id, field, value) => {
    setError('')
    try {
      await axios.put(`http://localhost:5001/api/admin/docs/${id}`, { [field]: value }, { withCredentials: true })
      fetchDocuments()
      setSuccess('Policy metadata updated')
      setTimeout(() => setSuccess(''), 2500)
    } catch (err) {
      setError('Update failed.')
    }
  }, [fetchDocuments])

  const handleDelete = useCallback(async (id) => {
    setError('')
    try {
      await axios.delete(`http://localhost:5001/api/admin/docs/${id}`, { withCredentials: true })
      setSuccess('Policy document deleted')
      fetchDocuments()
      setTimeout(() => setSuccess(''), 2500)
    } catch (err) {
      setError('Delete request failed.')
    }
  }, [fetchDocuments])

  const documentCount = useMemo(() => documents.length, [documents])

  return (
    <div className="space-y-8">
      {!authenticated ? (
        <div className="mx-auto max-w-md rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--color-shadow)]">
          <h2 className="text-2xl font-semibold">Admin Access</h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">Use your admin credentials from the backend .env file.</p>
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold" htmlFor="adminUsername">
                Username
              </label>
              <input
                id="adminUsername"
                value={credentials.username}
                onChange={(event) => setCredentials((prev) => ({ ...prev, username: event.target.value }))}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 focus:border-[var(--color-primary)] focus:ring focus:ring-blue-200"
                aria-label="Admin username"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold" htmlFor="adminPassword">
                Password
              </label>
              <input
                id="adminPassword"
                type="password"
                value={credentials.password}
                onChange={(event) => setCredentials((prev) => ({ ...prev, password: event.target.value }))}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 focus:border-[var(--color-primary)] focus:ring focus:ring-blue-200"
                aria-label="Admin password"
              />
            </div>
            <button
              type="submit"
              className="inline-flex w-full justify-center rounded-[12px] bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.02]"
            >
              Log In
            </button>
            {error && (
              <p className="text-sm text-[var(--color-error)]" role="alert">
                {error}
              </p>
            )}
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <section className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--color-shadow)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Knowledge base dashboard</h2>
                <p className="mt-1 text-sm text-[var(--color-muted)]">Upload and manage policy documents for the recommendation engine.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="rounded-3xl bg-[var(--color-background)] px-4 py-3 text-sm">
                  <p className="font-semibold">Documents</p>
                  <p>{documentCount}</p>
                </div>
                <button
                  onClick={() => {
                    setAuthenticated(false)
                    navigate('/')
                  }}
                  className="rounded-3xl border border-[var(--color-error)] text-[var(--color-error)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--color-error)] hover:text-white"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--color-shadow)]">
              <h3 className="text-lg font-semibold">Upload new policy</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold" htmlFor="policyFile">
                    Select file
                  </label>
                  <input
                    ref={fileInputRef}
                    id="policyFile"
                    type="file"
                    accept=".pdf,.json,.txt"
                    onChange={(event) => setFile(event.target.files?.[0] || null)}
                    className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3"
                    aria-label="Choose policy document"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold" htmlFor="policyName">
                    Policy name
                  </label>
                  <input
                    id="policyName"
                    value={meta.policyName}
                    onChange={(event) => setMeta((prev) => ({ ...prev, policyName: event.target.value }))}
                    className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 focus:border-[var(--color-primary)] focus:ring focus:ring-blue-200"
                    aria-label="Policy name"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold" htmlFor="insurer">
                    Insurer
                  </label>
                  <input
                    id="insurer"
                    value={meta.insurer}
                    onChange={(event) => setMeta((prev) => ({ ...prev, insurer: event.target.value }))}
                    className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 focus:border-[var(--color-primary)] focus:ring focus:ring-blue-200"
                    aria-label="Insurer name"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="inline-flex w-full items-center justify-center rounded-[12px] bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {uploading ? 'Uploading...' : 'Upload policy'}
                </button>
                {success && <p className="text-sm text-[var(--color-success)]">{success}</p>}
                {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
              </div>
            </div>

            <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--color-shadow)]">
              <h3 className="text-lg font-semibold">Recent documents</h3>
              <div className="mt-4 space-y-4">
                {loadingDocs ? (
                  <p className="text-sm text-[var(--color-muted)]">Loading documents…</p>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold">{doc.policyName}</p>
                            <p className="text-sm text-[var(--color-muted)]">{doc.insurer}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdate(doc.id, 'policyName', prompt('Policy name', doc.policyName) || doc.policyName)}
                              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs font-semibold transition hover:bg-[var(--color-primary-soft)]"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(doc.id)}
                              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs font-semibold text-[var(--color-error)] transition hover:bg-[var(--color-error)/10]"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-[var(--color-muted)]">Uploaded {new Date(doc.uploadDate).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default AdminPanel
