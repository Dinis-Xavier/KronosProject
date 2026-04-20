import { describe, expect, it } from 'vitest'
import { toAddressString } from '../src/lib/address'

describe('toAddressString', () => {
  it('returns empty string for empty input', () => {
    expect(toAddressString(null)).toBe('')
    expect(toAddressString({})).toBe('')
  })

  it('ignores unknown fields', () => {
    const s = toAddressString({ foo: 'bar', country: 'PT' })
    expect(s).toBe('País: PT')
  })

  it('keeps empty/falsey values out', () => {
    const s = toAddressString({
      fullName: '',
      addressLine1: 'Rua A',
      addressLine2: null,
      postalCode: undefined,
      city: 'Lisboa',
      country: 'PT',
    })
    expect(s).toBe('Morada: Rua A | Cidade: Lisboa | País: PT')
  })

  it('concatenates only provided fields', () => {
    const s = toAddressString({
      fullName: 'João Silva',
      addressLine1: 'Rua A, 10',
      city: 'Lisboa',
      country: 'PT',
    })
    expect(s).toBe('Nome: João Silva | Morada: Rua A, 10 | Cidade: Lisboa | País: PT')
  })

  it('includes complemento and postal code when present', () => {
    const s = toAddressString({
      fullName: 'Ana',
      addressLine1: 'Av. B, 2',
      addressLine2: 'Apto 3',
      postalCode: '1000-000',
      city: 'Lisboa',
      country: 'PT',
    })
    expect(s).toContain('Complemento: Apto 3')
    expect(s).toContain('CP: 1000-000')
  })
})

