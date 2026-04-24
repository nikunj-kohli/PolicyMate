import { Suspense } from 'react'
import AdminPanel from '../components/AdminPanel.jsx'

function AdminPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6">
      <Suspense fallback={<div className="p-8 text-center text-[var(--color-muted)]">Loading admin experience…</div>}>
        <AdminPanel />
      </Suspense>
    </div>
  )
}

export default AdminPage
