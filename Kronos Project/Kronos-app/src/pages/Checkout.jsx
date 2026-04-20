import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { supabase } from '../lib/supabase'
import { toAddressString } from '../lib/address'

const logo = '/logo.png'

function Checkout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()

  const [product, setProduct] = useState(location.state?.product || null)
  const [loading, setLoading] = useState(!location.state?.product)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    country: 'PT',
  })

  const [payLoading, setPayLoading] = useState(false)
  const [payError, setPayError] = useState('')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [id])

  useEffect(() => {
    let mounted = true

    if (location.state?.product && String(location.state.product.id) === String(id)) {
      setProduct(location.state.product)
      setLoading(false)
      setError('')
      return
    }

    ;(async () => {
      try {
        setLoading(true)
        const fresh = await api.get(`/products/${encodeURIComponent(id)}`)
        if (!mounted) return
        setProduct(fresh)
        setError('')
      } catch (err) {
        if (!mounted) return
        setError(err.message || 'Não foi possível carregar o produto.')
        setProduct(null)
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [id, location.state])

  const formattedPrice = useMemo(() => {
    const numeric = Number.parseFloat(product?.price ?? 0)
    if (Number.isNaN(numeric)) return '0'
    const hasDecimals = !Number.isInteger(numeric)
    return numeric.toLocaleString('pt-PT', {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0,
    })
  }, [product?.price])

  const handleSubmit = (e) => {
    e.preventDefault()
  }

  const handlePay = async () => {
    setPayError('')
    const address = toAddressString(form)
    if (!address.trim()) {
      setPayError('Preencha a morada antes de pagar.')
      return
    }

    setPayLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        navigate('/login', { state: { from: `/checkout/${encodeURIComponent(id)}` }, replace: false })
        return
      }

      const result = await api.post(
        '/paypal/create-order',
        { productId: id, address },
        session.access_token,
      )

      if (!result?.approveUrl) {
        throw new Error('O PayPal não devolveu um link de checkout.')
      }

      window.location.href = result.approveUrl
    } catch (err) {
      setPayError(err.message || 'Não foi possível iniciar o pagamento.')
    } finally {
      setPayLoading(false)
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
        color: '#ffffff',
      }}>
        <p>A preparar checkout...</p>
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
            style={{ width: '30px', height: '44px', marginRight: '12px' }}
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
        </nav>

        <button
          type="button"
          onClick={() => navigate(-1)}
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
          Voltar
        </button>
      </header>

      <main style={{ maxWidth: '1160px', margin: '0 auto', padding: '36px 48px 80px' }}>
        <Link
          to={`/catalog/${product.id}`}
          state={{ product }}
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
          Voltar ao produto
        </Link>

        <section style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: '28px',
          alignItems: 'start',
        }}>
          <div style={{
            padding: '28px',
            border: '1px solid #1a1a1a',
            borderRadius: '12px',
            backgroundColor: '#0a0a0a',
          }}>
            <h1 style={{
              margin: '0 0 8px',
              fontSize: '34px',
              fontFamily: "'Playfair Display', serif",
              fontWeight: '600',
            }}>
              Checkout
            </h1>
            <p style={{ margin: '0 0 22px', color: '#b0b0b0' }}>
              Indique a sua morada de entrega para concluir a compra.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
              <div style={{ display: 'grid', gap: '8px' }}>
                <label htmlFor="fullName" style={{ fontSize: '14px', color: '#d0d0d0' }}>Nome completo</label>
                <input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                  placeholder="Ex: João Silva"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    backgroundColor: '#121212',
                    border: '1px solid #2a2a2a',
                    borderRadius: '10px',
                    fontSize: '16px',
                    color: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gap: '8px' }}>
                <label htmlFor="addressLine1" style={{ fontSize: '14px', color: '#d0d0d0' }}>Morada</label>
                <input
                  id="addressLine1"
                  value={form.addressLine1}
                  onChange={(e) => setForm((p) => ({ ...p, addressLine1: e.target.value }))}
                  placeholder="Rua / Avenida, nº, andar"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    backgroundColor: '#121212',
                    border: '1px solid #2a2a2a',
                    borderRadius: '10px',
                    fontSize: '16px',
                    color: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gap: '8px' }}>
                <label htmlFor="addressLine2" style={{ fontSize: '14px', color: '#d0d0d0' }}>Complemento (opcional)</label>
                <input
                  id="addressLine2"
                  value={form.addressLine2}
                  onChange={(e) => setForm((p) => ({ ...p, addressLine2: e.target.value }))}
                  placeholder="Apartamento, bloco, referência"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    backgroundColor: '#121212',
                    border: '1px solid #2a2a2a',
                    borderRadius: '10px',
                    fontSize: '16px',
                    color: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.55fr', gap: '12px' }}>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <label htmlFor="city" style={{ fontSize: '14px', color: '#d0d0d0' }}>Cidade</label>
                  <input
                    id="city"
                    value={form.city}
                    onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                    placeholder="Lisboa"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      backgroundColor: '#121212',
                      border: '1px solid #2a2a2a',
                      borderRadius: '10px',
                      fontSize: '16px',
                      color: '#ffffff',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <label htmlFor="postalCode" style={{ fontSize: '14px', color: '#d0d0d0' }}>Código‑postal</label>
                  <input
                    id="postalCode"
                    value={form.postalCode}
                    onChange={(e) => setForm((p) => ({ ...p, postalCode: e.target.value }))}
                    placeholder="1000-000"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      backgroundColor: '#121212',
                      border: '1px solid #2a2a2a',
                      borderRadius: '10px',
                      fontSize: '16px',
                      color: '#ffffff',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gap: '8px' }}>
                <label htmlFor="country" style={{ fontSize: '14px', color: '#d0d0d0' }}>País</label>
                <select
                  id="country"
                  value={form.country}
                  onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    backgroundColor: '#121212',
                    border: '1px solid #2a2a2a',
                    borderRadius: '10px',
                    fontSize: '16px',
                    color: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                  }}
                >
                  <option value="PT">Portugal</option>
                  <option value="ES">Espanha</option>
                  <option value="FR">França</option>
                  <option value="DE">Alemanha</option>
                </select>
              </div>

              {payError ? (
                <p style={{ margin: '4px 0 0', color: '#ff6b6b', fontSize: '14px' }}>{payError}</p>
              ) : null}

              <button
                type="button"
                onClick={handlePay}
                disabled={payLoading}
                style={{
                  marginTop: '6px',
                  height: '54px',
                  backgroundColor: payLoading ? '#3a3a3a' : '#d4af37',
                  color: payLoading ? '#999999' : '#111111',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '800',
                  cursor: payLoading ? 'wait' : 'pointer',
                }}
              >
                {payLoading ? 'A redirecionar…' : 'Pagar com PayPal'}
              </button>
            </form>
          </div>

          <aside style={{
            padding: '22px',
            border: '1px solid #1a1a1a',
            borderRadius: '12px',
            backgroundColor: 'rgba(255,255,255,0.02)',
          }}>
            <h2 style={{
              margin: '0 0 14px',
              fontSize: '18px',
              fontWeight: '700',
              color: '#ffffff',
            }}>
              Resumo
            </h2>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{
                width: '86px',
                height: '86px',
                borderRadius: '10px',
                overflow: 'hidden',
                backgroundColor: '#0b0b0b',
                border: '1px solid #1a1a1a',
                flexShrink: 0,
              }}>
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : null}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontWeight: '700',
                  color: '#ffffff',
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {product.name}
                </div>
                <div style={{ color: '#a8a8a8', fontSize: '13px', marginTop: '4px' }}>
                  {product.brand ? `Coleção ${product.brand}` : 'KRONOS'}
                </div>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: '#1a1a1a', margin: '18px 0' }} />

            <div style={{ display: 'grid', gap: '10px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cccccc' }}>
                <span>Produto</span>
                <span>€{formattedPrice}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9a9a9a' }}>
                <span>Envio</span>
                <span>Grátis</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ffffff', fontWeight: '800', fontSize: '16px' }}>
                <span>Total</span>
                <span>€{formattedPrice}</span>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}

export default Checkout

