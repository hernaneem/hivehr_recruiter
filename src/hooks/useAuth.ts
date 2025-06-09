import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtener sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return subscription?.unsubscribe
  }, [])

  const signUp = async (email: string, password: string, name: string, company?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          company
        }
      }
    })

    if (!error && data.user) {
      // Crear perfil en tabla recruiters
      await supabase.from('recruiters').insert({
        id: data.user.id,
        email: data.user.email,
        name,
        company
      })
    }

    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password })
  }

  const signOut = async () => {
    return await supabase.auth.signOut()
  }

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut
  }
}