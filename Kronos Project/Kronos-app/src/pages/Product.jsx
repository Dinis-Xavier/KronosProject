import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

const logo = '/logo.png'

function Product() {
  const { user, signOut } = useAuth()
  const { id } = useParams()
  const location = useLocation()
  const [product, setProduct] = useState(location.state?.product || null)
  const [loading, setLoading] = useState(!location.state?.product)
  const [error, setError] = useState('')

  const handleLogout = async () => {
    await signOut()
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [id])

  useEffect(() => {
    const productFromState = location.state?.product
    if (productFromState && String(productFromState.id) === String(id)) {
      setProduct(productFromState)
      setLoading(false)
      setError('')
      return
    }

    let isMounted = true

    const fetchProduct = async () => {
      try {
        setLoading(true)
        const allProducts = await api.get('/products')
        const foundProduct = allProducts.find((item) => String(item.id) === String(id))

        if (!foundProduct) {
          throw new Error('Produto não encontrado')
        }

        if (isMounted) {
          setProduct(foundProduct)
          setError('')
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Erro ao carregar o produto')
          setProduct(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchProduct()

    return () => {
      isMounted = false
    }
  }, [id, location.state])

  const formatPrice = (value) => {
    const numeric = Number.parseFloat(value)
    if (Number.isNaN(numeric)) return '0'
    const hasDecimals = !Number.isInteger(numeric)
    return numeric.toLocaleString('pt-PT', {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0,
    })
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#ffffff',
      }}>
        <p>Carregando produto...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#ffffff',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <p>{error || 'Produto não encontrado'}</p>
        <Link to="/catalog" style={{ color: '#d4af37', textDecoration: 'none' }}>
          Voltar ao Catálogo
        </Link>
      </div>
    )
  }

  const collectionName = product.brand ? product.brand.toUpperCase() : 'KRONOS'
  const specs = [
    ['Movimento', product.movement_type || '-'],
    ['Caixa', product.case_material || '-'],
    ['Diâmetro', product.case_diameter || '-'],
    ['Resistência', product.water_resistant || '-'],
    ['Pulseira', product.strap_material || '-'],
    ['Modelo', product.model || '-'],
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#ffffff' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 80px',
        backgroundColor: 'rgba(0, 0, 0, 0.92)',
        borderBottom: '1px solid #1a1a1a',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(10px)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img
            src={logo}
            alt="KRONOS"
            style={{
              width: '30px',
              height: '44px',
              marginRight: '12px',
            }}
          />
          <span style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#d4af37',
            fontFamily: "'Playfair Display', serif",
          }}>
            KRONOS
          </span>
        </Link>

        <nav style={{ display: 'flex', gap: '40px' }}>
          <Link to="/catalog" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>COLEÇÕES</Link>
          <a href="#" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>NOVIDADES</a>
          <a href="#" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>SOBRE</a>
          <a href="#" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>CONTACTO</a>
        </nav>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {user ? (
            <>
              <div
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
                }}
                aria-label="Utilizador"
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
                  flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5Z" stroke="#d4af37" strokeWidth="2" />
                    <path d="M20 22a8 8 0 1 0-16 0" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {user.user_metadata?.name || user.email}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'transparent',
                  color: 'hsl(45, 10%, 60%)',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
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
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: '1px solid #ffffff',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                ENTRAR
              </Link>
              <Link
                to="/signup"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#d4af37',
                  color: '#1a1a1a',
                  border: 'none',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                Criar Conta
              </Link>
            </>
          )}
        </div>
      </header>

      <main style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px 48px 80px' }}>
        <Link
          to="/catalog"
          style={{
            color: '#9a9a9a',
            textDecoration: 'none',
            fontSize: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '22px',
          }}
        >
          <span style={{ fontSize: '18px' }}>‹</span>
          Voltar ao Catálogo
        </Link>

        <section style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '48px',
          alignItems: 'start',
        }}>
          <div>
            <div style={{
              width: '100%',
              height: '620px',
              borderRadius: '8px',
              border: '1px solid #1a1a1a',
              overflow: 'hidden',
              backgroundColor: '#080808',
            }}>
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666666',
                }}>
                  Sem imagem
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                style={{
                  width: '62px',
                  height: '62px',
                  borderRadius: '8px',
                  border: '2px solid #d4af37',
                  backgroundColor: '#0a0a0a',
                  padding: '0',
                  overflow: 'hidden',
                }}
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={`${product.name} miniatura`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : null}
              </button>
            </div>
          </div>

          <div style={{ paddingTop: '8px' }}>
            <p style={{
              margin: '0 0 14px',
              color: '#d4af37',
              fontSize: '14px',
              letterSpacing: '6px',
              textTransform: 'uppercase',
              fontWeight: '600',
            }}>
              Coleção {collectionName}
            </p>

            <h1 style={{
              margin: '0 0 14px',
              fontSize: '56px',
              fontFamily: "'Playfair Display', serif",
              fontWeight: '600',
              lineHeight: '1.1',
            }}>
              {product.name}
            </h1>

            <p style={{
              margin: '0 0 16px',
              color: '#d4af37',
              fontSize: '14px',
            }}>
             {/* ★★★★☆ 4.9 (127 avaliações) */}
            </p>

            <p style={{
              margin: '0 0 24px',
              fontSize: '46px',
              fontWeight: '700',
            }}>
              €{formatPrice(product.price)}
            </p>

            <p style={{
              margin: '0 0 28px',
              color: '#b0b0b0',
              fontSize: '20px',
              lineHeight: '1.6',
              maxWidth: '640px',
            }}>
              {product.description || 'Relógio premium com acabamentos de luxo e construção de alta precisão.'}
            </p>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
              <button
                type="button"
                style={{
                  flex: 1,
                  height: '56px',
                  backgroundColor: '#d4af37',
                  color: '#111111',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Adicionar ao Carrinho
              </button>

              <button
                type="button"
                style={{
                  width: '72px',
                  height: '56px',
                  backgroundColor: 'transparent',
                  color: '#d0d0d0',
                  border: '1px solid #2a2a2a',
                  borderRadius: '6px',
                  fontSize: '24px',
                  cursor: 'pointer',
                }}
                aria-label="Adicionar aos favoritos"
              >
                ♡
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              borderTop: '1px solid #1f1f1f',
              borderBottom: '1px solid #1f1f1f',
              padding: '16px 0',
              color: '#a8a8a8',
              fontSize: '14px',
              marginBottom: '28px',
            }}>
              <div>📦 Envio Grátis</div>
              <div>🛡️ Garantia 5 Anos</div>
              <div>↻ Devolução 30 Dias</div>
            </div>

            <h2 style={{
              margin: '0 0 12px',
              fontSize: '36px',
              fontFamily: "'Playfair Display', serif",
              fontWeight: '600',
            }}>
              Especificações
            </h2>

            <div>
              {specs.map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '20px',
                    padding: '14px 4px',
                    borderBottom: '1px solid #1a1a1a',
                    color: '#b6b6b6',
                    fontSize: '18px',
                  }}
                >
                  <span>{label}</span>
                  <span style={{ color: '#ffffff' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer style={{
        backgroundColor: '#000000',
        padding: '64px 80px',
        borderTop: '1px solid #1a1a1a',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '40px',
          marginBottom: '28px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <img
                src={logo}
                alt="KRONOS"
                style={{
                  width: '30px',
                  height: '44px',
                  marginRight: '12px',
                }}
              />
              <span style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#d4af37',
                fontFamily: "'Playfair Display', serif",
              }}>
                KRONOS
              </span>
            </div>
            <p style={{ color: '#bcbcbc', lineHeight: '1.6', fontSize: '14px' }}>
              A sua loja de relógios de luxo online. Qualidade, elegância e tradição.
            </p>
          </div>

          <div>
            <h4 style={{ margin: '0 0 14px', color: '#ffffff' }}>Navegação</h4>
            <div style={{ display: 'grid', gap: '10px' }}>
              <Link to="/" style={{ color: '#cccccc', textDecoration: 'none', fontSize: '14px' }}>Início</Link>
              <Link to="/catalog" style={{ color: '#cccccc', textDecoration: 'none', fontSize: '14px' }}>Coleções</Link>
              <a href="#" style={{ color: '#cccccc', textDecoration: 'none', fontSize: '14px' }}>Novidades</a>
              <a href="#" style={{ color: '#cccccc', textDecoration: 'none', fontSize: '14px' }}>Sobre Nós</a>
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 14px', color: '#ffffff' }}>Apoio ao Cliente</h4>
            <div style={{ display: 'grid', gap: '10px' }}>
              <a href="#" style={{ color: '#cccccc', textDecoration: 'none', fontSize: '14px' }}>FAQ</a>
              <a href="#" style={{ color: '#cccccc', textDecoration: 'none', fontSize: '14px' }}>Envios e Devoluções</a>
              <a href="#" style={{ color: '#cccccc', textDecoration: 'none', fontSize: '14px' }}>Garantia</a>
              <a href="#" style={{ color: '#cccccc', textDecoration: 'none', fontSize: '14px' }}>Contacto</a>
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 14px', color: '#ffffff' }}>Contacto</h4>
            <p style={{ margin: 0, color: '#cccccc', lineHeight: '1.8', fontSize: '14px' }}>
              Av. da Liberdade, 123<br />
              1250-096 Lisboa, Portugal<br />
              +351 21 000 00 00<br />
              info@kronos.pt
            </p>
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: '#1a1a1a', marginBottom: '22px' }} />
        <div style={{ textAlign: 'center', color: '#888888', fontSize: '14px' }}>
          © 2024 KRONOS. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}

export default Product
