import AppWithAuth from './AppWithAuth'
import {
  AppWithOidc,
  OIDC_AUTH_METHOD,
} from './components/Auth/OIDC/AppWithOidc'
import { AuthProvider } from 'react-oidc-context'
import appConfig from './config/appConfig'

export const AppWithAuthWrapper = () => {
  console.log('authMethod', appConfig.authMethod)
  if (appConfig.authMethod != OIDC_AUTH_METHOD) {
    return <AppWithAuth />
  }

  const oidcConfig = {
    authority: appConfig.oidcIssuer,
    client_id: appConfig.oidcClientId,
    redirect_uri: window.location.origin,
  }
  
  return (
    <AuthProvider {...oidcConfig}>
      <AppWithOidc />
    </AuthProvider>
  )
}
