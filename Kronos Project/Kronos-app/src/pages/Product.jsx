import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const logo = '/logo.png'

function HeartWithSlashIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s-7-4.35-7-10a4 4 0 0 1 6.5-3 4 4 0 0 1 7 3c0 5.65-7 10-7 10z"
        stroke="#d4af37"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="rgba(212,175,55,0.12)"
      />
      <line x1="5" y1="5" x2="19" y2="19" stroke="#e8e8e8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function Product() {
  const { user, signOut, isAdmin } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [product, setProduct] = useState(location.state?.product || null)
  const [loading, setLoading] = useState(!location.state?.product)
  const [error, setError] = useState('')
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false)
  const [removeLoading, setRemoveLoading] = useState(false)
  const [removeError, setRemoveError] = useState('')
  const [stockDraft, setStockDraft] = useState('')
  const [stockSaving, setStockSaving] = useState(false)
  const [stockMessage, setStockMessage] = useState({ type: '', text: '' })
  const [favorited, setFavorited] = useState(null)
  const [favoriteSubmitting, setFavoriteSubmitting] = useState(false)

  const handleLogout = async () => {
    await signOut()
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [id])

  useEffect(() => {
    let isMounted = true
    const fromState = location.state?.product
    const stateMatches = fromState && String(fromState.id) === String(id)

    if (stateMatches) {
      setProduct(fromState)
      setLoading(false)
      setError('')
    } else {
      setLoading(true)
    }

    const fetchProduct = async () => {
      try {
        const fresh = await api.get(`/products/${encodeURIComponent(id)}`)
        if (isMounted) {
          setProduct(fresh)
          setError('')
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Erro ao carregar o produto')
          if (!stateMatches) {
            setProduct(null)
          }
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

  useEffect(() => {
    if (product) {
      setStockDraft(String(product.stock ?? 0))
    }
  }, [product?.id, product?.stock])

  useEffect(() => {
    setStockMessage({ type: '', text: '' })
  }, [product?.id])

  useEffect(() => {
    if (!user || isAdmin || !id) {
      setFavorited(null)
      return
    }
    setFavorited(null)
    let cancelled = false
    ;(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) {
          if (!cancelled) setFavorited(false)
          return
        }
        const data = await api.get(
          `/favorites/check/${encodeURIComponent(id)}`,
          session.access_token,
        )
        if (!cancelled) setFavorited(!!data.favorited)
      } catch {
        if (!cancelled) setFavorited(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user?.id, isAdmin, id])

  const handleAddFavorite = async () => {
    if (!user || isAdmin) return
    setFavoriteSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        navigate('/login', { state: { from: location.pathname }, replace: false })
        return
      }
      await api.post('/favorites', { productId: id }, session.access_token)
      setFavorited(true)
    } catch {
      // Se já existir ou falhar rede, tentar rever estado com check
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
          const data = await api.get(
            `/favorites/check/${encodeURIComponent(id)}`,
            session.access_token,
          )
          if (data.favorited) setFavorited(true)
        }
      } catch {
        /* ignore */
      }
    } finally {
      setFavoriteSubmitting(false)
    }
  }

  const handleRemoveFavorite = async () => {
    if (!user || isAdmin) return
    setFavoriteSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        navigate('/login', { state: { from: location.pathname }, replace: false })
        return
      }
      await api.del(`/favorites/${encodeURIComponent(id)}`, session.access_token)
      setFavorited(false)
    } catch {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
          const data = await api.get(
            `/favorites/check/${encodeURIComponent(id)}`,
            session.access_token,
          )
          setFavorited(!!data.favorited)
        }
      } catch {
        /* ignore */
      }
    } finally {
      setFavoriteSubmitting(false)
    }
  }

  const handleSaveStock = async () => {
    setStockMessage({ type: '', text: '' })
    const parsed = Number.parseInt(String(stockDraft).trim(), 10)
    if (Number.isNaN(parsed) || parsed < 0) {
      setStockMessage({ type: 'error', text: 'Indique um número inteiro ≥ 0.' })
      return
    }
    setStockSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Sessão expirada. Volte a entrar.')
      }
      const updated = await api.patch(`/products/${id}`, { stock: parsed }, session.access_token)
      setProduct((prev) => (prev ? { ...prev, stock: updated.stock } : prev))
      setStockDraft(String(updated.stock ?? parsed))
      setStockMessage({ type: 'ok', text: 'Stock atualizado.' })
    } catch (err) {
      setStockMessage({ type: 'error', text: err.message || 'Não foi possível guardar o stock.' })
    } finally {
      setStockSaving(false)
    }
  }

  const handleConfirmRemove = async () => {
    setRemoveError('')
    setRemoveLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Sessão expirada. Volte a entrar.')
      }
      await api.del(`/products/${id}`, session.access_token)
      setConfirmRemoveOpen(false)
      navigate('/catalog', { replace: true })
    } catch (err) {
      setRemoveError(err.message || 'Não foi possível remover o produto')
    } finally {
      setRemoveLoading(false)
    }
  }

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
        <Link to="/home" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
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
                Checkout
              </button>

              {user && !isAdmin && favorited !== null ? (
                <button
                  type="button"
                  onClick={favorited ? handleRemoveFavorite : handleAddFavorite}
                  disabled={favoriteSubmitting}
                  style={{
                    width: '72px',
                    height: '56px',
                    backgroundColor: 'transparent',
                    color: favoriteSubmitting ? '#555' : '#d0d0d0',
                    border: '1px solid #2a2a2a',
                    borderRadius: '6px',
                    fontSize: '24px',
                    cursor: favoriteSubmitting ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                >
                  {favorited ? <HeartWithSlashIcon /> : '♡'}
                </button>
              ) : null}
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

        {isAdmin && (
          <div style={{
            marginTop: '48px',
            paddingTop: '32px',
            borderTop: '1px solid #1a1a1a',
            maxWidth: '520px',
            display: 'flex',
            flexDirection: 'column',
            gap: '28px',
          }}>
            <div>
              <h3 style={{
                margin: '0 0 14px',
                fontSize: '18px',
                fontWeight: '600',
                color: '#d4af37',
                fontFamily: "'Playfair Display', serif",
              }}>
                Stock (admin)
              </h3>
              <p style={{ margin: '0 0 12px', color: '#8a8a8a', fontSize: '14px' }}>
                Stock atual na loja:{' '}
                <strong style={{ color: '#ffffff' }}>{product.stock ?? 0}</strong> unidades
              </p>
              <label htmlFor="admin-stock" style={{ display: 'block', marginBottom: '8px', color: '#b0b0b0', fontSize: '14px' }}>
                Alterar stock
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                <input
                  id="admin-stock"
                  type="number"
                  min={0}
                  step={1}
                  value={stockDraft}
                  onChange={(e) => setStockDraft(e.target.value)}
                  disabled={stockSaving}
                  style={{
                    width: '120px',
                    padding: '12px 14px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #3a3a3a',
                    borderRadius: '8px',
                    fontSize: '16px',
                    color: '#ffffff',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  disabled={stockSaving}
                  onClick={handleSaveStock}
                  style={{
                    padding: '12px 22px',
                    backgroundColor: stockSaving ? '#3a3a3a' : '#d4af37',
                    color: stockSaving ? '#888' : '#1a1a1a',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: stockSaving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {stockSaving ? 'A guardar…' : 'Guardar stock'}
                </button>
              </div>
              {stockMessage.text ? (
                <p style={{
                  margin: '12px 0 0',
                  fontSize: '14px',
                  color: stockMessage.type === 'ok' ? '#6bff6b' : '#ff6b6b',
                }}>
                  {stockMessage.text}
                </p>
              ) : null}
            </div>

            <div>
              <button
                type="button"
                onClick={() => {
                  setRemoveError('')
                  setConfirmRemoveOpen(true)
                }}
                style={{
                  padding: '14px 28px',
                  backgroundColor: 'transparent',
                  color: '#ff6b6b',
                  border: '1px solid #5a2f2f',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Remover produto
              </button>
            </div>
          </div>
        )}
      </main>

      {confirmRemoveOpen && (
        <>
          <div
            role="presentation"
            onClick={() => !removeLoading && setConfirmRemoveOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.65)',
              zIndex: 200,
            }}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-remove-title"
            style={{
              position: 'fixed',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 201,
              width: 'min(420px, calc(100vw - 32px))',
              padding: '28px',
              backgroundColor: '#121212',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
            }}
          >
            <h2
              id="confirm-remove-title"
              style={{
                margin: '0 0 12px',
                fontSize: '20px',
                fontWeight: '600',
                color: '#ffffff',
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Confirmar remoção
            </h2>
            <p style={{ margin: '0 0 20px', color: '#b0b0b0', fontSize: '15px', lineHeight: 1.5 }}>
              Tem a certeza que deseja remover este produto? Esta ação não pode ser desfeita.
            </p>
            {removeError ? (
              <p style={{ margin: '0 0 16px', color: '#ff6b6b', fontSize: '14px' }}>{removeError}</p>
            ) : null}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                disabled={removeLoading}
                onClick={() => setConfirmRemoveOpen(false)}
                style={{
                  padding: '12px 20px',
                  backgroundColor: 'transparent',
                  color: '#cccccc',
                  border: '1px solid #3a3a3a',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: removeLoading ? 'not-allowed' : 'pointer',
                }}
              >
                Não
              </button>
              <button
                type="button"
                disabled={removeLoading}
                onClick={handleConfirmRemove}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#5a2020',
                  color: '#ffffff',
                  border: '1px solid #7a3030',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: removeLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {removeLoading ? 'A remover…' : 'Sim, remover'}
              </button>
            </div>
          </div>
        </>
      )}

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
              <Link to="/home" style={{ color: '#cccccc', textDecoration: 'none', fontSize: '14px' }}>Início</Link>
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
