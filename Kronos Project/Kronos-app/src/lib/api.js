const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const api = {
  async get(endpoint, token = null) {
    const headers = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    const response = await fetch(`${API_URL}${endpoint}`, {
      cache: 'no-store',
      headers,
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.error || 'Request failed')
    }
    return response.json()
  },

  async post(endpoint, data, token = null) {
    const headers = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.error || 'Request failed')
    }
    return response.json()
  },

  async patch(endpoint, data, token) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.error || 'Request failed')
    }
    return response.json()
  },

  async del(endpoint, token) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.error || 'Request failed')
    }

    return response.json().catch(() => null)
  },

  async uploadImage(file, token) {
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(`${API_URL}/products/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(error.error || 'Upload failed')
    }
    return response.json()
  },
}
