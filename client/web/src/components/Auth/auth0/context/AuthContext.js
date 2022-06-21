import { createContext, useReducer, useEffect } from 'react'

export const AuthContext = createContext()

export const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload }
    case 'LOGOUT':
      localStorage.clear();
      return { ...state, user: null }
    default:
      return state
  }
}

export const AuthContextProvider = ({ children, idp }) => {
  const [state, dispatch] = useReducer(authReducer, { 
    user: null,
    idp,
  })

  console.log('AuthContext state:', state)
  
  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      { children }
    </AuthContext.Provider>
  )

}