export function isOrderAlreadyCapturedResponse(statusCode, bodyJson) {
  if (statusCode !== 422) return false
  if (!bodyJson || bodyJson.name !== 'UNPROCESSABLE_ENTITY') return false
  if (!Array.isArray(bodyJson.details)) return false
  return bodyJson.details.some((d) => d && d.issue === 'ORDER_ALREADY_CAPTURED')
}

export function extractCustomIdFromPayPalOrder(payload) {
  const pu = Array.isArray(payload?.purchase_units) ? payload.purchase_units[0] : null
  return pu?.custom_id || null
}

