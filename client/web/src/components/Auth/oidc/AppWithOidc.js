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

import App from './../../../App'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
import { useAuthContext } from './useAuthContext'
import { SignIn } from './SignIn'
import { OidcHandleCallback } from './OidcHandleCallback'

function AppWithOidc() {
  const { user } = useAuthContext()

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/login" exact={true}>
          <SignIn />
        </Route>
        <Route path="/callback" exact={true}>
          <OidcHandleCallback />
        </Route>
        <Route path="/">
          {user && <App />}
          {!user && <Redirect to="/login" />}
        </Route>
      </Switch>
    </BrowserRouter>
  )
}

export default AppWithOidc
