import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Note: import after stubbing fetch to avoid accidental real calls
import { api } from '../src/lib/api'

describe('api wrapper', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('GET sends Authorization header when token provided', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    })

    await api.get('/x', 'token123')

    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    const [, options] = globalThis.fetch.mock.calls[0]
    expect(options.headers.Authorization).toBe('Bearer token123')
  })

  it('POST sends JSON body and content-type', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1 }),
    })

    await api.post('/x', { a: 1 }, 't')
    const [, options] = globalThis.fetch.mock.calls[0]
    expect(options.method).toBe('POST')
    expect(options.headers['Content-Type']).toBe('application/json')
    expect(options.headers.Authorization).toBe('Bearer t')
    expect(options.body).toBe(JSON.stringify({ a: 1 }))
  })

  it('throws Error with server message when response not ok', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: false,
      statusText: 'Bad Request',
      json: async () => ({ error: 'nope' }),
    })

    await expect(api.get('/x')).rejects.toThrow('nope')
  })

  it('throws generic Error when response not ok and JSON parse fails', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: false,
      statusText: 'Boom',
      json: async () => {
        throw new Error('invalid json')
      },
    })

    await expect(api.get('/x')).rejects.toThrow('Boom')
  })

  it('del returns null when response json parsing fails', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => {
        throw new Error('invalid json')
      },
    })

    const res = await api.del('/x', 't')
    expect(res).toBeNull()
  })
})

