const { AuthenticationClient } = require('authing-js-sdk')
const authing = new AuthenticationClient({
  appId: '62a8392bb610e1da3f7aeefb',
  appHost: 'https://authing-test-liuyong.authing.cn',
  redirectUri: 'http://localhost:3000/callback',
  tokenEndPointAuthMethod: 'none',
})

export const login = () => {
  let codeChallenge = authing.generateCodeChallenge()
  localStorage.setItem('codeChallenge', codeChallenge)
  let codeChallengeDigest = authing.getCodeChallengeDigest({
    codeChallenge,
    method: 'S256',
  })
  let url = authing.buildAuthorizeUrl({
    scope: 'openid email profile address phone order:read',
    codeChallenge: codeChallengeDigest,
    codeChallengeMethod: 'S256',
  })
  window.location.href = url
}

export const logout = () => {
  let idToken = localStorage.getItem('idToken')
  localStorage.clear()
  let url = authing.buildLogoutUrl({
    expert: true,
    redirectUri: 'http://localhost:3000',
    idToken,
  })
  window.location.href = url
}

export default authing
