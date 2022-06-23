import { createContext, useReducer, useEffect } from 'react'

export const AuthContext = createContext()

export const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload }
    case 'LOGOUT':
      localStorage.clear()
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
    const userInfo = localStorage.getItem('userInfo')
    let user = null
    if (userInfo) {
      user = JSON.parse(userInfo)
      dispatch({ type: 'LOGIN', payload: user })
    }
  }, [])

  console.log('AuthContext state:', state)

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  )
}
