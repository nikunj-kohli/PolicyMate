import { useCallback, useMemo, useState } from 'react'

const lifestyles = ['Sedentary', 'Moderate', 'Active', 'Athlete']
const incomeOptions = ['under 3L', '3-8L', '8-15L', '15L+']
const cityOptions = ['Metro', 'Tier-2', 'Tier-3']
const conditionOptions = ['Diabetes', 'Hypertension', 'Asthma', 'Cardiac', 'None', 'Other']

function validate(profile) {
  const errors = {}
  if (!profile.fullName || profile.fullName.trim().length < 2) {
    errors.fullName = 'Enter a valid name with at least 2 letters.'
  }
  const age = Number(profile.age)
  if (!age || age < 1 || age > 99) {
    errors.age = 'Age must be between 1 and 99.'
  }
  if (!profile.conditions || profile.conditions.length === 0) {
    errors.conditions = 'Select one or more conditions.'
  }
  if (!profile.lifestyle) {
    errors.lifestyle = 'Choose a lifestyle.'
  }
  if (!profile.income) {
    errors.income = 'Select your income band.'
  }
  if (!profile.city) {
    errors.city = 'Choose a city type.'
  }
  return errors
}

export default function ProfileForm({ profile, onSubmit, loading }) {
  const [draft, setDraft] = useState(profile)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const isValid = useMemo(() => Object.keys(validate(draft)).length === 0, [draft])

  const updateField = useCallback((field, value) => {
    setDraft((current) => ({ ...current, [field]: value }))
  }, [])

  const toggleCondition = useCallback((condition) => {
    setDraft((current) => {
      const next = new Set(current.conditions || [])
      if (next.has(condition)) {
        next.delete(condition)
      } else {
        if (condition === 'None') {
          next.clear()
          next.add('None')
        } else {
          next.delete('None')
          next.add(condition)
        }
      }
      return { ...current, conditions: Array.from(next) }
    })
  }, [])

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault()
      const nextErrors = validate(draft)
      setErrors(nextErrors)
      setTouched({ fullName: true, age: true, conditions: true, lifestyle: true, income: true, city: true })
      if (Object.keys(nextErrors).length === 0) {
        onSubmit(draft)
      }
    },
    [draft, onSubmit],
  )

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2" aria-label="PolicyMate profile form">
      <div className="space-y-2">
        <label className="font-semibold" htmlFor="fullName">
          Full Name
        </label>
        <input
          id="fullName"
          name="fullName"
          value={draft.fullName}
          onChange={(e) => updateField('fullName', e.target.value)}
          onBlur={() => setTouched((current) => ({ ...current, fullName: true }))}
          aria-describedby="fullNameHelp fullNameError"
          aria-invalid={errors.fullName ? 'true' : 'false'}
          placeholder="e.g. Ananya Singh"
          className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 transition focus:border-[var(--color-primary)] focus:ring focus:ring-blue-200"
        />
        <p id="fullNameHelp" className="text-sm text-[var(--color-muted)]">
          This is used to personalise your recommendation.
        </p>
        {touched.fullName && errors.fullName ? (
          <p id="fullNameError" className="text-sm text-[var(--color-error)]" role="alert">
            {errors.fullName}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="font-semibold" htmlFor="age">
          Age
        </label>
        <input
          id="age"
          name="age"
          type="number"
          min="1"
          max="99"
          value={draft.age}
          onChange={(e) => updateField('age', e.target.value)}
          onBlur={() => setTouched((current) => ({ ...current, age: true }))}
          aria-describedby="ageHelp ageError"
          aria-invalid={errors.age ? 'true' : 'false'}
          placeholder="1-99"
          className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 transition focus:border-[var(--color-primary)] focus:ring focus:ring-blue-200"
        />
        <p id="ageHelp" className="text-sm text-[var(--color-muted)]">
          Age helps the agent match premium sensitivity and waiting period risk.
        </p>
        {touched.age && errors.age ? (
          <p id="ageError" className="text-sm text-[var(--color-error)]" role="alert">
            {errors.age}
          </p>
        ) : null}
      </div>

      <div className="md:col-span-2 space-y-2">
        <span className="font-semibold">Lifestyle</span>
        <div className="grid gap-2 sm:grid-cols-4">
          {lifestyles.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={draft.lifestyle === option}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                draft.lifestyle === option
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]'
              }`}
              onClick={() => updateField('lifestyle', option)}
            >
              <span className="text-sm font-medium">{option}</span>
            </button>
          ))}
        </div>
        {touched.lifestyle && errors.lifestyle ? (
          <p className="text-sm text-[var(--color-error)]" role="alert">
            {errors.lifestyle}
          </p>
        ) : null}
      </div>

      <div className="md:col-span-2 space-y-2">
        <span className="font-semibold">Pre-existing Conditions</span>
        <div className="grid gap-2 sm:grid-cols-3">
          {conditionOptions.map((condition) => {
            const selected = draft.conditions.includes(condition)
            return (
              <button
                key={condition}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleCondition(condition)}
                className={`rounded-full border px-4 py-3 text-left transition ${
                  selected
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-primary)]'
                }`}
              >
                {condition}
              </button>
            )
          })}
        </div>
        {touched.conditions && errors.conditions ? (
          <p className="text-sm text-[var(--color-error)]" role="alert">
            {errors.conditions}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="font-semibold" htmlFor="income">
          Annual Income
        </label>
        <select
          id="income"
          name="income"
          value={draft.income}
          onChange={(e) => updateField('income', e.target.value)}
          onBlur={() => setTouched((current) => ({ ...current, income: true }))}
          aria-describedby="incomeHelp incomeError"
          aria-invalid={errors.income ? 'true' : 'false'}
          className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 transition focus:border-[var(--color-primary)] focus:ring focus:ring-blue-200"
        >
          {incomeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <p id="incomeHelp" className="text-sm text-[var(--color-muted)]">
          Used to match policy affordability and coverage expectations.
        </p>
        {touched.income && errors.income ? (
          <p id="incomeError" className="text-sm text-[var(--color-error)]" role="alert">
            {errors.income}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="font-semibold" htmlFor="city">
          City Type
        </label>
        <select
          id="city"
          name="city"
          value={draft.city}
          onChange={(e) => updateField('city', e.target.value)}
          onBlur={() => setTouched((current) => ({ ...current, city: true }))}
          aria-describedby="cityHelp cityError"
          aria-invalid={errors.city ? 'true' : 'false'}
          className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 transition focus:border-[var(--color-primary)] focus:ring focus:ring-blue-200"
        >
          {cityOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <p id="cityHelp" className="text-sm text-[var(--color-muted)]">
          City tier influences the expected hospital network and claim settlement experience.
        </p>
        {touched.city && errors.city ? (
          <p id="cityError" className="text-sm text-[var(--color-error)]" role="alert">
            {errors.city}
          </p>
        ) : null}
      </div>

      <div className="md:col-span-2">
        <button
          type="submit"
          className="inline-flex h-14 w-full items-center justify-center rounded-[12px] bg-[var(--color-primary)] px-6 text-sm font-semibold text-white transition duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus-visible:outline-none"
          disabled={!isValid || loading}
          aria-busy={loading ? 'true' : 'false'}
        >
          {loading ? (
            <span className="inline-flex items-center gap-3">
              <span className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              Getting recommendations...
            </span>
          ) : (
            'Get my recommendations'
          )}
        </button>
      </div>
    </form>
  )
}
