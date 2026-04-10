import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import multer from 'multer'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
