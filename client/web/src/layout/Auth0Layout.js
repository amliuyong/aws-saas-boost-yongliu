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
// Based on CoreUI Template https://github.com/coreui/coreui-free-react-admin-template
// SPDX-LicenseIdentifier: MIT
import React, { Component, Suspense } from 'react'
import { withRouter } from 'react-router-dom'
import * as router from 'react-router-dom'
import {
  AppContent,
  AppSidebar,
  AppFooter,
  AppHeader,
} from '../components/index'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
// sidebar nav config
import navigation from '../_nav'

const mapStateToProps = (state) => {
  return { settings: state.settings, setup: state.settings.setup }
}

class Auth0Layout extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: null,
    }
    console.log('Auth0Layout.props:', props)
    this.handleSignOut = this.handleSignOut.bind(this)
  }

  handleSignOut = async () => {
    console.log('call handleSignOut() ...')
    this.props.logout()
  }

  loading = () => (
    <div className="animated fadeIn pt-1 text-center">Loading...</div>
  )

  render() {
    const { user } = this.state
    const { setup } = this.props
    if (!setup) {
      navigation.forEach((nav) => {
        if (nav.name === 'Application') {
          nav.badge = {}
        }

        if (nav.name === 'Onboarding') {
          nav.disabled = false
        }

        if (nav.name === 'Tenants') {
          nav.disabled = false
        }
      })
    }

    const pageNav = navigation.filter((nav) => {
      return nav.name != 'Users'
    })

    return (
      <div>
        <AppSidebar navigation={pageNav} />
        <div className="wrapper d-flex flex-column min-vw-100 min-vh-100 bg-light">
          <Suspense fallback={this.loading()}>
            <AppHeader
              onLogout={this.handleSignOut}
              user={user}
              router={router}
            />
          </Suspense>
          <div className="body flex-grow-1 px-3">
            <AppContent />
          </div>
          <AppFooter />
        </div>
      </div>
    )
  }
}

Auth0Layout.propTypes = {
  history: PropTypes.object,
  setup: PropTypes.bool,
  location: PropTypes.object,
}

// export default connect(mapStateToProps, null)(withRouter(DefaultLayout))
export default connect(mapStateToProps, null)(withRouter(Auth0Layout))
