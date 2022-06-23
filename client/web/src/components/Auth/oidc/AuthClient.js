const SHA256 = require('crypto-js/sha256')
const Base64 = require('crypto-js/enc-base64')

export class AuthClient {
  constructor() {
    this.config = {
      client_id: 'RlbKJBuUxV3yuG00G05DWCqb6eMlFoiS',
      domain: 'https://dev-0gi5y814.us.auth0.com',
      redirect_uri: 'http://localhost:3000/callback',
    }

    console.log('AuthClient config', this.config)
    this._base64URLEncode = this._base64URLEncode.bind(this)
    this._sha256AndToBase64 = this._sha256AndToBase64.bind(this)
    this._generateId = this._generateId.bind(this)
    this._getLoginUrl = this._getLoginUrl.bind(this)
    this._newVerifier = this._newVerifier.bind(this)

    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
    this.getTokensByCode = this.getTokensByCode.bind(this)
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
    const challenge = this._sha256AndToBase64(verifier)
    const state = 'S' + new Date().getTime()
    const nonce = this._base64URLEncode(this._generateId(64))
    const audience = 'saas-boost:api'
    const params = {
      client_id: this.config.client_id,
      redirect_uri: this.config.redirect_uri,
      scope: 'openid profile email',
      response_type: 'code',
      response_mode: 'query',
      state,
      nonce,
      audience,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    }
    const qs = new URLSearchParams(params)
    const url = `${this.config.domain}/authorize?${qs}`
    return url
  }

  _newVerifier() {
    const verifier = this._base64URLEncode(this._generateId(64))
    sessionStorage.setItem('verifier', verifier)
    return verifier
  }

  login() {
    const verifier = this._newVerifier()
    window.location.href = this._getLoginUrl(verifier)
  }

  logout() {
    console.log('logout ...')
    sessionStorage.clear()
    localStorage.clear()
    const returnTo = this.config.redirect_uri.replace('/callback', '')
    const params = {
      client_id: this.config.client_id,
      returnTo,
    }
    const qs = new URLSearchParams(params)
    const url = `${this.config.domain}/v2/logout?${qs}`
    window.location.href = url
  }

  async getTokensByCode(code) {
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
    const host = `${this.config.domain}/oauth/token`
    console.log('POST', postPayload)
    const response = await fetch(host, {
      method: 'POST',
      headers: {
        'auth0-client': this.auth0Client,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(postPayload),
    })
    const result = await response.json()
    console.log('getTokensByCode', result)
    return result
  }

  async getUserInfoByAccessToken(accessToken) {
    const host = `${this.config.domain}/userinfo`
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
