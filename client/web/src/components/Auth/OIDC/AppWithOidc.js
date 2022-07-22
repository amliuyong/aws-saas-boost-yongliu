import React, { Fragment, Suspense, useState } from 'react'
import { useAuth } from 'react-oidc-context'
import { OidcSignIn } from './OidcSignIn'
import App from '../../../App'
import IdleTimer from 'react-idle-timer'
import { Amplify, Auth } from 'aws-amplify'
import appConfig from '../../../config/appConfig'
import { S3Client, ListObjectsCommand } from '@aws-sdk/client-s3'

export const OIDC_STORAGE_USER_KEY = 'OidcUserInfo'
export const OIDC_AUTH_METHOD = 'OIDC'

Amplify.configure({
  Auth: {
    region: 'cn-north-1',
    identityPoolId: 'cn-north-1:120dbded-ff14-4002-9744-df884f2908b1',
  },
})

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

  const federatedSignInWithCognito = (auth0User) => {
    const idToken = auth0User.id_token
    const expires_at = auth0User.expires_at * 1000
    const name = auth0User.profile.name
    const email = auth0User.profile.email
    const domain = appConfig.oidcIssuer.replace('https://', '')

    Auth.federatedSignIn(
      domain,
      {
        token: idToken,
        expires_at,
      },
      {
        name,
        email,
      }
    ).then((cred) => {
      console.log('federatedSignIn.cred', cred)
      const s3Client = new S3Client({
        region: 'cn-north-1',
        credentials: cred,
      })
      const command = new ListObjectsCommand({
        Bucket: 'yongliu-cn-bj',
      })

      s3Client
        .send(command)
        .then((data) => {
          console.log('data', data)
        })
        .catch((err) => {
          console.log(err)
        })
    })
  }

  if (auth.isAuthenticated) {
    console.log('auth.user', auth.user)
    saveUserInfo(auth.user)
    federatedSignInWithCognito(auth.user)

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
