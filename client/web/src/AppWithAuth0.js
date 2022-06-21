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

import { Suspense } from 'react'
import Auth0App from './components/Auth/auth0/Auth0App'
import { Auth0Wrapper } from './components/Auth/auth0/Auth0Wrapper'
import { AuthContextProvider } from './components/Auth/auth0/context/AuthContext'

const loading = () => (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse">Loading...</div>
  </div>
)

function AppWithAuth0() {
  return (
    <Suspense fallback={loading()}>
      <AuthContextProvider idp='auth0'>
        <Auth0Wrapper>
          <Auth0App />
        </Auth0Wrapper>
      </AuthContextProvider>
    </Suspense>
  )
}

export default AppWithAuth0
