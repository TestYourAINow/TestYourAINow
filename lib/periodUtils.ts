// lib/periodUtils.ts
// Calendar-aware period calculation — keeps the same day-of-month across renewals.

export function nextPeriodEnd(from: Date, periodDays: number): Date {
  const d = new Date(from)
  if (periodDays === 30) {
    d.setMonth(d.getMonth() + 1)
  } else if (periodDays === 90) {
    d.setMonth(d.getMonth() + 3)
  } else if (periodDays === 365) {
    d.setFullYear(d.getFullYear() + 1)
  } else {
    d.setDate(d.getDate() + periodDays)
  }
  return d
}
