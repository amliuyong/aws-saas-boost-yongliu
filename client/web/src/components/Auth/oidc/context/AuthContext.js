import { createContext, useReducer, useEffect } from 'react'
import { getUserInfo } from '../AuthClient'

export const AuthContext = createContext()

export const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload }
    case 'LOGOUT':
      return { ...state, user: null }
    default:
      return state
  }
}

export const AuthContextProvider = ({ children, oidc }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    oidc,
  })

  useEffect(() => {
    const userInfo = getUserInfo()
    if (userInfo) {
      dispatch({ type: 'LOGIN', payload: userInfo })
    }
  }, [])

  console.log('AuthContext state:', state)

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  )
}
