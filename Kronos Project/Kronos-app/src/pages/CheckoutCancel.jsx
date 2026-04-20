import { Link } from 'react-router-dom'

const logo = '/logo.png'

function CheckoutCancel() {
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
          border: '1px solid #1a1a1a',
          borderRadius: '14px',
          backgroundColor: '#0a0a0a',
          padding: '28px',
        }}>
          <h1 style={{
            margin: '0 0 10px',
            fontSize: '34px',
            fontFamily: "'Playfair Display', serif",
            fontWeight: '600',
          }}>
            Pagamento cancelado
          </h1>
          <p style={{ margin: '0 0 18px', color: '#b0b0b0', lineHeight: 1.6 }}>
            O pagamento foi cancelado no PayPal. Se quiser, pode voltar ao checkout e tentar novamente.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              to="/catalog"
              style={{
                padding: '12px 18px',
                borderRadius: '10px',
                border: '1px solid #2a2a2a',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: '600',
              }}
            >
              Voltar ao catálogo
            </Link>
            <Link
              to="/home"
              style={{
                padding: '12px 18px',
                borderRadius: '10px',
                backgroundColor: '#d4af37',
                color: '#111111',
                textDecoration: 'none',
                fontWeight: '800',
              }}
            >
              Ir para início
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CheckoutCancel

