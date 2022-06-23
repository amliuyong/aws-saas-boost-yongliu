import sha256 from 'crypto-js/sha256'
import Base64 from 'crypto-js/enc-base64'

export class AuthClient {
  constructor() {
    this.config = {
      client_id: 'RlbKJBuUxV3yuG00G05DWCqb6eMlFoiS',
      domain: 'https://dev-0gi5y814.us.auth0.com',
      redirect_uri: 'http://localhost:3000/callback',
    }

    this._base64URLEncode = this._base64URLEncode.bind(this)
    this._sha256 = this._sha256.bind(this)
    this._generateId = this._generateId.bind(this)
    this._getLoginUrl = this._getLoginUrl.bind(this)

    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
    this.getTokensByCode = this.getTokensByCode.bind(this)

    this.verifier = this._generateId(32)
    this.challenge = this._base64URLEncode(this._sha256(this.verifier))
    this.state = new Date().getTime()
  }

  _base64URLEncode(s) {
    console.log('_base64URLEncode', s)
    return Base64.stringify(s)
  }

  _sha256(buffer) {
    return sha256(buffer)
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

  _getLoginUrl() {
    const audience = 'saas-boost:api'
    const url = `${this.config.domain}/authorize?response_type=code&code_challenge=${this.challenge}&code_challenge_method=S256&client_id=${this.config.client_id}&redirect_uri=${this.config.redirect_uri}&scope=openid profile email&audience=${audience}&state=${this.state}`
    return url
  }

  login() {
    window.location.href = this._getLoginUrl()
  }

  logout() {
    console.log('logout ...')
    const logoutUrl = this.config.redirect_uri.replace('/callback', '')
    const url = `${this.config.domain}/v2/logout?client_id=${this.config.client_id}&returnTo=${logoutUrl}`
    window.location.href = url
  }

  async getTokensByCode(code) {
    console.log('getTokensByCode()', code)

    const redirect_uri = this.config.redirect_uri
    const client_id = this.config.client_id

    const postPayload = {
      client_id,
      grant_type: 'authorization_code',
      code,
      redirect_uri,
      code_verifier: this.verifier,
    }
    const host = `${this.config.domain}/oauth/token`
    console.log('POST', postPayload)
    const response = await fetch(host, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postPayload),
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
