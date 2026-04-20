import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Catalog from './pages/Catalog'
import Product from './pages/Product'
import Checkout from './pages/Checkout'
import CheckoutReturn from './pages/CheckoutReturn'
import CheckoutCancel from './pages/CheckoutCancel'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/catalog/:id" element={<Product />} />
          <Route path="/checkout/:id" element={<Checkout />} />
          <Route path="/checkout/return" element={<CheckoutReturn />} />
          <Route path="/checkout/cancel" element={<CheckoutCancel />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
