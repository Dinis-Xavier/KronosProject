import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const logo = '/logo.png'

function Signup() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    setNeedsConfirmation(false)

    // Validar termos
    if (!acceptedTerms) {
      setError('Por favor, aceite os Termos e Condições para continuar.')
      setLoading(false)
      return
    }

    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            name: fullName
          }
        }
      })

      if (authError) throw authError

      // O trigger no Supabase já cria o perfil automaticamente
      // O nome fica armazenado no user_metadata do Supabase Auth

      // Com confirmação de email ativada:
      // - authData.user existe mas authData.session é null
      // - O usuário precisa confirmar o email antes de fazer login
      if (authData.user && !authData.session) {
        setNeedsConfirmation(true)
        setSuccess(true)
        // Redirecionar para login após alguns segundos
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        // Caso raro: se session existir (confirmação desativada)
        setSuccess(true)
        setTimeout(() => {
          navigate('/')
        }, 2000)
      }
    } catch (err) {
      setError(err.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#ffffff'
    }}>
      {/* Seção Esquerda - Branding */}
      <div style={{
        flex: '0 0 45%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '80px 60px',
        backgroundColor: 'hsl(0, 0%, 7%)',
        position: 'relative'
      }}>
        <img 
          src={logo} 
          alt="KRONOS Logo" 
          style={{
            width: '80px',
            height: 'auto',
            marginBottom: '30px',
            objectFit: 'contain'
          }}
        />
        <h1 style={{
          fontSize: '30px',
          fontWeight: '600',
          color: '#ffffff',
          marginBottom: '24px',
          textAlign: 'center',
          fontFamily: "'Playfair Display', serif"
        }}>
          Junte-se a Nós
        </h1>
        <p style={{
          fontSize: '18px',
          color: 'hsl(45, 10%, 60%)',
          textAlign: 'center',
          lineHeight: '1.6',
          maxWidth: '400px'
        }}>
          Crie a sua conta e tenha acesso a ofertas exclusivas e novidades em primeira mão.
        </p>
      </div>

      {/* Seção Direita - Formulário */}
      <div style={{
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        padding: '60px 80px',
        backgroundColor: 'hsl(0, 0%, 4%)',
        overflowY: 'auto',
        position: 'relative'
      }}>
        {/* Botão Voltar */}
        <Link 
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: '#ffffff',
            textDecoration: 'none',
            marginBottom: '40px',
            fontSize: '16px',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <span style={{ marginRight: '8px', color:"hsl(45, 10%, 60%)" }}>←</span>
          <span style={{ color:"hsl(45, 10%, 60%)" }}>Voltar</span>
        </Link>

        {/* Logo e Nome da Marca */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '40px'
        }}>
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
            color: '#ffffff',
            fontFamily: "'Playfair Display', serif"
          }}>
            KRONOS
          </span>
        </div>

        <h2 style={{
          fontSize: '36px',
          fontWeight: '600',
          marginBottom: '10px',
          color: '#ffffff',
          fontFamily: "'Playfair Display', serif"
        }}>
          Criar Conta
        </h2>

        <p style={{
          fontSize: '16px',
          color: '#cccccc',
          marginBottom: '40px'
        }}>
          Preencha os dados para criar a sua conta
        </p>

        {error && (
          <div style={{
            padding: '12px 16px',
            marginBottom: '24px',
            backgroundColor: '#3a1f1f',
            color: '#ff6b6b',
            borderRadius: '8px',
            fontSize: '14px',
            border: '1px solid #5a2f2f'
          }}>
            {error}
          </div>
        )}

        {success && needsConfirmation && (
          <div style={{
            padding: '12px 16px',
            marginBottom: '24px',
            backgroundColor: '#1a3a1f',
            color: '#6bff6b',
            borderRadius: '8px',
            fontSize: '14px',
            border: '1px solid #2f5a2f'
          }}>
            <strong>Conta criada com sucesso!</strong>
            <br />
            Por favor, verifique o seu email e clique no link de confirmação.
            <br />
            Depois de confirmar, você será redirecionado para a página de login.
          </div>
        )}

        {success && !needsConfirmation && (
          <div style={{
            padding: '12px 16px',
            marginBottom: '24px',
            backgroundColor: '#1f3a1f',
            color: '#6bff6b',
            borderRadius: '8px',
            fontSize: '14px',
            border: '1px solid #2f5a2f'
          }}>
            Conta criada com sucesso! A redirecionar para o login...
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
          {/* Campo Nome Completo */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#ffffff'
            }}>
              Nome Completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              required
              placeholder="O seu nome"
              style={{
                width: '100%',
                padding: '14px 16px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #3a3a3a',
                borderRadius: '8px',
                fontSize: '16px',
                color: '#ffffff',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#d4af37'}
              onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
            />
          </div>

          {/* Campo Email */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#ffffff'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              placeholder="seu@email.com"
              style={{
                width: '100%',
                padding: '14px 16px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #3a3a3a',
                borderRadius: '8px',
                fontSize: '16px',
                color: '#ffffff',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#d4af37'}
              onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
            />
          </div>

          {/* Campo Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#ffffff'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                minLength={6}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  paddingRight: '50px',
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #3a3a3a',
                  borderRadius: '8px',
                  fontSize: '16px',
                  color: '#ffffff',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#cccccc',
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Checkbox Termos */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#cccccc',
              lineHeight: '1.5'
            }}>
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                disabled={loading}
                style={{
                  marginRight: '12px',
                  marginTop: '2px',
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: '#d4af37'
                }}
              />
              <span>
                Concordo com os{' '}
                <Link 
                  to="/terms" 
                  style={{ color: '#d4af37', textDecoration: 'none' }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Termos e Condições
                </Link>
                {' '}e a{' '}
                <Link 
                  to="/privacy" 
                  style={{ color: '#d4af37', textDecoration: 'none' }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Política de Privacidade
                </Link>
              </span>
            </label>
          </div>

          {/* Botão Criar Conta */}
          <button
            type="submit"
            disabled={loading || !acceptedTerms}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: (loading || !acceptedTerms) ? '#3a3a3a' : '#d4af37',
              color: (loading || !acceptedTerms) ? '#888' : '#1a1a1a',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: (loading || !acceptedTerms) ? 'not-allowed' : 'pointer',
              marginBottom: '32px',
              transition: 'background-color 0.2s, opacity 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!loading && acceptedTerms) e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              if (!loading && acceptedTerms) e.currentTarget.style.opacity = '1';
            }}
          >
            {loading ? 'A criar conta...' : 'Criar Conta'}
          </button>
        </form>

        {/* Link para Login */}
        <div style={{
          textAlign: 'center',
          fontSize: '14px',
          color: '#cccccc'
        }}>
          <span>Já tem conta? </span>
          <Link
            to="/login"
            style={{
              color: '#d4af37',
              textDecoration: 'none',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            Entrar
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Signup
