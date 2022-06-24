import { useAuthContext } from './useAuthContext'
import { useEffect } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import authClient, { saveLoginInfo } from './AuthClient'

export function OidcHandleCallback() {
  let location = useLocation()
  let query = new URLSearchParams(location.search)
  let code = query.get('code')
  let codeChallenge = localStorage.getItem('codeChallenge')
  let history = useHistory()

  const { dispatch } = useAuthContext()

  useEffect(() => {
    ;(async () => {
      let tokenSet = await authClient.getTokensByCode(code, {
        codeVerifier: codeChallenge,
      })
      const { access_token, id_token, refresh_token } = tokenSet
      let userInfo = await authClient.getUserInfoByAccessToken(
        tokenSet.access_token
      )
      console.log('userInfo', userInfo)
      saveLoginInfo({
        access_token,
        id_token,
        refresh_token,
        userInfo
      })
      console.log('saved token to sessionStorage')
      dispatch({ type: 'LOGIN', payload: userInfo })
      history.push('/')
    })()
  }, [])

  return <div>Loading...</div>
}
