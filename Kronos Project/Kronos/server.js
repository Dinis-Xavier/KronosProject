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

// Products routes
app.get('/api/products', async (req, res) => {
  try {
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
