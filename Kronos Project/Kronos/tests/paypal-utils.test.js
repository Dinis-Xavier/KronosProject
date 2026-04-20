import test from 'node:test'
import assert from 'node:assert/strict'
import { extractCustomIdFromPayPalOrder, isOrderAlreadyCapturedResponse } from '../lib/paypal-utils.js'

test('isOrderAlreadyCapturedResponse detects ORDER_ALREADY_CAPTURED', () => {
  const body = {
    name: 'UNPROCESSABLE_ENTITY',
    details: [{ issue: 'ORDER_ALREADY_CAPTURED' }],
  }
  assert.equal(isOrderAlreadyCapturedResponse(422, body), true)
})

test('isOrderAlreadyCapturedResponse returns false for other errors', () => {
  const body = { name: 'UNPROCESSABLE_ENTITY', details: [{ issue: 'OTHER' }] }
  assert.equal(isOrderAlreadyCapturedResponse(422, body), false)
  assert.equal(isOrderAlreadyCapturedResponse(500, body), false)
  assert.equal(isOrderAlreadyCapturedResponse(422, null), false)
})

test('extractCustomIdFromPayPalOrder reads purchase_units[0].custom_id', () => {
  const payload = { purchase_units: [{ custom_id: 'order-123' }] }
  assert.equal(extractCustomIdFromPayPalOrder(payload), 'order-123')
})

test('extractCustomIdFromPayPalOrder returns null when missing', () => {
  assert.equal(extractCustomIdFromPayPalOrder({}), null)
  assert.equal(extractCustomIdFromPayPalOrder({ purchase_units: [] }), null)
  assert.equal(extractCustomIdFromPayPalOrder(null), null)
})

test('isOrderAlreadyCapturedResponse is resilient to weird shapes', () => {
  assert.equal(isOrderAlreadyCapturedResponse(422, { name: 'UNPROCESSABLE_ENTITY', details: null }), false)
  assert.equal(isOrderAlreadyCapturedResponse(422, { name: 'X', details: [{ issue: 'ORDER_ALREADY_CAPTURED' }] }), false)
  assert.equal(isOrderAlreadyCapturedResponse(422, { name: 'UNPROCESSABLE_ENTITY', details: [{}] }), false)
})

