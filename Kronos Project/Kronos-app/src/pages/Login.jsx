import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const logo = '/logo.png'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [emailConfirmed, setEmailConfirmed] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  // Verificar se veio do redirecionamento de confirmação de email
  useEffect(() => {
    const token = searchParams.get('token')
    const type = searchParams.get('type')
    
    // Se houver token e type na URL, significa que veio da confirmação
    if (token && type === 'signup') {
      setEmailConfirmed(true)
      // Limpar os parâmetros da URL
      setSearchParams({})
      
      // Tentar obter a sessão (pode já estar criada)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          // Se já tem sessão, redirecionar para home
          navigate('/')
        }
      })
    }
  }, [searchParams, setSearchParams, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (authError) {
        // Mensagem mais amigável para email não confirmado
        if (authError.message.includes('Email not confirmed') || 
            authError.message.includes('email_not_confirmed')) {
          throw new Error('Por favor, confirme o seu email antes de fazer login. Verifique a sua caixa de entrada.')
        }
        throw authError
      }

      // Redirecionar para home após login bem-sucedido
      navigate('/')
    } catch (err) {
      setError(err.message || 'Erro ao fazer login')
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
          Bem-vindo de Volta
        </h1>
        <p style={{
          fontSize: '18px',
          color: 'hsl(45, 10%, 60%)',
          textAlign: 'center',
          lineHeight: '1.6',
          maxWidth: '400px'
        }}>
          Entre na sua conta para continuar a explorar as nossas ofertas exclusivas.
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
          Entrar
        </h2>

        <p style={{
          fontSize: '16px',
          color: '#cccccc',
          marginBottom: '40px'
        }}>
          Preencha os dados para entrar na sua conta
        </p>

        {emailConfirmed && (
          <div style={{
            padding: '12px 16px',
            marginBottom: '24px',
            backgroundColor: '#1a3a1a',
            color: '#4ade80',
            borderRadius: '8px',
            fontSize: '14px',
            border: '1px solid #2a5a2a'
          }}>
            Email confirmado com sucesso! Agora pode fazer login.
          </div>
        )}

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

        <form onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
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
          <div style={{ marginBottom: '32px' }}>
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

          {/* Botão Entrar */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: loading ? '#3a3a3a' : '#d4af37',
              color: loading ? '#888' : '#1a1a1a',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '32px',
              transition: 'background-color 0.2s, opacity 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.opacity = '1';
            }}
          >
            {loading ? 'A fazer login...' : 'Entrar'}
          </button>
        </form>

        {/* Link para Signup */}
        <div style={{
          textAlign: 'center',
          fontSize: '14px',
          color: '#cccccc'
        }}>
          <span>Não tem conta? </span>
          <Link
            to="/signup"
            style={{
              color: '#d4af37',
              textDecoration: 'none',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
