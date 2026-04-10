import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const logo = '/logo.png'
const bannerImage = '/HomePageBanner.jpg'
const stroryImage = 'LandingPageStory.png'

const gold = '#d4af37'
const goldMuted = '#c59d3f'

const sectionShell = {
  maxWidth: '1440px',
  margin: '0 auto',
  width: '100%',
  padding: 'clamp(24px, 5vw, 80px)',
  paddingTop: 'clamp(48px, 8vw, 96px)',
  paddingBottom: 'clamp(48px, 8vw, 96px)',
}

const borderCard = {
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '24px',
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
}

const testimonials = [
  {
    quote:
      'A curadoria Kronos superou as expetativas. Encontrámos exatamente a peça que procurávamos, com acompanhamento impecável.',
    author: 'Sara Mendes',
    company: 'Diretora, Lx Ventures',
  },
  {
    quote:
      'Transparência, autenticidade e um serviço que faz jus ao relógio. Recomendo a qualquer colecionador exigente.',
    author: 'Miguel Costa',
    company: 'Consultor, MC Advisory',
  },
  {
    quote:
      'Desde a primeira visita sentimos confiança. A equipa domina o detalhe técnico sem perder a elegância da experiência.',
    author: 'Inês Rodrigues',
    company: 'Product Lead, NovaGrid',
  },
  {
    quote:
      'Do pedido à entrega, tudo foi claro e profissional. Um parceiro de confiança para peças de alta relojoaria.',
    author: 'David Ferreira',
    company: 'Fundador, Atlas Studio',
  },
]

function StarRow() {
  return (
    <div style={{ display: 'flex', gap: '2px' }} aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={gold}>
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  )
}

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
          backgroundColor: '#0a0a0a',
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
        backgroundColor: '#0a0a0a',
        backgroundImage:
          'radial-gradient(ellipse 70% 45% at 85% 15%, rgba(212, 175, 55, 0.08), transparent 55%), linear-gradient(180deg, #0a0a0a 0%, #050505 45%, #050505 100%)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <header
        style={{
          position: 'relative',
          zIndex: 2,
          padding: '24px clamp(24px, 5vw, 80px)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <img src={logo} alt="KRONOS" style={{ width: '56px', height: 'auto', objectFit: 'contain' }} />
      </header>

      <main style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Hero */}
        <section
          className="landing-hero-main"
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'clamp(24px, 4vw, 64px)',
            padding: '0 clamp(24px, 5vw, 80px) clamp(48px, 8vh, 80px)',
            maxWidth: '1440px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          <div
            style={{
              flex: '1 1 48%',
              minWidth: 0,
              maxWidth: '560px',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '999px',
                border: `1px solid ${gold}`,
                color: gold,
                fontFamily: "'Inter', sans-serif",
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.04em',
                marginBottom: '28px',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={gold} aria-hidden>
                <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6L12 2z" />
              </svg>
              Coleção Exclusiva 2026
            </div>

            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
                fontWeight: 600,
                lineHeight: 1.12,
                marginBottom: '24px',
              }}
            >
              <span style={{ color: '#ffffff', display: 'block' }}>O Tempo é o</span>
              <span style={{ color: goldMuted, display: 'block' }}>Verdadeiro Luxo</span>
            </h1>

            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 'clamp(15px, 1.9vw, 17px)',
                color: 'rgba(255, 255, 255, 0.72)',
                lineHeight: 1.7,
                maxWidth: '480px',
                marginBottom: '36px',
              }}
            >
              Descubra a nossa curadoria de relógios que definem gerações. Crie a sua conta e aceda a peças
              exclusivas.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
              <Link
                to="/signup"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 28px',
                  backgroundColor: gold,
                  color: '#1a1a1a',
                  border: `2px solid ${gold}`,
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '15px',
                  fontWeight: 700,
                  transition: 'opacity 0.2s, transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.95'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Começar Agora
                <span aria-hidden>›</span>
              </Link>
              <Link
                to="/login"
                style={{
                  padding: '14px 28px',
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.45)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  transition: 'border-color 0.2s, background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.75)'
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.45)'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                JÁ TENHO CONTA
              </Link>
            </div>
          </div>

          <div
            className="landing-hero-image-wrap"
            style={{
              flex: '1 1 44%',
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              position: 'relative',
              alignSelf: 'stretch',
            }}
            aria-hidden
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 'min(520px, 42vw)',
                height: 'min(520px, 58vh)',
                minHeight: '280px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: '-8% -12% -8% 0',
                  background: `radial-gradient(ellipse at 70% 50%, rgba(212, 175, 55, 0.12), transparent 65%)`,
                  pointerEvents: 'none',
                }}
              />
              <img
                src={bannerImage}
                alt=""
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'right center',
                  opacity: 0.88,
                  filter: 'brightness(0.72) contrast(1.05)',
                }}
              />
            </div>
          </div>
        </section>

        {/* Our story — inspirado no bloco About / Our Story do layout de referência */}
        <section id="nossa-historia" aria-labelledby="landing-story-heading" style={sectionShell}>
          <div style={{ ...borderCard, overflow: 'hidden' }}>
            <div
              className="landing-story-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'clamp(24px, 3vw, 48px)',
                alignItems: 'center',
                padding: 'clamp(28px, 4vw, 48px)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: 'fit-content',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    color: 'rgba(255, 255, 255, 0.85)',
                  }}
                >
                  Sobre nós
                </span>
                <h2
                  id="landing-story-heading"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                    fontWeight: 600,
                    lineHeight: 1.15,
                    color: '#ffffff',
                  }}
                >
                  A nossa história
                </h2>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 'clamp(15px, 1.8vw, 17px)',
                    lineHeight: 1.75,
                    color: 'rgba(255, 255, 255, 0.68)',
                  }}
                >
                  A Kronos nasceu da paixão pela relojoaria de precisão e pelo detalhe que atravessa gerações. Começámos
                  como um círculo restrito de entusiastas e crescemos para uma casa que reúne curadoria, confiança e um
                  serviço pensado para quem vive o tempo como arte.
                </p>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 'clamp(15px, 1.8vw, 17px)',
                    lineHeight: 1.75,
                    color: 'rgba(255, 255, 255, 0.68)',
                  }}
                >
                  Unimos rigor na seleção das peças, transparência na proveniência e proximidade no acompanhamento —
                  para que cada escolha seja tão sólida quanto o tic-tac que a marca.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
                  
                  <Link
                    to="/signup"
                    style={{
                      padding: '12px 22px',
                      borderRadius: '999px',
                      border: `1px solid ${gold}`,
                      backgroundColor: 'rgba(212, 175, 55, 0.12)',
                      color: gold,
                      textDecoration: 'none',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '14px',
                      fontWeight: 600,
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.12)'
                    }}
                  >
                    Criar conta
                  </Link>
                </div>
              </div>
              <div
                style={{
                  position: 'relative',
                  minHeight: 'min(380px, 45vh)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <img
                  src={stroryImage}
                  alt="Relógio em destaque na coleção Kronos"
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: 'min(380px, 45vh)',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    filter: 'brightness(0.75) contrast(1.05)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.35) 0%, transparent 45%, rgba(212,175,55,0.08) 100%)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Testemunhos — grelha tipo referência */}
        <section id="testemunhos" aria-labelledby="landing-testimonials-heading" style={sectionShell}>
          <div style={{ ...borderCard, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
            <div style={{ textAlign: 'center', padding: 'clamp(28px, 4vw, 48px) clamp(20px, 3vw, 40px) 16px' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  color: 'rgba(255, 255, 255, 0.85)',
                }}
              >
                Testemunhos
              </span>
              <h2
                id="landing-testimonials-heading"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                  fontWeight: 600,
                  marginTop: '20px',
                  marginBottom: '16px',
                  color: '#ffffff',
                }}
              >
                O que dizem os nossos clientes
              </h2>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 'clamp(15px, 1.8vw, 17px)',
                  lineHeight: 1.65,
                  color: 'rgba(255, 255, 255, 0.62)',
                  maxWidth: '640px',
                  margin: '0 auto',
                }}
              >
                Não leve apenas pela nossa palavra — conheça experiências reais de quem confiou na Kronos.
              </p>
            </div>
            <div
              className="landing-testimonials-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
                padding: '0 clamp(20px, 3vw, 40px) clamp(36px, 4vw, 48px)',
                maxWidth: '960px',
                margin: '0 auto',
              }}
            >
              {testimonials.map((t) => (
                <article
                  key={t.author}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '24px',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: 'rgba(10, 10, 10, 0.6)',
                    transition: 'transform 0.2s, border-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.35)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div>
                    <StarRow />
                    <blockquote
                      style={{
                        margin: '16px 0 0',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '16px',
                        fontWeight: 500,
                        lineHeight: 1.6,
                        color: 'rgba(255, 255, 255, 0.9)',
                      }}
                    >
                      “{t.quote}”
                    </blockquote>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '24px', gap: '14px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${goldMuted}33, ${gold}22)`,
                        border: `1px solid ${gold}44`,
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '15px', margin: 0 }}>
                        {t.author}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '13px',
                          color: 'rgba(255, 255, 255, 0.5)',
                          margin: '4px 0 0',
                        }}
                      >
                        {t.company}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <style>{`
        @media (max-width: 900px) {
          .landing-hero-main {
            flex-direction: column !important;
            align-items: flex-start !important;
            padding-top: 8px !important;
          }
          .landing-hero-image-wrap {
            order: 2;
            width: 100% !important;
            justify-content: center !important;
            max-height: 38vh;
          }
          .landing-hero-image-wrap > div {
            max-width: 100% !important;
            height: min(320px, 38vh) !important;
          }
          .landing-story-grid {
            grid-template-columns: 1fr !important;
          }
          .landing-testimonials-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

export default Landing
