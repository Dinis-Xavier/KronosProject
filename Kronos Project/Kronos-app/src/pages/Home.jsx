import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Home.css'

function Home() {
  const { user, signOut, loading } = useAuth()

  const handleLogout = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <div className="home-container">
        <div className="home-content">
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Kronos</h1>
        <p className="home-subtitle">Loja de Relógios Premium</p>
        
        {user ? (
          <>
            <div className="home-buttons">
              <button onClick={handleLogout} className="btn btn-primary">
                Logout
              </button>
            </div>
            <p className="home-welcome">
              Bem-vindo, {user.user_metadata?.name || user.email}! Você tem 10% de desconto em todas as compras.
            </p>
          </>
        ) : (
          <>
            <div className="home-buttons">
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
              <Link to="/signup" className="btn btn-secondary">
                Sign Up
              </Link>
            </div>
            <p className="home-discount">
              Faça sign up e ganhe 10% de desconto em todas as compras!
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default Home
