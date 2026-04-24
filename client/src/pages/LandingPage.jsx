import { Link } from 'react-router-dom'

function LandingPage() {
  return (
    <div className="flex flex-col min-h-[80vh]">
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mx-auto mb-6">
          Find your perfect insurance with <span className="text-[var(--color-primary)]">AI precision</span>.
        </h1>
        <p className="text-xl text-[var(--color-muted)] max-w-2xl mx-auto mb-10">
          PolicyMate reads thousands of policy pages to match you with coverage that fits your exact health profile, lifestyle, and budget.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/login"
            className="rounded-full bg-[var(--color-primary)] px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:scale-105 hover:shadow-xl"
          >
            Get Started
          </Link>
        </div>
      </section>

      <section className="py-20 bg-[var(--color-primary-soft)]/30 border-t border-[var(--color-border)]">
        <div className="max-w-[1200px] mx-auto px-4 grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center mx-auto mb-4 text-xl">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Vector Search</h3>
            <p className="text-[var(--color-muted)]">We search through thousands of policy documents instantly to find exact clauses that cover your needs.</p>
          </div>
          <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center mx-auto mb-4 text-xl">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI Explainer</h3>
            <p className="text-[var(--color-muted)]">Don't understand a policy? Chat directly with our AI to get plain-english explanations of any coverage detail.</p>
          </div>
          <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center mx-auto mb-4 text-xl">🛡️</div>
            <h3 className="text-xl font-semibold mb-2">Unbiased Matching</h3>
            <p className="text-[var(--color-muted)]">No pushy sales agents. Just pure data-driven recommendations tailored specifically to your profile.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
