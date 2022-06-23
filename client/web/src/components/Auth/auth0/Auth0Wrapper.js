
import { Auth0Provider } from "@auth0/auth0-react";
import Auth0App from "./Auth0App";

export const Auth0Wrapper = () => {
  return (
    <Auth0Provider
      domain="dev-0gi5y814.us.auth0.com"
      clientId="RlbKJBuUxV3yuG00G05DWCqb6eMlFoiS"
      redirectUri={window.location.origin}
      cacheLocation='localstorage'
    >
       <Auth0App />
    </Auth0Provider>
  )
}
