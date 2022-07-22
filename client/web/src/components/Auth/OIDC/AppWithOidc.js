import React, { Fragment, useState } from 'react'
import { useAuth } from 'react-oidc-context'
import { OidcSignIn } from './OidcSignIn'
import { Amplify, Auth, Storage } from 'aws-amplify'
import appConfig from '../../../config/appConfig'
import { S3Client, ListObjectsCommand } from '@aws-sdk/client-s3'

export const OIDC_STORAGE_USER_KEY = 'OidcUserInfo'
export const OIDC_AUTH_METHOD = 'OIDC'

Amplify.configure({
  Auth: {
    region: 'cn-north-1',
    identityPoolId: 'cn-north-1:120dbded-ff14-4002-9744-df884f2908b1',
  },
  Storage: {
    AWSS3: {
      bucket: 'yongliu-cn-bj',
      region: 'cn-north-1',
    },
  },
})

export const AppWithOidc = () => {
  const [signOutReason, setSignOutReason] = useState()
  const [s3Objects, setS3Objects] = useState([])
  const [downloadUrl, setDownloadUrl] = useState('')

  const auth = useAuth()
  const timeout = Number(process.env.REACT_APP_TIMEOUT) || 600000
  const minutes = timeout / (60 * 1000)

  const loading = () => (
    <div className="animated fadeIn pt-1 text-center">Loading...</div>
  )

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
    })
  }

  const showMyBucketHandler = () => {
    Auth.currentCredentials().then((credentials) => {
      const s3Client = new S3Client({
        region: 'cn-north-1',
        credentials: credentials,
      })

      const command = new ListObjectsCommand({
        Bucket: 'yongliu-cn-bj',
      })

      s3Client
        .send(command)
        .then((data) => {
          console.log('data', data)
          setS3Objects(data.Contents)
        })
        .catch((err) => {
          console.log(err)
        })
    })
  }

  const downloadFileUrl = async () => {
    const fileName = 'test/README.md'
    //const fileName = 'user/user.csv'
    const signedURL = await Storage.get(fileName, {
      level: 'public',
    })
    //alert(signedURL)
    setDownloadUrl(signedURL)
  }

  const uploadFile = async () => {
    const time = new Date().getTime()
    const result = await Storage.put(`Hello-${time}.txt`, 'Hello')
    alert('upload successfully, ' + JSON.stringify(result))
  }

  if (auth.isAuthenticated) {
    console.log('auth.user', auth.user)
    saveUserInfo(auth.user)
    federatedSignInWithCognito(auth.user)

    return (
      <Fragment>
        <ul>
          {s3Objects.map((obj) => {
            return <li key={obj.ID}>{obj.Key}</li>
          })}
        </ul>
        <button onClick={showMyBucketHandler}>
          Show Objects in Bucket: 'yongliu-cn-bj'
        </button>

        <button onClick={downloadFileUrl}>Get Download File Link</button>

        <p>
          {downloadUrl && (
            <a href={downloadUrl} target="_blank">
              Download
            </a>
          )}
        </p>

        <p>
          <button onClick={uploadFile}>Upload Test</button>
        </p>
      </Fragment>
    )
  } else {
    removeUserInfo()
    return <OidcSignIn signOutReason={signOutReason} />
  }
}
