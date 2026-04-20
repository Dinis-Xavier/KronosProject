import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { api } from '../lib/api'

const logo = '/logo.png'

function CheckoutReturn() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [state, setState] = useState({ status: 'loading', message: '', orderId: null })

  const title = useMemo(() => {
    if (state.status === 'ok') return 'Pagamento confirmado'
    if (state.status === 'error') return 'Não foi possível confirmar o pagamento'
    return 'A confirmar pagamento...'
  }, [state.status])

  useEffect(() => {
    let mounted = true

    if (!token) {
      setState({ status: 'error', message: 'Faltam parâmetros do PayPal (token).', orderId: null })
      return
    }

    ;(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) {
          navigate('/login', { state: { from: `/checkout/return?token=${encodeURIComponent(token)}` }, replace: false })
          return
        }

        const result = await api.post('/paypal/capture-order', { paypalOrderId: token }, session.access_token)
        if (!mounted) return
        setState({
          status: 'ok',
          message: 'Pagamento concluído com sucesso. Obrigado pela sua compra.',
          orderId: result.orderId || null,
        })
      } catch (err) {
        if (!mounted) return
        setState({ status: 'error', message: err.message || 'Erro ao confirmar pagamento.', orderId: null })
      }
    })()

    return () => {
      mounted = false
    }
  }, [token, navigate])

  const statusAccent = state.status === 'ok' ? '#22c55e' : state.status === 'error' ? '#ff6b6b' : '#60a5fa'

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
          <img src={logo} alt="KRONOS" style={{ width: '30px', height: '44px', marginRight: '12px' }} />
          <span style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#d4af37',
            fontFamily: "'Playfair Display', serif",
          }}>
            KRONOS
          </span>
        </Link>
        <Link to="/catalog" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
          COLEÇÕES
        </Link>
      </header>

      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '56px 48px 80px' }}>
        <div style={{
          borderRadius: '18px',
          border: '1px solid rgba(255,255,255,0.10)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
          boxShadow: '0 30px 70px rgba(0,0,0,0.60)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '16px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ minWidth: 0 }}>
              <p style={{
                margin: 0,
                fontSize: '12px',
                letterSpacing: '3px',
                fontWeight: '800',
                color: 'rgba(255,255,255,0.70)',
              }}>
                CHECKOUT
              </p>
              <h1 style={{
                margin: '6px 0 0',
                fontSize: '34px',
                fontFamily: "'Playfair Display', serif",
                fontWeight: '650',
              }}>
                {title}
              </h1>
            </div>

            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${statusAccent}22`,
              border: `1px solid ${statusAccent}40`,
              color: statusAccent,
              flexShrink: 0,
            }}>
              {state.status === 'ok' ? <IconCheck /> : state.status === 'error' ? <IconX /> : <Spinner />}
            </div>
          </div>

          <div style={{ padding: '22px' }}>
            <p style={{
              margin: 0,
              color: state.status === 'ok' ? '#aefcc2' : state.status === 'error' ? '#ffb4b4' : 'rgba(255,255,255,0.70)',
              lineHeight: 1.7,
              fontSize: '15px',
            }}>
              {state.status === 'loading' ? 'A confirmar o pagamento com o PayPal. Isto pode demorar alguns segundos…' : (state.message || '')}
            </p>

            {state.orderId ? (
              <div style={{
                marginTop: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.10)',
                backgroundColor: 'rgba(0,0,0,0.25)',
                color: 'rgba(255,255,255,0.85)',
                fontSize: '13px',
                fontWeight: '650',
              }}>
                <span style={{ color: '#d4af37', fontWeight: '900' }}>Order</span>
                <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
                  {state.orderId}
                </span>
              </div>
            ) : null}

            <div style={{
              marginTop: '22px',
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}>
              <Link
                to="/catalog"
                style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: '800',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                }}
              >
                Voltar ao catálogo
              </Link>
              <Link
                to="/home"
                style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  backgroundColor: '#d4af37',
                  color: '#111111',
                  textDecoration: 'none',
                  fontWeight: '900',
                }}
              >
                Ir para início
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function IconCheck() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconX() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6 6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M6 6 18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2a10 10 0 1 0 10 10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.35"
      />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default CheckoutReturn


