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

  // Edit and Delete states
  const [editDocId, setEditDocId] = useState(null)
  const [editForm, setEditForm] = useState({ policyName: '', insurer: '' })
  const [deleteTarget, setDeleteTarget] = useState(null)

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

  const saveEdit = useCallback(async (id) => {
    setError('')
    try {
      await axios.put(`http://localhost:5001/api/admin/docs/${id}`, editForm, { withCredentials: true })
      fetchDocuments()
      setSuccess('Policy metadata updated')
      setEditDocId(null)
      setTimeout(() => setSuccess(''), 2500)
    } catch (err) {
      setError('Update failed.')
    }
  }, [editForm, fetchDocuments])

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return
    setError('')
    try {
      await axios.delete(`http://localhost:5001/api/admin/docs/${deleteTarget.id}`, { withCredentials: true })
      setSuccess('Policy document deleted')
      setDeleteTarget(null)
      fetchDocuments()
      setTimeout(() => setSuccess(''), 2500)
    } catch (err) {
      setError('Delete request failed.')
    }
  }, [deleteTarget, fetchDocuments])

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
                    Policy name <span className="text-xs font-normal text-slate-500">(Optional - can edit later)</span>
                  </label>
                  <input
                    id="policyName"
                    value={meta.policyName}
                    onChange={(event) => setMeta((prev) => ({ ...prev, policyName: event.target.value }))}
                    className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 focus:border-[var(--color-primary)] focus:ring focus:ring-blue-200"
                    placeholder="e.g. Ergo Easy"
                    aria-label="Policy name"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold" htmlFor="insurer">
                    Insurer <span className="text-xs font-normal text-slate-500">(Optional - can edit later)</span>
                  </label>
                  <input
                    id="insurer"
                    value={meta.insurer}
                    onChange={(event) => setMeta((prev) => ({ ...prev, insurer: event.target.value }))}
                    className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 focus:border-[var(--color-primary)] focus:ring focus:ring-blue-200"
                    placeholder="e.g. HDFC"
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
                ) : documents.length === 0 ? (
                  <p className="text-sm text-[var(--color-muted)]">No documents uploaded yet.</p>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[var(--color-background)] text-[var(--color-muted)]">
                        <tr>
                          <th className="px-4 py-3 font-semibold">File Name</th>
                          <th className="px-4 py-3 font-semibold">Upload Date</th>
                          <th className="px-4 py-3 font-semibold">File Type</th>
                          <th className="px-4 py-3 font-semibold">Policy Name</th>
                          <th className="px-4 py-3 font-semibold">Insurer</th>
                          <th className="px-4 py-3 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border)]">
                        {documents.map((doc) => {
                          const isEditing = editDocId === doc.id
                          return (
                            <tr key={doc.id} className="transition hover:bg-[var(--color-background)/50]">
                              <td className="px-4 py-3 font-mono text-xs">{doc.filename || 'Unknown'}</td>
                              <td className="px-4 py-3">{doc.uploadDate ? new Date(doc.uploadDate).toISOString().split('T')[0] : 'N/A'}</td>
                              <td className="px-4 py-3">
                                <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold uppercase text-slate-600">
                                  {doc.sourceType || 'PDF'}
                               </span>
                              </td>
                              <td className="px-4 py-3">
                                {isEditing ? (
                                  <input
                                    value={editForm.policyName}
                                    onChange={(e) => setEditForm({ ...editForm, policyName: e.target.value })}
                                    className="w-full rounded border px-2 py-1 text-sm"
                                  />
                                ) : (
                                  <span className="font-semibold">{doc.policyName}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {isEditing ? (
                                  <input
                                    value={editForm.insurer}
                                    onChange={(e) => setEditForm({ ...editForm, insurer: e.target.value })}
                                    className="w-full rounded border px-2 py-1 text-sm"
                                  />
                                ) : (
                                  <span>{doc.insurer}</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  {isEditing ? (
                                    <>
                                      <button onClick={() => saveEdit(doc.id)} className="rounded bg-[var(--color-primary)] px-2 py-1 text-xs text-white hover:bg-blue-600">Save</button>
                                      <button onClick={() => setEditDocId(null)} className="rounded bg-slate-200 px-2 py-1 text-xs hover:bg-slate-300">Cancel</button>
                                    </>
                                  ) : (
                                    <>
                                      {doc.filename && doc.filename !== 'Unknown' && (
                                        <a
                                          href={`http://localhost:5001/sample-policies/${doc.filename}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-[var(--color-accent)] hover:underline"
                                        >
                                          View
                                        </a>
                                      )}
                                      <button onClick={() => { setEditDocId(doc.id); setEditForm({ policyName: doc.policyName, insurer: doc.insurer }) }} className="text-[var(--color-primary)] hover:underline">Edit</button>
                                      <button onClick={() => setDeleteTarget(doc)} className="text-[var(--color-error)] hover:underline">Delete</button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete <strong>{deleteTarget.policyName}</strong>? This will permanently remove the policy and its vector embeddings from the system.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel
