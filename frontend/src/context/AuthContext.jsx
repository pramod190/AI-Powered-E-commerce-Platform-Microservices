import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authService } from '../services/auth'

const AuthContext = createContext()

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      }
    case 'LOGOUT':
      return initialState
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'RESTORE_TOKEN':
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: !!action.payload.token,
        loading: false,
      }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Restore token on app load
  useEffect(() => {
    const bootstrapAsync = async () => {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      if (token && user) {
        dispatch({
          type: 'RESTORE_TOKEN',
          payload: { token, user: JSON.parse(user) },
        })
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    bootstrapAsync()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password)
      const { accessToken, user } = response.data
      localStorage.setItem('token', accessToken)
      localStorage.setItem('user', JSON.stringify(user))
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token: accessToken },
      })
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      }
    }
  }

  const register = async (name, email, password) => {
    try {
      // Register the user
      const response = await authService.register(email, password, name)
      const { user } = response.data
      
      // Auto-login after registration
      const loginResponse = await authService.login(email, password)
      const { accessToken } = loginResponse.data
      
      localStorage.setItem('token', accessToken)
      localStorage.setItem('user', JSON.stringify(user))
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token: accessToken },
      })
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      }
    }
  }

  const logout = () => {
    authService.logout()
    dispatch({ type: 'LOGOUT' })
  }

  const value = {
    ...state,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
