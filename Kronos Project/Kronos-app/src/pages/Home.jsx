import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
//import ReactIcon{} from 'react-icons/ri'

const logo = '/logo.png'
const bannerImage = '/HomePageBanner.jpg'

function Home() {
  const { user, isAdmin, signOut, loading } = useAuth()
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
  }

  useEffect(() => {
    if (!drawerOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [drawerOpen])

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    if (newsletterEmail) {
      setNewsletterSubmitted(true)
      setNewsletterEmail('')
      setTimeout(() => {
        setNewsletterSubmitted(false)
      }, 3000)
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
        backgroundColor: 'rgba(0, 0, 0, 0.92)',
        borderBottom: '1px solid #1a1a1a',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(10px)'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
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

        {/* Navigation Links */}
        <nav style={{ display: 'flex', gap: '40px' }}>
          <a href="/catalog" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>COLEÇÕES</a>
          <a href="#" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>NOVIDADES</a>
          <a href="#" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>SOBRE</a>
          <a href="#" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>CONTACTO</a>
        </nav>

        {/* Action Buttons / User */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {user ? (
            <>
              <button
                type="button"
                onClick={() => {
                  if (isAdmin) setDrawerOpen(true)
                }}
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
                aria-label={isAdmin ? 'Abrir menu de admin' : 'Utilizador'}
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
                  {/* simple user icon */}
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
              </button>

              <button
                onClick={handleLogout}
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'transparent',
                  color: 'hsl(45, 10%, 60%)',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
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
            onClick={() => setDrawerOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.55)',
              zIndex: 50
            }}
          />
          <aside
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              height: '100vh',
              width: '340px',
              backgroundColor: '#0b0b0b',
              borderLeft: '1px solid #1a1a1a',
              zIndex: 51,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(212,175,55,0.12)',
                  border: '1px solid rgba(212,175,55,0.35)'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5Z" stroke="#d4af37" strokeWidth="2"/>
                    <path d="M20 22a8 8 0 1 0-16 0" stroke="#d4af37" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: '#ffffff', fontWeight: '600', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.user_metadata?.name || user.email}
                  </div>
                  <div style={{ color: 'hsl(45, 10%, 60%)', fontSize: '12px' }}>Admin</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid #2a2a2a',
                  color: '#cccccc',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  cursor: 'pointer'
                }}
                aria-label="Fechar drawer"
              >
                ✕
              </button>
            </div>

            <div style={{ height: '1px', backgroundColor: '#1a1a1a', margin: '8px 0' }} />

            <button
              type="button"
              onClick={() => {}}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: '#d4af37',
                color: '#1a1a1a',
                border: 'none',
                fontWeight: '700',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              Dashboard
            </button>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: 'transparent',
                color: '#ffffff',
                border: '1px solid #2a2a2a',
                fontWeight: '600',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              Sair
            </button>
          </aside>
        </>
      )}

      {/* Main Banner Section */}
      <section style={{
        display: 'flex',
        minHeight: '600px',
        position: 'relative',
        backgroundColor: '#000000',
        overflow: 'hidden',
        paddingTop: '60px'
      }}>
        {/* Centered Image - Behind Text */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '50%',
          height: '80%',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <img
            src={bannerImage}
            alt="Luxury Watch"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'brightness(0.6) opacity(0.6)'
            }}
          />
          {/* Darken right side only */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(0,0,0,0) -80%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.45) 75%, rgba(0,0,0,0.75) 100%)'
          }} />
        </div>

        {/* Right Content - Text and Buttons */}
        <div style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          paddingLeft: '100px',
          zIndex: 2,
          maxWidth: '720px',
          marginLeft: '200px',
        }}>
          <p style={{
            fontSize: '16px',
            color: '#d4af37',
            marginBottom: '20px',
            fontWeight: '500',
            letterSpacing: '2px'
          }}>
            COLEÇÃO 2024
          </p>
          <h1 style={{
            fontSize: '64px',
            fontWeight: '600',
            marginBottom: '24px',
            lineHeight: '1.2',
            fontFamily: "'Playfair Display', serif"
          }}>
            <span style={{ color: '#ffffff' }}>O Tempo é</span>
            <br />
            <span style={{ color: '#d4af37' }}>Precioso</span>
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#cccccc',
            marginBottom: '40px',
            lineHeight: '1.6',
            maxWidth: '500px'
          }}>
            Descubra a nossa coleção exclusiva de relógios de luxo. Cada peça conta uma história de excelência e artesanato impecável.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button
              style={{
                padding: '16px 32px',
                backgroundColor: '#d4af37',
                color: '#1a1a1a',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Explorar Coleção →
            </button>
            <Link
              to="/signup"
              style={{
                padding: '16px 32px',
                backgroundColor: 'transparent',
                color: '#ffffff',
                border: '1px solid #d4af37',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '80px',
        backgroundColor: '#0a0a0a'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '60px',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Feature 1 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #d4af37',
              borderRadius: '50%'
            }}>
              <span style={{ fontSize: '40px' }}>🏆</span>
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '12px'
            }}>
              Qualidade Premium
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#cccccc',
              lineHeight: '1.6'
            }}>
              Apenas relógios autênticos de marcas certificadas
            </p>
          </div>

          {/* Feature 2 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #d4af37',
              borderRadius: '50%'
            }}>
              <span style={{ fontSize: '40px' }}>🛡️</span>
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '12px'
            }}>
              Garantia Vitalícia
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#cccccc',
              lineHeight: '1.6'
            }}>
              Proteção completa em todas as suas compras
            </p>
          </div>

          {/* Feature 3 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #d4af37',
              borderRadius: '50%'
            }}>
              <span style={{ fontSize: '40px' }}>🚚</span>
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '12px'
            }}>
              Envio Seguro
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#cccccc',
              lineHeight: '1.6'
            }}>
              Entrega gratuita e assegurada em toda a Europa
            </p>
          </div>

          {/* Feature 4 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #d4af37',
              borderRadius: '50%'
            }}>
              <span style={{ fontSize: '40px' }}>🕐</span>
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '12px'
            }}>
              Suporte 24/7
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#cccccc',
              lineHeight: '1.6'
            }}>
              Assistência especializada sempre disponível
            </p>
          </div>
        </div>
      </section>

      {/* Featured Watches Section */}
      <section style={{
        padding: '100px 80px',
        backgroundColor: '#000000'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <p style={{
            fontSize: '16px',
            color: '#d4af37',
            marginBottom: '16px',
            fontWeight: '500',
            letterSpacing: '2px'
          }}>
            SELEÇÃO PREMIUM
          </p>
          <h2 style={{
            fontSize: '48px',
            fontWeight: '600',
            color: '#ffffff',
            marginBottom: '24px',
            fontFamily: "'Playfair Display', serif"
          }}>
            Relógios em Destaque
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#cccccc',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Peças exclusivas selecionadas pelos nossos especialistas. Cada relógio representa o auge da relojoaria suíça.
          </p>
        </div>

        {/* Coming Soon Message */}
        <div style={{
          textAlign: 'center',
          padding: '80px 40px',
          backgroundColor: '#0a0a0a',
          borderRadius: '8px',
          border: '1px solid #1a1a1a'
        }}>
          <p style={{
            fontSize: '24px',
            color: '#d4af37',
            fontWeight: '500'
          }}>
            Brevemente
          </p>
        </div>
      </section>

      {/* Newsletter Section */}
      <section style={{
        padding: '100px 80px',
        backgroundColor: '#0a0a0a',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #d4af37',
            borderRadius: '50%'
          }}>
            <span style={{ fontSize: '40px' }}>✉️</span>
          </div>
          <h2 style={{
            fontSize: '42px',
            fontWeight: '600',
            color: '#ffffff',
            marginBottom: '24px',
            fontFamily: "'Playfair Display', serif"
          }}>
            Fique a Par das Novidades
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#cccccc',
            marginBottom: '40px',
            lineHeight: '1.6'
          }}>
            Subscreva a nossa newsletter e receba em primeira mão as novas coleções, ofertas exclusivas e notícias do mundo da relojoaria.
          </p>

          {newsletterSubmitted ? (
            <div style={{
              padding: '16px',
              backgroundColor: '#1a3a1f',
              color: '#6bff6b',
              borderRadius: '8px',
              fontSize: '16px',
              border: '1px solid #2f5a2f'
            }}>
              Subscrito com sucesso!
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} style={{
              display: 'flex',
              gap: '12px',
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="O seu email"
                required
                style={{
                  flex: '1',
                  padding: '14px 16px',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #3a3a3a',
                  borderRadius: '4px',
                  fontSize: '16px',
                  color: '#ffffff',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '14px 32px',
                  backgroundColor: '#d4af37',
                  color: '#1a1a1a',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Subscrever
              </button>
            </form>
          )}

          <p style={{
            fontSize: '12px',
            color: '#888',
            marginTop: '24px'
          }}>
            Ao subscrever, concorda com a nossa política de privacidade.
          </p>
        </div>
      </section>

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
                <a href="#" style={{ color: '#cccccc', textDecoration: 'none', fontSize: '14px' }}>Início</a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ color: '#cccccc', textDecoration: 'none', fontSize: '14px' }}>Coleções</a>
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

export default Home
