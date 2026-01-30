import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { supabase } from '../lib/supabase'

const logo = '/logo.png'

function Catalog() {
  const { user, signOut, isAdmin, loading } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('Todos')
  const [selectedMaterial, setSelectedMaterial] = useState('Todos')
  const [selectedMovement, setSelectedMovement] = useState('Todos')
  const [selectedPrice, setSelectedPrice] = useState('Todos os preços')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [addProductModalOpen, setAddProductModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    model: '',
    description: '',
    price: '',
    stock: '',
    movement_type: '',
    case_material: '',
    strap_material: '',
    case_diameter: '',
    water_resistant: '',
    image: ''
  })

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      // Criar preview da imagem
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogout = async () => {
    await signOut()
    setDrawerOpen(false)
  }

  const resetProductForm = () => {
    setProductForm({
      name: '',
      brand: '',
      model: '',
      description: '',
      price: '',
      stock: '',
      movement_type: '',
      case_material: '',
      strap_material: '',
      case_diameter: '',
      water_resistant: '',
      image: ''
    })
    setSelectedImage(null)
    setImagePreview(null)
    const fileInput = document.getElementById('image-upload')
    if (fileInput) fileInput.value = ''
  }

  const handleCloseModal = () => {
    setAddProductModalOpen(false)
    resetProductForm()
  }

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true)
        const data = await api.get('/products')
        setProducts(data)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setProductsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Handle product submission
  const handleSubmitProduct = async (e) => {
    e.preventDefault()
    if (!user) return

    try {
      setSubmitting(true)
      
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      let imageUrl = null

      // Upload image if selected
      if (selectedImage) {
        const uploadResult = await api.uploadImage(selectedImage, session.access_token)
        imageUrl = uploadResult.imageUrl
      }

      // Create product
      const productData = {
        name: productForm.name,
        brand: productForm.brand,
        model: productForm.model || null,
        description: productForm.description || null,
        price: productForm.price,
        stock: productForm.stock || 0,
        movement_type: productForm.movement_type || null,
        case_material: productForm.case_material || null,
        strap_material: productForm.strap_material || null,
        case_diameter: productForm.case_diameter || null,
        water_resistant: productForm.water_resistant || null,
        image: imageUrl
      }

      const newProduct = await api.post('/products', productData, session.access_token)
      
      // Add to products list
      setProducts([newProduct, ...products])
      
      // Close modal and reset form
      handleCloseModal()
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Erro ao criar produto: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#ffffff'
      }}>
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#000000', color: '#ffffff', minHeight: '100vh' }}>
      {/* Header/Navbar */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 80px',
        backgroundColor: '#000000',
        borderBottom: '1px solid #1a1a1a',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(0, 0, 0, 0.95)'
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img 
            src={logo} 
            alt="KRONOS" 
            style={{
              width: '30px',
              height: '44px',
              marginRight: '12px'
            }}
          />
          <span style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#d4af37',
            fontFamily: "'Playfair Display', serif"
          }}>
            KRONOS
          </span>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', gap: '40px' }}>
          <Link to="/catalog" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>COLEÇÕES</Link>
          <a href="#" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>NOVIDADES</a>
          <a href="#" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>SOBRE</a>
          <a href="#" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>CONTACTO</a>
        </nav>

        {/* Action Buttons / User */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {user ? (
            <>
              <div 
                onClick={() => isAdmin && setDrawerOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '999px',
                  border: '1px solid #2a2a2a',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  color: '#ffffff',
                  maxWidth: '280px',
                  cursor: isAdmin ? 'pointer' : 'default'
                }}
              >
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(212,175,55,0.12)',
                  border: '1px solid rgba(212,175,55,0.35)',
                  flexShrink: 0
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5Z" stroke="#d4af37" strokeWidth="2"/>
                    <path d="M20 22a8 8 0 1 0-16 0" stroke="#d4af37" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {user.user_metadata?.name || user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  padding: '10px 24px',
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: '1px solid #ffffff',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  padding: '10px 24px',
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: '1px solid #ffffff',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                ENTRAR
              </Link>
              <Link
                to="/signup"
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#d4af37',
                  color: '#1a1a1a',
                  border: 'none',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Criar Conta
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Admin Drawer */}
      {drawerOpen && isAdmin && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000
            }}
            onClick={() => setDrawerOpen(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '320px',
              height: '100vh',
              backgroundColor: '#0a0a0a',
              borderLeft: '1px solid #1a1a1a',
              zIndex: 1001,
              padding: '40px',
              overflowY: 'auto'
            }}
          >
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '24px',
                fontFamily: "'Playfair Display', serif"
              }}>
                Painel Admin
              </h3>
              <button
                onClick={() => {}}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#d4af37',
                  color: '#1a1a1a',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '16px'
                }}
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: '1px solid #3a3a3a',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Sair
              </button>
            </div>
          </div>
        </>
      )}

      {/* Catalog Header */}
      <section style={{
        padding: '80px 80px 60px',
        backgroundColor: '#000000',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '16px',
          color: '#d4af37',
          marginBottom: '16px',
          fontWeight: '500',
          letterSpacing: '2px'
        }}>
          CATÁLOGO COMPLETO
        </p>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '600',
          color: '#ffffff',
          marginBottom: '40px',
          fontFamily: "'Playfair Display', serif"
        }}>
          Nossa Coleção
        </h1>

        {/* Search Bar */}
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#888'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar relógios..."
            style={{
              width: '100%',
              padding: '14px 16px 14px 48px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #3a3a3a',
              borderRadius: '8px',
              fontSize: '16px',
              color: '#ffffff',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#d4af37'}
            onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
          />
        </div>
      </section>

      {/* Main Content - Filters and Products */}
      <section style={{
        display: 'flex',
        padding: '0 80px 80px',
        gap: '40px',
        minHeight: '60vh'
      }}>
        {/* Left Sidebar - Filters */}
        <aside style={{
          width: '280px',
          flexShrink: 0
        }}>
          {/* Brand Filter */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#d4af37',
              marginBottom: '20px'
            }}>
              Brand
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Todos', 'Rolex', 'Omega', 'Tag Heuer', 'Breitling', 'Patek Philippe', 'Audemars Piguet'].map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: selectedBrand === brand ? '#d4af37' : 'transparent',
                    color: selectedBrand === brand ? '#1a1a1a' : '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Separator */}
          <div style={{
            height: '1px',
            backgroundColor: '#1a1a1a',
            marginBottom: '40px'
          }} />

          {/* Material Filter */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#d4af37',
              marginBottom: '20px'
            }}>
              Material
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Todos', 'Aço Inoxidável', 'Ouro', 'Titânio', 'Cerâmica', 'Platina'].map((material) => (
                <button
                  key={material}
                  onClick={() => setSelectedMaterial(material)}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: selectedMaterial === material ? '#d4af37' : 'transparent',
                    color: selectedMaterial === material ? '#1a1a1a' : '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {material}
                </button>
              ))}
            </div>
          </div>

          {/* Separator */}
          <div style={{
            height: '1px',
            backgroundColor: '#1a1a1a',
            marginBottom: '40px'
          }} />

          {/* Movement Type Filter */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#d4af37',
              marginBottom: '20px'
            }}>
              Tipo de Movimento
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Todos', 'Quartzo', 'Manual', 'Automático'].map((movement) => (
                <button
                  key={movement}
                  onClick={() => setSelectedMovement(movement)}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: selectedMovement === movement ? '#d4af37' : 'transparent',
                    color: selectedMovement === movement ? '#1a1a1a' : '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {movement}
                </button>
              ))}
            </div>
          </div>

          {/* Separator */}
          <div style={{
            height: '1px',
            backgroundColor: '#1a1a1a',
            marginBottom: '40px'
          }} />

          {/* Price Filter */}
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#d4af37',
              marginBottom: '20px'
            }}>
              Preço
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Todos os preços', 'Até €3.000', '€3.000 - €4.000', '€4.000 - €5.000', 'Acima de €5.000'].map((price) => (
                <button
                  key={price}
                  onClick={() => setSelectedPrice(price)}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: selectedPrice === price ? '#d4af37' : 'transparent',
                    color: selectedPrice === price ? '#1a1a1a' : '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {price}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Content - Products Area */}
        <main style={{
          flex: '1',
          minHeight: '400px'
        }}>
          {/* Products Count and Add Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px'
          }}>
            <div style={{
              color: '#ffffff',
              fontSize: '16px'
            }}>
              {productsLoading ? 'Carregando...' : `${products.length} produto${products.length !== 1 ? 's' : ''} encontrado${products.length !== 1 ? 's' : ''}`}
            </div>
            {isAdmin && (
              <button
                onClick={() => setAddProductModalOpen(true)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#d4af37',
                  color: '#1a1a1a',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>+</span>
                Adicionar Produto
              </button>
            )}
          </div>

          {/* Products Grid */}
          {productsLoading ? (
            <div style={{
              textAlign: 'center',
              padding: '120px 40px',
              backgroundColor: '#0a0a0a',
              borderRadius: '8px',
              border: '1px solid #1a1a1a'
            }}>
              <p style={{
                fontSize: '18px',
                color: '#888'
              }}>
                Carregando produtos...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '120px 40px',
              backgroundColor: '#0a0a0a',
              borderRadius: '8px',
              border: '1px solid #1a1a1a'
            }}>
              <p style={{
                fontSize: '18px',
                color: '#888',
                marginBottom: '16px'
              }}>
                Nenhum produto encontrado
              </p>
              <p style={{
                fontSize: '14px',
                color: '#666'
              }}>
                Os produtos aparecerão aqui quando estiverem disponíveis
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '32px'
            }}>
              {products.map((product) => (
                <div
                  key={product.id}
                  style={{
                    backgroundColor: '#0a0a0a',
                    borderRadius: '8px',
                    border: '1px solid #1a1a1a',
                    overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Product Image */}
                  <div style={{
                    width: '100%',
                    height: '280px',
                    backgroundColor: '#1a1a1a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div style={{
                        color: '#666',
                        fontSize: '14px'
                      }}>
                        Sem imagem
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div style={{ padding: '20px' }}>
                    <p style={{
                      fontSize: '12px',
                      color: '#d4af37',
                      marginBottom: '8px',
                      fontWeight: '500',
                      letterSpacing: '1px'
                    }}>
                      {product.brand?.toUpperCase()}
                    </p>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '12px',
                      fontFamily: "'Playfair Display', serif"
                    }}>
                      {product.name}
                    </h3>
                    {product.model && (
                      <p style={{
                        fontSize: '14px',
                        color: '#888',
                        marginBottom: '12px'
                      }}>
                        {product.model}
                      </p>
                    )}
                    <p style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#ffffff'
                    }}>
                      €{parseFloat(product.price).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </section>

      {/* Add Product Modal */}
      {addProductModalOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={handleCloseModal}
          >
            <div
              style={{
                backgroundColor: '#0a0a0a',
                borderRadius: '12px',
                border: '1px solid #1a1a1a',
                width: '100%',
                maxWidth: '800px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '40px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px'
              }}>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: '600',
                  color: '#ffffff',
                  fontFamily: "'Playfair Display', serif"
                }}>
                  Adicionar Novo Produto
                </h2>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#888',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '4px 8px'
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitProduct}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '24px',
                  marginBottom: '24px'
                }}>
                  {/* Name */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#ffffff'
                    }}>
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #3a3a3a',
                        borderRadius: '8px',
                        fontSize: '16px',
                        color: '#ffffff',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                      onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
                    />
                  </div>

                  {/* Brand */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#ffffff'
                    }}>
                      Brand *
                    </label>
                    <input
                      type="text"
                      value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #3a3a3a',
                        borderRadius: '8px',
                        fontSize: '16px',
                        color: '#ffffff',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                      onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
                    />
                  </div>

                  {/* Model */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#ffffff'
                    }}>
                      Modelo
                    </label>
                    <input
                      type="text"
                      value={productForm.model}
                      onChange={(e) => setProductForm({ ...productForm, model: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #3a3a3a',
                        borderRadius: '8px',
                        fontSize: '16px',
                        color: '#ffffff',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                      onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#ffffff'
                    }}>
                      Preço (€) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #3a3a3a',
                        borderRadius: '8px',
                        fontSize: '16px',
                        color: '#ffffff',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                      onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#ffffff'
                    }}>
                      Stock
                    </label>
                    <input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #3a3a3a',
                        borderRadius: '8px',
                        fontSize: '16px',
                        color: '#ffffff',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                      onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
                    />
                  </div>

                  {/* Movement Type */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#ffffff'
                    }}>
                      Tipo de Movimento
                    </label>
                    <select
                      value={productForm.movement_type}
                      onChange={(e) => setProductForm({ ...productForm, movement_type: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #3a3a3a',
                        borderRadius: '8px',
                        fontSize: '16px',
                        color: '#ffffff',
                        outline: 'none',
                        boxSizing: 'border-box',
                        cursor: 'pointer'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                      onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
                    >
                      <option value="">Selecione...</option>
                      <option value="Quartzo">Quartzo</option>
                      <option value="Manual">Manual</option>
                      <option value="Automático">Automático</option>
                    </select>
                  </div>

                  {/* Case Material */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#ffffff'
                    }}>
                      Material da Caixa
                    </label>
                    <input
                      type="text"
                      value={productForm.case_material}
                      onChange={(e) => setProductForm({ ...productForm, case_material: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #3a3a3a',
                        borderRadius: '8px',
                        fontSize: '16px',
                        color: '#ffffff',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                      onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
                    />
                  </div>

                  {/* Strap Material */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#ffffff'
                    }}>
                      Material da Pulseira
                    </label>
                    <input
                      type="text"
                      value={productForm.strap_material}
                      onChange={(e) => setProductForm({ ...productForm, strap_material: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #3a3a3a',
                        borderRadius: '8px',
                        fontSize: '16px',
                        color: '#ffffff',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                      onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
                    />
                  </div>

                  {/* Case Diameter */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#ffffff'
                    }}>
                      Diâmetro da Caixa (mm)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.case_diameter}
                      onChange={(e) => setProductForm({ ...productForm, case_diameter: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #3a3a3a',
                        borderRadius: '8px',
                        fontSize: '16px',
                        color: '#ffffff',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                      onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
                    />
                  </div>

                  {/* Water Resistant */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#ffffff'
                    }}>
                      Resistente à Água
                    </label>
                    <input
                      type="text"
                      value={productForm.water_resistant}
                      onChange={(e) => setProductForm({ ...productForm, water_resistant: e.target.value })}
                      placeholder="Ex: 100m, 200m"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #3a3a3a',
                        borderRadius: '8px',
                        fontSize: '16px',
                        color: '#ffffff',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                      onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
                    />
                  </div>

                  {/* Image Upload */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#ffffff'
                    }}>
                      Imagem do Produto
                    </label>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}>
                      <label
                        htmlFor="image-upload"
                        style={{
                          padding: '12px 24px',
                          backgroundColor: '#1a1a1a',
                          border: '1px solid #3a3a3a',
                          borderRadius: '8px',
                          fontSize: '16px',
                          color: '#ffffff',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.2s',
                          display: 'inline-block'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.borderColor = '#d4af37'
                          e.target.style.backgroundColor = '#2a2a2a'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.borderColor = '#3a3a3a'
                          e.target.style.backgroundColor = '#1a1a1a'
                        }}
                      >
                        {selectedImage ? selectedImage.name : 'Escolher Imagem'}
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                      {imagePreview && (
                        <div style={{
                          width: '100%',
                          maxWidth: '400px',
                          margin: '0 auto'
                        }}>
                          <img
                            src={imagePreview}
                            alt="Preview"
                            style={{
                              width: '100%',
                              height: 'auto',
                              borderRadius: '8px',
                              border: '1px solid #3a3a3a'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedImage(null)
                              setImagePreview(null)
                              const fileInput = document.getElementById('image-upload')
                              if (fileInput) fileInput.value = ''
                            }}
                            style={{
                              marginTop: '12px',
                              padding: '8px 16px',
                              backgroundColor: 'transparent',
                              color: '#ff6b6b',
                              border: '1px solid #ff6b6b',
                              borderRadius: '6px',
                              fontSize: '14px',
                              cursor: 'pointer',
                              width: '100%'
                            }}
                          >
                            Remover Imagem
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#ffffff'
                    }}>
                      Descrição
                    </label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #3a3a3a',
                        borderRadius: '8px',
                        fontSize: '16px',
                        color: '#ffffff',
                        outline: 'none',
                        boxSizing: 'border-box',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                      onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  justifyContent: 'flex-end',
                  marginTop: '32px'
                }}>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: 'transparent',
                      color: '#ffffff',
                      border: '1px solid #3a3a3a',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: submitting ? '#3a3a3a' : '#d4af37',
                      color: submitting ? '#888' : '#1a1a1a',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      opacity: submitting ? 0.7 : 1
                    }}
                  >
                    {submitting ? 'A adicionar...' : 'Adicionar Produto'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <footer style={{
        backgroundColor: '#000000',
        padding: '80px',
        borderTop: '1px solid #1a1a1a'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '60px',
          marginBottom: '40px'
        }}>
          {/* Column 1: Branding */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
              <img 
                src={logo} 
                alt="KRONOS" 
                style={{
                  width: '30px',
                  height: '44px',
                  marginRight: '12px'
                }}
              />
              <span style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#d4af37',
                fontFamily: "'Playfair Display', serif"
              }}>
                KRONOS
              </span>
            </div>
            <p style={{
              fontSize: '14px',
              color: '#cccccc',
              lineHeight: '1.6',
              marginBottom: '24px'
            }}>
              A sua loja de relógios de luxo online. Qualidade, elegância e tradição desde 1985.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="#" style={{ color: '#cccccc', fontSize: '20px' }}>📷</a>
              <a href="#" style={{ color: '#cccccc', fontSize: '20px' }}>👤</a>
              <a href="#" style={{ color: '#cccccc', fontSize: '20px' }}>🐦</a>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '20px'
            }}>
              Navegação
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '12px' }}>
                <Link to="/" style={{ color: '#cccccc', textDecoration: 'none', fontSize: '14px' }}>Início</Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <Link to="/catalog" style={{ color: '#cccccc', textDecoration: 'none', fontSize: '14px' }}>Coleções</Link>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ color: '#cccccc', textDecoration: 'none', fontSize: '14px' }}>Novidades</a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ color: '#cccccc', textDecoration: 'none', fontSize: '14px' }}>Sobre Nós</a>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Support */}
          <div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '20px'
            }}>
              Apoio ao Cliente
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ color: '#cccccc', textDecoration: 'none', fontSize: '14px' }}>FAQ</a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ color: '#cccccc', textDecoration: 'none', fontSize: '14px' }}>Envios e Devoluções</a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ color: '#cccccc', textDecoration: 'none', fontSize: '14px' }}>Garantia</a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ color: '#cccccc', textDecoration: 'none', fontSize: '14px' }}>Contacto</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '20px'
            }}>
              Contacto
            </h4>
            <p style={{
              fontSize: '14px',
              color: '#cccccc',
              lineHeight: '1.8',
              margin: 0
            }}>
              Av. da Liberdade, 123<br />
              1250-096 Lisboa, Portugal<br />
              +351 21 000 00 00<br />
              info@kronos.pt
            </p>
          </div>
        </div>

        {/* Separator */}
        <div style={{
          height: '1px',
          backgroundColor: '#1a1a1a',
          marginBottom: '40px'
        }} />

        {/* Copyright */}
        <div style={{
          textAlign: 'center',
          fontSize: '14px',
          color: '#888'
        }}>
          © 2024 KRONOS. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}

export default Catalog
