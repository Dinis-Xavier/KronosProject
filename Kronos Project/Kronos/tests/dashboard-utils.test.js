import test from 'node:test'
import assert from 'node:assert/strict'
import { extractCountryFromAddress, pickTopCountry } from '../lib/dashboard-utils.js'

test('extractCountryFromAddress returns country code', () => {
  assert.equal(extractCountryFromAddress('Nome: A | País: pt'), 'PT')
  assert.equal(extractCountryFromAddress('País: ES'), 'ES')
  assert.equal(extractCountryFromAddress('País: fr | Cidade: Paris'), 'FR')
})

test('extractCountryFromAddress supports País with accent', () => {
  assert.equal(extractCountryFromAddress('País: PT'), 'PT')
  assert.equal(extractCountryFromAddress('País: pt'), 'PT')
})

test('extractCountryFromAddress returns null when missing/invalid', () => {
  assert.equal(extractCountryFromAddress('Cidade: Lisboa'), null)
  assert.equal(extractCountryFromAddress(null), null)
  assert.equal(extractCountryFromAddress('País: Portugal'), null)
})

test('pickTopCountry returns top country and purchases', () => {
  const { topCountry, topCountryPurchases } = pickTopCountry([
    'País: PT',
    'País: ES',
    'País: PT',
    'Cidade: Lisboa',
  ])
  assert.equal(topCountry, 'PT')
  assert.equal(topCountryPurchases, 2)
})

