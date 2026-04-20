export function toAddressString(form) {
  const safe = form || {}
  const parts = [
    safe.fullName && `Nome: ${safe.fullName}`,
    safe.addressLine1 && `Morada: ${safe.addressLine1}`,
    safe.addressLine2 && `Complemento: ${safe.addressLine2}`,
    safe.postalCode && `CP: ${safe.postalCode}`,
    safe.city && `Cidade: ${safe.city}`,
    safe.country && `País: ${safe.country}`,
  ].filter(Boolean)
  return parts.join(' | ')
}

