import React, { Fragment, Suspense, useState } from 'react'
import { useAuth } from 'react-oidc-context'
import { OidcSignIn } from './OidcSignIn'
import App from '../../../App'
import IdleTimer from 'react-idle-timer'

export const OIDC_STORAGE_USER_KEY = 'OidcUserInfo'
export const OIDC_AUTH_METHOD = 'OIDC'

export const AppWithOidc = () => {
  const [signOutReason, setSignOutReason] = useState()

  const auth = useAuth()
  const timeout = Number(process.env.REACT_APP_TIMEOUT) || 600000
  const minutes = timeout / (60 * 1000)

  const loading = () => (
    <div className="animated fadeIn pt-1 text-center">Loading...</div>
  )

  const onIdle = async () => {
    try {
      const signOutReason = `Session closed due to ${minutes} minutes of inactivity.`
      setSignOutReason(signOutReason)
      return auth.removeUser()
    } catch (e) {
      // do nothing
    }
  }

  if (auth.isLoading) {
    return <div>{loading()}</div>
  }
  if (auth.error) {
    return <div>Oops... {auth.error.message}</div>
  }
  const saveUserInfo = (user) => {
    sessionStorage.setItem(OIDC_STORAGE_USER_KEY, JSON.stringify(user))
  }

  const removeUserInfo = () => {
    sessionStorage.removeItem(OIDC_STORAGE_USER_KEY)
  }

  if (auth.isAuthenticated) {
    saveUserInfo(auth.user)
    return (
      <Fragment>
        <Suspense fallback={loading()}>
          <App authState={'signedIn'} oidcAuth={auth} />
        </Suspense>
        <IdleTimer onIdle={onIdle} debounce={250} timeout={timeout} />
      </Fragment>
    )
  } else {
    removeUserInfo()
    return <OidcSignIn signOutReason={signOutReason} />
  }
}
