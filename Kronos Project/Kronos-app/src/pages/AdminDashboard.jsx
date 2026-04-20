import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { api } from '../lib/api'

const logo = '/logo.png'

function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [fetching, setFetching] = useState(false)

  const moneyLabel = useMemo(() => {
    if (!data) return ''
    const n = Number.parseFloat(String(data.totalMoney ?? 0))
    const currency = data.currency || 'EUR'
    if (Number.isNaN(n)) return `0 ${currency}`
    return `${n.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
  }, [data])

  useEffect(() => {
    let mounted = true
    if (!user || !isAdmin) return

    ;(async () => {
      setError('')
      setFetching(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) throw new Error('Sessão expirada.')
        const res = await api.get('/admin/dashboard', session.access_token)
        if (!mounted) return
        setData(res)
      } catch (err) {
        if (!mounted) return
        setError(err.message || 'Não foi possível carregar o dashboard.')
      } finally {
        if (!mounted) return
        setFetching(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [user?.id, isAdmin])

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
        <p>Carregando...</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />
  if (!isAdmin) return <Navigate to="/home" replace />

  const cards = [
    {
      title: 'Total Sales',
      value: moneyLabel || '—',
      subtitle: 'Total acumulado',
      icon: <IconDollar />,
      accent: '#2dd4bf',
    },
    {
      title: 'Registered Users',
      value: fetching ? '—' : (data?.usersCount ?? '—'),
      subtitle: 'Utilizadores registados',
      icon: <IconUsers />,
      accent: '#22c55e',
    },
    {
      title: 'Products',
      value: fetching ? '—' : (data?.productsCount ?? '—'),
      subtitle: 'Produtos ativos',
      icon: <IconCube />,
      accent: '#a78bfa',
    },
    {
      title: 'Total Stock',
      value: fetching ? '—' : (data?.totalStock ?? '—'),
      subtitle: 'Unidades em inventário',
      icon: <IconLayers />,
      accent: '#60a5fa',
    },
    {
      title: 'Out of Stock',
      value: fetching ? '—' : (data?.outOfStockProducts ?? '—'),
      subtitle: 'Produtos indisponíveis',
      icon: <IconAlert />,
      accent: '#fb7185',
    },
    {
      title: 'Top Country',
      value: fetching ? '—' : (data?.topCountry ? `${data.topCountry}` : '—'),
      subtitle: fetching ? '—' : (data?.topCountry ? `${data.topCountryPurchases || 0} compras` : 'Sem compras'),
      icon: <IconGlobe />,
      accent: '#fbbf24',
    },
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

        <nav style={{ display: 'flex', gap: '24px' }}>
          <Link to="/catalog" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
            CATÁLOGO
          </Link>
          <Link to="/home" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
            HOME
          </Link>
        </nav>
      </header>

      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '34px 48px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'end', flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: 0, color: '#d4af37', letterSpacing: '3px', fontSize: '12px', fontWeight: '700' }}>
              ADMIN
            </p>
            <h1 style={{
              margin: '6px 0 0',
              fontSize: '44px',
              fontFamily: "'Playfair Display', serif",
              fontWeight: '600',
            }}>
              Dashboard
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link
              to="/catalog"
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #2a2a2a',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: '600',
              }}
            >
              Ver catálogo
            </Link>
          </div>
        </div>

        {error ? (
          <div style={{
            marginTop: '18px',
            padding: '14px 16px',
            borderRadius: '12px',
            border: '1px solid #4a2a2a',
            backgroundColor: 'rgba(255, 107, 107, 0.08)',
            color: '#ff6b6b',
          }}>
            {error}
          </div>
        ) : null}

        <section style={{
          marginTop: '22px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
        }}>
          {cards.map((c) => (
            <StatCard
              key={c.title}
              title={c.title}
              value={c.value}
              subtitle={c.subtitle}
              icon={c.icon}
              accent={c.accent}
              loading={fetching}
            />
          ))}
        </section>

        <section style={{
          marginTop: '18px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
        }}>
          <div style={{
            padding: '18px',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
            boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Best seller</h2>
              <MiniTrend />
            </div>
            <p style={{ margin: '12px 0 0', color: '#b0b0b0', lineHeight: 1.6 }}>
              {fetching ? 'A carregar…' : (
                data?.bestSeller?.name
                  ? `${data.bestSeller.name} — ${data.bestSeller.quantity} unidades`
                  : 'Sem vendas ainda.'
              )}
            </p>
          </div>

          <div style={{
            padding: '18px',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
            boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Notas</h2>
              <MiniTrend />
            </div>
            <p style={{ margin: '12px 0 0', color: '#b0b0b0', lineHeight: 1.6 }}>
              As métricas consideram apenas encomendas com estado <strong style={{ color: '#ffffff' }}>paid</strong>.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

function StatCard({ title, value, subtitle, icon, accent, loading }) {
  return (
    <div style={{
      padding: '18px 18px 16px',
      borderRadius: '18px',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
      boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
      minHeight: '118px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: '14px', fontWeight: '650' }}>
            {title}
          </div>
          <div style={{
            marginTop: '10px',
            fontSize: '30px',
            fontWeight: '900',
            color: '#ffffff',
            letterSpacing: '-0.4px',
          }}>
            {loading ? '—' : (value ?? '—')}
          </div>
        </div>

        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${accent}22`,
          border: `1px solid ${accent}40`,
          color: accent,
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>

      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
        <div style={{ color: 'rgba(255,255,255,0.62)', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {subtitle}
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#22c55e', fontSize: '13px', fontWeight: '700' }}>
          <MiniTrend />
          <span>Live</span>
        </div>
      </div>
    </div>
  )
}

function MiniTrend() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 16l6-6 4 4 6-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 6h4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconDollar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2v20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M17 6.5c0-2-2.2-3.5-5-3.5s-5 1.5-5 3.5S9.2 10 12 10s5 1.5 5 3.5S14.8 17 12 17s-5-1.5-5-3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z" stroke="currentColor" strokeWidth="2" />
      <path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconCube() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M3.3 7.2 12 12l8.7-4.8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconLayers() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2 2 7l10 5 10-5-10-5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

function IconAlert() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M10.3 3.2 1.7 18a2 2 0 0 0 1.7 3h17.2a2 2 0 0 0 1.7-3L13.7 3.2a2 2 0 0 0-3.4 0Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

function IconGlobe() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M2 12h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 2a15 15 0 0 1 0 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 2a15 15 0 0 0 0 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default AdminDashboard

