const lifestyleOptions = ['Sedentary', 'Moderate', 'Active', 'Athlete']
const incomeOptions = ['under 3L', '3-8L', '8-15L', '15L+']
const cityOptions = ['Metro', 'Tier-2', 'Tier-3']
const conditionsOptions = ['Diabetes', 'Hypertension', 'Asthma', 'Cardiac', 'None', 'Other']

export function validateProfile(profile) {
  const errors = {}
  if (!profile?.fullName || String(profile.fullName).trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.'
  }
  const age = Number(profile?.age)
  if (!age || age < 1 || age > 99) {
    errors.age = 'Age must be a number between 1 and 99.'
  }

  if (!lifestyleOptions.includes(profile?.lifestyle)) {
    errors.lifestyle = 'Lifestyle selection is required.'
  }

  if (!Array.isArray(profile?.conditions) || profile.conditions.length === 0) {
    errors.conditions = 'Select at least one condition option.'
  }

  if (!incomeOptions.includes(profile?.income)) {
    errors.income = 'Annual income selection is required.'
  }

  if (!cityOptions.includes(profile?.city)) {
    errors.city = 'City type selection is required.'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}
