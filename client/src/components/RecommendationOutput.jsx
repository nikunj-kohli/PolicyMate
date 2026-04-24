import { memo } from 'react'

function SkeletonRow() {
  return (
    <tr className="animate-fadeInUp">
      <td className="h-12 border-b border-[var(--color-border)] bg-[var(--color-surface)]"></td>
      <td className="h-12 border-b border-[var(--color-border)] bg-[var(--color-surface)]"></td>
      <td className="h-12 border-b border-[var(--color-border)] bg-[var(--color-surface)]"></td>
    </tr>
  )
}

function RecommendationOutput({ data, loading, error }) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--color-shadow)]">
          <div className="mb-4 h-6 w-52 rounded-full bg-[var(--color-surface-muted)] skeleton"></div>
          <div className="overflow-hidden rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)]">
            <table className="w-full border-collapse">
              <tbody>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[12px] border border-red-200 bg-red-50 p-6 text-sm text-red-900" role="alert">
        {error}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-muted)]">
        Enter your profile and get a grounded recommendation.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--color-shadow)] animate-fadeInUp">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Peer comparison</h2>
            <p className="text-sm text-[var(--color-muted)]">Recommended policy versus two alternatives.</p>
          </div>
          <span className="rounded-full bg-[var(--color-primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
            Best fit: {data.recommendedPolicyName}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-[var(--color-surface-muted)] text-[var(--color-muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Policy Name</th>
                <th className="px-4 py-3 font-semibold">Insurer</th>
                <th className="px-4 py-3 font-semibold">Premium (Rs/yr)</th>
                <th className="px-4 py-3 font-semibold">Cover Amount</th>
                <th className="px-4 py-3 font-semibold">Waiting Period</th>
                <th className="px-4 py-3 font-semibold">Key Benefit</th>
                <th className="px-4 py-3 font-semibold">Suitability Score</th>
              </tr>
            </thead>
            <tbody>
              {data.peerComparison.map((policy, index) => (
                <tr key={`${policy.policyName}-${index}`} className="border-b border-[var(--color-border)] hover:bg-[var(--color-primary-soft)] transition-colors">
                  <td className="px-4 py-4">{policy.policyName}</td>
                  <td className="px-4 py-4">{policy.insurer}</td>
                  <td className="px-4 py-4">{policy.premium}</td>
                  <td className="px-4 py-4">{policy.coverAmount}</td>
                  <td className="px-4 py-4">{policy.waitingPeriod}</td>
                  <td className="px-4 py-4">{policy.keyBenefit}</td>
                  <td className="px-4 py-4">{policy.suitabilityScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--color-shadow)] animate-fadeInUp">
          <div className="mb-4">
            <h3 className="text-xl font-semibold">Coverage detail</h3>
            <p className="text-sm text-[var(--color-muted)]">Grounded policy coverage details from the document.</p>
          </div>
          <div className="space-y-4">
            <div>
              <p className="font-semibold">Inclusions</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
                {data.coverageDetail.inclusions.map((item, index) => (
                  <li key={`inc-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold">Exclusions</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
                {data.coverageDetail.exclusions.map((item, index) => (
                  <li key={`exc-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold">Sub-limits</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
                {data.coverageDetail.subLimits.map((item, index) => (
                  <li key={`sub-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 text-sm text-[var(--color-muted)]">
              <div className="rounded-2xl bg-[var(--color-background)] p-4">
                <p className="font-semibold">Co-pay %</p>
                <p>{data.coverageDetail.coPay}</p>
              </div>
              <div className="rounded-2xl bg-[var(--color-background)] p-4">
                <p className="font-semibold">Claim type</p>
                <p>{data.coverageDetail.claimType}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--color-shadow)] animate-fadeInUp">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">Why this policy?</p>
            <h3 className="mt-2 text-xl font-semibold">Recommended for your profile</h3>
          </div>
          <p className="text-sm leading-7 text-[var(--color-muted)]">{data.whyThisPolicy}</p>
        </div>
      </div>
    </div>
  )
}

export default memo(RecommendationOutput)
