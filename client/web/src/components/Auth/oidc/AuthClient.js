const SHA256 = require('crypto-js/sha256')
const Base64 = require('crypto-js/enc-base64')

export class AuthClient {
  constructor() {
    // https://dev-0gi5y814.us.auth0.com/.well-known/openid-configuration
    // https://authing-test-liuyong.authing.cn/oidc/.well-known/openid-configuration

    this.config = {
      client_id: 'RlbKJBuUxV3yuG00G05DWCqb6eMlFoiS',
      metadata_uri: 'https://dev-0gi5y814.us.auth0.com',
      redirect_uri: 'http://localhost:3000/callback',
      audience: 'saas-boost:api',
    }

    this.config = {
      client_id: '62a8392bb610e1da3f7aeefb',
      issuer: 'https://authing-test-liuyong.authing.cn/oidc',
      redirect_uri: 'http://localhost:3000/callback',
      audience: '62a8392bb610e1da3f7aeefb',
    }

    this.config = {
      client_id: 'saas-boost-test-client',
      issuer:
        'https://keycloak-sb.demo.solutions.aws.a2z.org.cn/auth/realms/saas-boost-test',
      redirect_uri: 'http://localhost:3000/callback',
      //audience: 'saas-boost-test-client'
    }

    this.config = {
      client_id: '0oa1exbutfeNvLgDn697',
      issuer: 'https://trial-8328523.okta.com/oauth2/default',
      redirect_uri: 'http://localhost:3000/callback',
      audience: 'api://default',
    }

    if (!this.config.openid_configuration) {
      this.config.openid_configuration = `${this.config.issuer}/.well-known/openid-configuration`
    }

    this._base64URLEncode = this._base64URLEncode.bind(this)
    this._sha256AndToBase64 = this._sha256AndToBase64.bind(this)
    this._generateId = this._generateId.bind(this)
    this._getLoginUrl = this._getLoginUrl.bind(this)
    this._newVerifier = this._newVerifier.bind(this)
    this._load_config = this._load_config.bind(this)

    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
    this.getTokensByCode = this.getTokensByCode.bind(this)
  }

  async _load_config() {
    const configLocalStorageKey = `openid_configuration-${this.config.client_id}`
    if (localStorage.getItem(configLocalStorageKey)) {
      console.log(`${configLocalStorageKey} already existed in localStorage`)
      return
    }

    const response = await fetch(this.config.openid_configuration)
    const openid_configuration = await response.json()
    const {
      authorization_endpoint,
      token_endpoint,
      userinfo_endpoint,
      end_session_endpoint,
    } = openid_configuration
    this.config.authorization_endpoint = authorization_endpoint
    this.config.token_endpoint = token_endpoint
    this.config.userinfo_endpoint = userinfo_endpoint
    this.config.end_session_endpoint = end_session_endpoint
    console.log('AuthClient load_config', this.config)
    localStorage.setItem(configLocalStorageKey, JSON.stringify(this.config))
  }

  _sha256AndToBase64(buff) {
    return Base64.stringify(SHA256(buff))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  _base64URLEncode(str) {
    return str
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  _generateId(len) {
    var s = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return Array(len)
      .join()
      .split(',')
      .map(function () {
        return s.charAt(Math.floor(Math.random() * s.length))
      })
      .join('')
  }

  _getLoginUrl(verifier) {
    const configLocalStorageKey = `openid_configuration-${this.config.client_id}`
    const authorization_endpoint = JSON.parse(
      localStorage.getItem(configLocalStorageKey)
    ).authorization_endpoint

    const challenge = this._sha256AndToBase64(verifier)
    const state = 'S' + new Date().getTime()
    const nonce = this._base64URLEncode(this._generateId(64))

    const params = {
      client_id: this.config.client_id,
      redirect_uri: this.config.redirect_uri,
      scope: 'openid profile email',
      response_type: 'code',
      response_mode: 'query',
      state,
      nonce,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    }

    if (this.config.audience) {
      params.audience = this.config.audience
    }

    const qs = new URLSearchParams(params)
    const url = `${authorization_endpoint}?${qs}`
    return url
  }

  _newVerifier() {
    const verifier = this._base64URLEncode(this._generateId(64))
    sessionStorage.setItem('verifier', verifier)
    return verifier
  }

  async login() {
    await this._load_config()
    const verifier = this._newVerifier()
    window.location.href = this._getLoginUrl(verifier)
  }

  async logout() {
    console.log('logout ...')
    const configLocalStorageKey = `openid_configuration-${this.config.client_id}`
    const return_to = this.config.redirect_uri.replace('/callback', '')
    const end_session_endpoint = JSON.parse(
      localStorage.getItem(configLocalStorageKey)
    ).end_session_endpoint

    if (end_session_endpoint) {
      const idToken = sessionStorage.getItem('idToken')
      const params = {
        post_logout_redirect_uri: return_to,
        id_token_hint: idToken,
      }
      const qs = new URLSearchParams(params)
      const url = `${end_session_endpoint}?${qs}`
      try {
        await fetch(url)
      } catch(e) {
      }
    }
    sessionStorage.clear()
    window.location.href = return_to
  }

  async getTokensByCode(code) {
    const configLocalStorageKey = `openid_configuration-${this.config.client_id}`

    const token_endpoint = JSON.parse(
      localStorage.getItem(configLocalStorageKey)
    ).token_endpoint
    console.log('token_endpoint:', token_endpoint)

    const verifier = sessionStorage.getItem('verifier')
    console.log('getTokensByCode() verifier', verifier)
    console.log('getTokensByCode() code', code)

    const redirect_uri = this.config.redirect_uri
    const client_id = this.config.client_id

    const postPayload = {
      client_id,
      grant_type: 'authorization_code',
      code,
      redirect_uri,
      code_verifier: verifier,
    }
    const host = token_endpoint
    console.log('POST', postPayload)
    const response = await fetch(host, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(postPayload),
    })
    const result = await response.json()
    console.log('getTokensByCode', result)
    return result
  }

  async getUserInfoByAccessToken(accessToken) {
    const configLocalStorageKey = `openid_configuration-${this.config.client_id}`

    const userinfo_endpoint = JSON.parse(
      localStorage.getItem(configLocalStorageKey)
    ).userinfo_endpoint
    console.log('userinfo_endpoint:', userinfo_endpoint)

    const host = userinfo_endpoint
    const response = await fetch(host, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    const result = await response.json()
    return result
  }
}
export default new AuthClient()
export function getUserInfo() {
  if (sessionStorage.getItem('userInfo')) {
    return JSON.parse(sessionStorage.getItem('userInfo'))
  }
  return null
}

export function getAccessToken() {
  return sessionStorage.getItem('accessToken')
}

export function saveLoginInfo({
  access_token,
  id_token,
  refresh_token,
  userInfo,
}) {
  sessionStorage.setItem('accessToken', access_token)
  sessionStorage.setItem('idToken', id_token)
  sessionStorage.setItem('refresh_token', refresh_token)
  sessionStorage.setItem('userInfo', JSON.stringify(userInfo))
}
