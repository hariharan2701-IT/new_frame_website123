import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      checkAdminStatus(session?.user)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      checkAdminStatus(session?.user)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAdminStatus = async (user: User | null) => {
    if (!user) {
      setIsAdmin(false)
      return
    }

    // Check if user is admin based on email
    setIsAdmin(user.email === '7708554879@gmail.com')
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (data.user) {
      // Create user profile
      await supabase.from('users').insert({
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName,
        role: 'customer',
      })
    }

    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    // Check if this is the admin trying to log in
    if (email === '7708554879@gmail.com' && password === '7708554879') {
      // Try to sign in first
      const signInResult = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      // If sign in fails because user doesn't exist, create the admin user
      if (signInResult.error && signInResult.error.message.includes('Invalid login credentials')) {
        console.log('Admin user not found, creating admin account...')
        const signUpResult = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: '7708854879',
              role: 'admin'
            }
          }
        })
        
        if (signUpResult.error) {
          return signUpResult
        }
        
        // After creating admin, try to sign in again
        return await supabase.auth.signInWithPassword({
          email,
          password,
        })
      }
      
      return signInResult
    }
    
    // Regular user sign in
    return await supabase.auth.signInWithPassword({
      email,
      password,
    })
  }

  const signOut = async () => {
    return await supabase.auth.signOut()
  }

  return {
    user,
    loading,
    isAdmin,
    signUp,
    signIn,
    signOut,
  }
}