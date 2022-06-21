/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import App from './../../../App'
import { SignIn } from './SigIn'
import { useAuthContext } from './useAuthContext'

function OIDCAuthApp() {
  const { user, isLoading, getAccessTokenSilently } = useAuth0()
  const { dispatch } = useAuthContext()

  if (user) {
    dispatch({ action: 'LOGIN', payload: user })
  }
  
  if (isLoading) {
    return <p>Loading ...</p>
  }

  getAccessTokenSilently()
    .then((token) => {
      console.log('AccessToken', token)
    })
    .catch((error) => {})

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/login" exact={true}>
          <SignIn />
        </Route>
        <Route path="/">
          {user && <App />}
          {!user && <Redirect to="/login" />}
        </Route>
      </Switch>
    </BrowserRouter>
  )
}

export default OIDCAuthApp
