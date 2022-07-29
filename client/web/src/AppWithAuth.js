import React, { Fragment, Suspense, useState } from 'react'
import { useAuth } from 'react-oidc-context'
import App from './App'
import IdleTimer from 'react-idle-timer'
import { OidcSignIn } from './components/Auth'
import { removeUserInfo, saveUserInfo } from './api/common'

const AppWithAuth = () => {
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

export default AppWithAuth
