
import { Auth0Provider } from "@auth0/auth0-react";

export const Auth0Wrapper = ({ children }) => {
  return (
    <Auth0Provider
      domain="dev-0gi5y814.us.auth0.com"
      clientId="RlbKJBuUxV3yuG00G05DWCqb6eMlFoiS"
      redirectUri={window.location.origin}
      cacheLocation='localstorage'
    >
        {children}
    </Auth0Provider>
  )
}
