export function ToastManager({ toasts }) {
  return (
    <div className="fixed right-4 top-20 z-50 flex flex-col gap-3" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-enter rounded-2xl border p-4 text-sm shadow-[var(--color-shadow)] ${
            toast.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-900'
              : toast.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-900'
              : 'border-slate-200 bg-white text-[var(--color-text)]'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
