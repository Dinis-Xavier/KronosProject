export function extractCountryFromAddress(address) {
  if (!address) return null
  // Accept only exactly 2-letter country codes (e.g. PT, ES). Reject "Portugal".
  const m = String(address).match(/Pa[ií]s:\s*([A-Za-z]{2})(?![A-Za-z])/i)
  return m ? m[1].toUpperCase() : null
}

export function pickTopCountry(addresses) {
  const counts = new Map()
  for (const a of addresses || []) {
    const c = extractCountryFromAddress(a)
    if (!c) continue
    counts.set(c, (counts.get(c) || 0) + 1)
  }

  let topCountry = null
  let topCountryPurchases = 0
  for (const [c, count] of counts.entries()) {
    if (count > topCountryPurchases) {
      topCountry = c
      topCountryPurchases = count
    }
  }

  return { topCountry, topCountryPurchases }
}

