import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null) // 'user' | 'admin'
  const [loading, setLoading] = useState(true)

  const fetchRole = async (userId) => {
    if (!userId) {
      setRole(null)
      return
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (error) {
      // fallback seguro: se falhar, assume user
      setRole('user')
      return
    }
    setRole(data?.role ?? 'user')
  }

  useEffect(() => {
    let isMounted = true

    // Verificar sessão atual (não pode bloquear o loading)
    ;(async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (!isMounted) return
        if (error) throw error

        const nextUser = data?.session?.user ?? null
        setUser(nextUser)

        // buscar role em background (sem bloquear UI)
        fetchRole(nextUser?.id)
      } catch (_err) {
        if (!isMounted) return
        setUser(null)
        setRole(null)
      } finally {
        if (!isMounted) return
        setLoading(false)
      }
    })()

    // Escutar mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return
      const nextUser = session?.user ?? null
      setUser(nextUser)
      fetchRole(nextUser?.id)
      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setRole(null)
  }

  const value = {
    user,
    role,
    isAdmin: role === 'admin',
    loading,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
