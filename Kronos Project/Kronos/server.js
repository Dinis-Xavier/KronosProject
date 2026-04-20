import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import multer from 'multer'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { extractCustomIdFromPayPalOrder, isOrderAlreadyCapturedResponse } from './lib/paypal-utils.js'
import { pickTopCountry } from './lib/dashboard-utils.js'
//ddd

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env file from the same directory as server.js
dotenv.config({ path: join(__dirname, '.env') })

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Multer for file uploads (memory storage)
const upload = multer({ storage: multer.memoryStorage() })

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// PayPal config (Sandbox)
const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com'
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
const PAYPAL_SECRET = process.env.PAYPAL_SECRET
const PAYPAL_CURRENCY = process.env.PAYPAL_CURRENCY || 'EUR'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

const getPayPalAccessToken = async () => {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
    throw new Error('Missing PayPal environment variables')
  }

  const basic = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64')
  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`PayPal auth failed (${res.status}): ${text || res.statusText}`)
  }

  const json = await res.json()
  if (!json?.access_token) throw new Error('PayPal auth failed: no access_token')
  return json.access_token
}

const createPayPalOrder = async ({ total, orderId, productName }) => {
  const accessToken = await getPayPalAccessToken()
  const payload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        custom_id: orderId,
        description: productName || 'KRONOS order',
        amount: {
          currency_code: PAYPAL_CURRENCY,
          value: Number(total).toFixed(2),
        },
      },
    ],
    application_context: {
      brand_name: 'KRONOS',
      user_action: 'PAY_NOW',
      return_url: `${FRONTEND_URL}/checkout/return`,
      cancel_url: `${FRONTEND_URL}/checkout/cancel`,
    },
  }

  const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`PayPal create order failed (${res.status}): ${text || res.statusText}`)
  }

  return res.json()
}

const capturePayPalOrder = async (paypalOrderId) => {
  const accessToken = await getPayPalAccessToken()
  const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const bodyText = await res.text().catch(() => '')
    let bodyJson = null
    try {
      bodyJson = bodyText ? JSON.parse(bodyText) : null
    } catch {
      bodyJson = null
    }

    const alreadyCaptured = isOrderAlreadyCapturedResponse(res.status, bodyJson)

    if (alreadyCaptured) {
      return { alreadyCaptured: true, body: bodyJson }
    }

    throw new Error(`PayPal capture failed (${res.status}): ${bodyText || res.statusText}`)
  }

  return { alreadyCaptured: false, body: await res.json() }
}

const getPayPalOrderDetails = async (paypalOrderId) => {
  const accessToken = await getPayPalAccessToken()
  const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`PayPal get order failed (${res.status}): ${text || res.statusText}`)
  }

  return res.json()
}

// Middleware para verificar autenticação
const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    
    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' })
  }
}

// Middleware para verificar se é admin
const requireAdmin = async (req, res, next) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single()
    
    if (error || !profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }
    
    next()
  } catch (error) {
    res.status(403).json({ error: 'Authorization failed' })
  }
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Kronos API is running' })
})

// Products routes (no-store: evita respostas em cache no browser após alterações)
const noStoreJson = (res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.set('Pragma', 'no-cache')
}

app.get('/api/products/:id', async (req, res) => {
  try {
    noStoreJson(res)
    const { id } = req.params
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Product not found' })
      }
      throw error
    }
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/products', async (req, res) => {
  try {
    noStoreJson(res)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create product (admin only)
app.post('/api/products', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      brand,
      model,
      description,
      price,
      stock,
      movement_type,
      case_material,
      strap_material,
      case_diameter,
      water_resistant,
      image
    } = req.body

    // Validate required fields
    if (!name || !brand || !price) {
      return res.status(400).json({ error: 'Name, brand, and price are required' })
    }

    // Insert product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([{
        name,
        brand,
        model: model || null,
        description: description || null,
        price: parseFloat(price),
        stock: stock ? parseInt(stock) : 0,
        movement_type: movement_type || null,
        case_material: case_material || null,
        strap_material: strap_material || null,
        case_diameter: case_diameter ? parseFloat(case_diameter) : null,
        water_resistant: water_resistant || null,
        image: image || null
      }])
      .select()
      .single()

    if (productError) throw productError

    res.status(201).json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    res.status(500).json({ error: error.message })
  }
})

// Upload image to Supabase Storage
app.post('/api/products/upload-image', authenticateUser, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    const file = req.file
    const fileExt = file.originalname.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `products/${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('Watches-Images')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      })

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('Watches-Images')
      .getPublicUrl(filePath)

    res.json({ imageUrl: publicUrl })
  } catch (error) {
    console.error('Error uploading image:', error)
    res.status(500).json({ error: error.message })
  }
})

// Update product (admin only) — partial fields, e.g. stock
app.patch('/api/products/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { stock } = req.body

    if (stock === undefined || stock === null) {
      return res.status(400).json({ error: 'Stock is required' })
    }

    const n = Number.parseInt(String(stock), 10)
    if (Number.isNaN(n) || n < 0) {
      return res.status(400).json({ error: 'Invalid stock value' })
    }

    const { data: product, error } = await supabase
      .from('products')
      .update({ stock: n })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    noStoreJson(res)
    res.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    res.status(500).json({ error: error.message })
  }
})

// Favorites (clientes autenticados; a API usa service role — RLS aplica-se só a acesso direto Supabase)
app.get('/api/favorites', authenticateUser, async (req, res) => {
  try {
    noStoreJson(res)
    const { data, error } = await supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', req.user.id)

    if (error) throw error
    const productIds = (data || []).map((row) => row.product_id)
    res.json({ productIds })
  } catch (error) {
    console.error('Error listing favorites:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/favorites/check/:productId', authenticateUser, async (req, res) => {
  try {
    noStoreJson(res)
    const { productId } = req.params
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('product_id', productId)
      .maybeSingle()

    if (error) throw error
    res.json({ favorited: !!data })
  } catch (error) {
    console.error('Error checking favorite:', error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/favorites', authenticateUser, async (req, res) => {
  try {
    const productId = req.body?.productId
    if (!productId) {
      return res.status(400).json({ error: 'productId is required' })
    }

    const { data: exists, error: pErr } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .maybeSingle()

    if (pErr) throw pErr
    if (!exists) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: req.user.id, product_id: productId })

    if (error) {
      if (error.code === '23505') {
        noStoreJson(res)
        return res.status(200).json({ ok: true, already: true })
      }
      throw error
    }

    noStoreJson(res)
    res.status(201).json({ ok: true })
  } catch (error) {
    console.error('Error adding favorite:', error)
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/favorites/:productId', authenticateUser, async (req, res) => {
  try {
    noStoreJson(res)
    const { productId } = req.params
    const { data, error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', req.user.id)
      .eq('product_id', productId)
      .select('id')

    if (error) throw error
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Favorite not found' })
    }

    res.json({ ok: true })
  } catch (error) {
    console.error('Error removing favorite:', error)
    res.status(500).json({ error: error.message })
  }
})

// Delete product (admin only)
app.delete('/api/products/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .select('id')

    if (error) throw error
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    res.status(500).json({ error: error.message })
  }
})

// Admin dashboard metrics
app.get('/api/admin/dashboard', authenticateUser, requireAdmin, async (req, res) => {
  try {
    noStoreJson(res)

    // Users count (auth.users) via admin API; paginate
    let usersCount = 0
    let page = 1
    const perPage = 1000
    for (;;) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
      if (error) throw error
      const users = data?.users || []
      usersCount += users.length
      if (users.length < perPage) break
      page += 1
    }

    // Products & stock
    const { data: products, error: prodErr } = await supabase
      .from('products')
      .select('id,stock')

    if (prodErr) throw prodErr

    const productsCount = (products || []).length
    let totalStock = 0
    let outOfStockProducts = 0
    for (const p of products || []) {
      const s = Number.parseInt(String(p.stock ?? 0), 10)
      if (!Number.isNaN(s)) totalStock += s
      if ((p.stock ?? 0) <= 0) outOfStockProducts += 1
    }

    // Revenue + paid orders (for country + bestseller)
    const { data: paidOrders, error: ordErr } = await supabase
      .from('orders')
      .select('id,total,address')
      .eq('status', 'paid')

    if (ordErr) throw ordErr

    const totalMoney = (paidOrders || []).reduce((sum, o) => sum + Number.parseFloat(String(o.total ?? 0) || '0'), 0)

    // Country with most purchases (parse from concatenated address)
    const { topCountry, topCountryPurchases } = pickTopCountry((paidOrders || []).map((o) => o.address))

    // Best seller (by quantity) among paid orders
    const paidOrderIds = (paidOrders || []).map((o) => o.id)
    let bestSeller = null
    if (paidOrderIds.length > 0) {
      const { data: items, error: itemsErr } = await supabase
        .from('order_items')
        .select('product_id,quantity,products(name)')
        .in('order_id', paidOrderIds)

      if (itemsErr) throw itemsErr

      const qtyByProduct = new Map()
      const nameByProduct = new Map()
      for (const it of items || []) {
        const pid = it.product_id
        const qty = Number.parseInt(String(it.quantity ?? 0), 10)
        if (!pid || Number.isNaN(qty)) continue
        qtyByProduct.set(pid, (qtyByProduct.get(pid) || 0) + qty)
        const name = it?.products?.name
        if (name && !nameByProduct.has(pid)) nameByProduct.set(pid, name)
      }

      let bestProductId = null
      let bestQty = 0
      for (const [pid, qty] of qtyByProduct.entries()) {
        if (qty > bestQty) {
          bestProductId = pid
          bestQty = qty
        }
      }

      if (bestProductId) {
        bestSeller = {
          productId: bestProductId,
          name: nameByProduct.get(bestProductId) || null,
          quantity: bestQty,
        }
      }
    }

    res.json({
      usersCount,
      totalMoney,
      productsCount,
      totalStock,
      outOfStockProducts,
      topCountry,
      topCountryPurchases,
      bestSeller,
      currency: PAYPAL_CURRENCY,
    })
  } catch (error) {
    console.error('Error loading admin dashboard:', error)
    res.status(500).json({ error: error.message })
  }
})

// PayPal routes (authenticated users)
app.post('/api/paypal/create-order', authenticateUser, async (req, res) => {
  try {
    const productId = req.body?.productId
    const address = String(req.body?.address || '').trim()

    if (!productId) return res.status(400).json({ error: 'productId is required' })
    if (!address) return res.status(400).json({ error: 'address is required' })

    const { data: product, error: pErr } = await supabase
      .from('products')
      .select('id,name,price,stock')
      .eq('id', productId)
      .single()

    if (pErr) {
      if (pErr.code === 'PGRST116') return res.status(404).json({ error: 'Product not found' })
      throw pErr
    }

    if (!product) return res.status(404).json({ error: 'Product not found' })
    if ((product.stock ?? 0) <= 0) return res.status(400).json({ error: 'Product out of stock' })

    const total = Number.parseFloat(String(product.price))
    if (Number.isNaN(total) || total <= 0) return res.status(400).json({ error: 'Invalid product price' })

    const { data: order, error: oErr } = await supabase
      .from('orders')
      .insert([{
        user_id: req.user.id,
        total,
        status: 'pending',
        address,
      }])
      .select()
      .single()

    if (oErr) throw oErr

    const { error: iErr } = await supabase
      .from('order_items')
      .insert([{
        order_id: order.id,
        product_id: product.id,
        quantity: 1,
        price: total,
      }])

    if (iErr) throw iErr

    const paypalOrder = await createPayPalOrder({
      total,
      orderId: order.id,
      productName: product.name,
    })

    const approveUrl = Array.isArray(paypalOrder?.links)
      ? paypalOrder.links.find((l) => l?.rel === 'approve')?.href
      : null

    if (!approveUrl) {
      return res.status(500).json({ error: 'PayPal approve link not found' })
    }

    noStoreJson(res)
    res.json({ approveUrl })
  } catch (error) {
    console.error('Error creating PayPal order:', error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/paypal/capture-order', authenticateUser, async (req, res) => {
  try {
    const paypalOrderId = String(req.body?.paypalOrderId || '').trim()
    if (!paypalOrderId) return res.status(400).json({ error: 'paypalOrderId is required' })

    const captureResult = await capturePayPalOrder(paypalOrderId)
    const capture = captureResult?.body

    let orderId = extractCustomIdFromPayPalOrder(capture)

    // Some PayPal capture responses omit custom_id; fetch order details as fallback.
    if (!orderId) {
      const details = await getPayPalOrderDetails(paypalOrderId)
      orderId = extractCustomIdFromPayPalOrder(details)
    }

    if (!orderId) return res.status(500).json({ error: 'Missing custom_id (orderId) in PayPal response' })

    // Mark as paid only once (prevents double stock decrement)
    const { data: updated, error: uErr } = await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', orderId)
      .eq('user_id', req.user.id)
      .eq('status', 'pending')
      .select('id,status')
      .maybeSingle()

    if (uErr) {
      throw uErr
    }

    // If no row updated, it's either already paid (or not pending), or not found for this user.
    if (!updated) {
      const { data: existing, error: eErr } = await supabase
        .from('orders')
        .select('id,status')
        .eq('id', orderId)
        .eq('user_id', req.user.id)
        .maybeSingle()

      if (eErr) throw eErr
      if (!existing) return res.status(404).json({ error: 'Order not found' })

      noStoreJson(res)
      return res.json({ ok: true, orderId: existing.id, status: existing.status, alreadyProcessed: true })
    }

    // Decrement stock for each item in this order
    const { data: items, error: itemsErr } = await supabase
      .from('order_items')
      .select('product_id,quantity')
      .eq('order_id', orderId)

    if (itemsErr) throw itemsErr

    for (const item of items || []) {
      const qty = Number.parseInt(String(item.quantity ?? 0), 10)
      if (!item.product_id || Number.isNaN(qty) || qty <= 0) continue

      const { data: p, error: pErr } = await supabase
        .from('products')
        .select('id,stock')
        .eq('id', item.product_id)
        .single()

      if (pErr) throw pErr

      const current = Number.parseInt(String(p.stock ?? 0), 10)
      const nextStock = Math.max(0, current - qty)

      const { error: sErr } = await supabase
        .from('products')
        .update({ stock: nextStock })
        .eq('id', item.product_id)

      if (sErr) throw sErr
    }

    noStoreJson(res)
    res.json({
      ok: true,
      orderId: updated.id,
      status: updated.status,
      paypalAlreadyCaptured: !!captureResult?.alreadyCaptured,
    })
  } catch (error) {
    console.error('Error capturing PayPal order:', error)
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
