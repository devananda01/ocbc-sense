// Passport countries supported by the documented eligibility API.
export const COUNTRIES = [
  { code: 'HK', name: 'Hong Kong (HKSAR)' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'CN', name: 'Mainland China' },
]

export function countryName(code) {
  return COUNTRIES.find((c) => c.code === code)?.name ?? ''
}
