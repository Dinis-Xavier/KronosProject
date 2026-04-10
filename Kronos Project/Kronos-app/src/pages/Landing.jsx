import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const logo = '/logo.png'
const bannerImage = '/HomePageBanner.jpg'

function Landing() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#000000',
          color: '#ffffff',
        }}
      >
        <p>Carregando...</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/home" replace />
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.35,
          pointerEvents: 'none',
          background: `radial-gradient(ellipse 80% 60% at 50% 40%, rgba(212, 175, 55, 0.08), transparent 60%), linear-gradient(180deg, #0a0a0a 0%, #000000 100%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(520px, 85vw)',
          height: 'min(420px, 50vh)',
          pointerEvents: 'none',
          opacity: 0.45,
        }}
      >
        <img
          src={bannerImage}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: 'brightness(0.55)',
          }}
        />
      </div>

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
        }}
      >
        <img
          src={logo}
          alt="KRONOS"
          style={{
            width: '72px',
            height: 'auto',
            marginBottom: '28px',
            objectFit: 'contain',
          }}
        />
        <p
          style={{
            fontSize: '13px',
            letterSpacing: '3px',
            color: '#d4af37',
            marginBottom: '16px',
            fontWeight: '600',
          }}
        >
          RELOJOARIA DE LUXO
        </p>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: '600',
            lineHeight: 1.2,
            marginBottom: '16px',
            maxWidth: '520px',
          }}
        >
          <span style={{ color: '#ffffff' }}>KRONOS</span>
        </h1>
        <p
          style={{
            fontSize: '17px',
            color: 'hsl(45, 10%, 60%)',
            lineHeight: 1.65,
            maxWidth: '420px',
            marginBottom: '40px',
          }}
        >
          Entre na sua conta ou registe-se para explorar coleções exclusivas e ofertas reservadas a membros.
        </p>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            justifyContent: 'center',
          }}
        >
          <Link
            to="/login"
            style={{
              padding: '14px 36px',
              backgroundColor: 'transparent',
              color: '#ffffff',
              border: '2px solid #ffffff',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: '600',
              minWidth: '160px',
              textAlign: 'center',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.85'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            Entrar
          </Link>
          <Link
            to="/signup"
            style={{
              padding: '14px 36px',
              backgroundColor: '#d4af37',
              color: '#1a1a1a',
              border: '2px solid #d4af37',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: '600',
              minWidth: '160px',
              textAlign: 'center',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.92'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            Registo
          </Link>
        </div>
      </main>
    </div>
  )
}

export default Landing
