# Instructions for configuring AWS SaaS Boost using OIDC.

AWS SaaS Boost supports third party OAuth 2.0/OpenID IdPs for authentication and authorization beside Cognito User Pool, such as Keycloak, Okta, Auth0, Authing.
This document gives the quick instructions how to configure AWS SaaS Boost authentication with third party OAuth 2.0/OpenID IdPs.

## Prerequisite in China regions

You must have a domain name which is under the ICP(Internet Content Provider).

## Auth with IdPs configuration

### Keycloak

1. Install Keycloak through AWS solution [Keycloak on Amazon Web Services](https://www.amazonaws.cn/en/solutions/keycloak-on-aws/).

2. Login Keycloak Administration Console.

3. Add a new realm, such as `aws-saas-boost-auth`.

4. Choose **Clients** in left panel, Choose **Create**.

5. Enter **Client ID**, such as `aws-saas-boost-web-client`, Choose **Save**.

6. Choose **Save**.

7. Choose **User** in left panel.

8. Choose **Add user**.

9. Enter **Username**, such as `sb-admin`, enter an **Email**,  Choose **Save**.

10. Choose **Credentials** tab, set password for the user.

11. Follow the [installation instructions](./install-using-cloud9.md) to install AWS SaaS Boost with below parameters:
   
| Parameter                            | Value                                                       | Comment                                                        |
|--------------------------------------|-------------------------------------------------------------|----------------------------------------------------------------|
| OIDC issuer                          | `https://<keycloak domain>/auth/realms/aws-saas-boost-auth` | please replace `<keycloak domain>`                             |
| client Id                            | aws-saas-boost-web-client                                   | the Client ID                                                  |
| permissions required in token claims | none                                                        | set `none` to ignore                                           |
| admin console domain name            | `<your console domian name>`                                | saas boost console domain name, only required in China regions |

12. Update **Valid Redirect URIs** and **Web Origins** to your AWS saas boost web URL in Keycloak.

13. Login AWS saas boost console with the user created in Keycloak, such as `sb-admin`.


### Auth0

1. Login [Auth0](https://manage.auth0.com/dashboard).

2. Choose **Applications** -> **Applications** in the left panel.

3. Choose **Create Application**.

4. Enter **Name**, such as `aws-saas-boost-app` and choose **Single Page Web Applications**.

5. Choose **Settings** tab, record **Domain** and **Client ID**.

6. Choose **Applications** -> **APIs** in the left panel.

7. Choose **Create API**, enter **Name**, such as `aws-saas-boost-api`, enter **Identifier**, such as `aws-saas-boost-api`, choose **Create**.

8. Choose **Settings** tab, in RBAC Settings, choose **Enable RBAC** and **Add Permissions in the Access Token**.

9. **Save** the settings.

10. Choose **Authentication** -> **Database** in the left panel.

11. Choose **Create DB Connection**, enter **Name**, such as `aws-saas-boost-db-connection`, enable **Requires Username** and **Disable Sign Ups**, choose **Create**.

12. Choose **Applications** tab in `aws-saas-boost-db-connection` , enable **aws-saas-boost-app** and **aws-saas-boost-api**.

13. Choose **User Management** -> **Users** in the left panel.

14. Choose **Create User**, enter **Email**, **Password**, **Repeat Password**, **Username**, **Connection**: choose `aws-saas-boost-db-connection`, choose **Create**.

15. Follow the [installation instructions](./install-using-cloud9.md) to install AWS SaaS Boost with below parameters:

| Parameter                            | Value                        | Comment                                                        |
|--------------------------------------|------------------------------|----------------------------------------------------------------|
| OIDC issuer                          | `https://<domain>`           | replace <domain> as the **Domain** recorded in step 5          |
| client Id                            | `<client_id>`                | the **Client ID**  recorded in step 5                          |
| permissions required in token claims | none                         | set `none` to ignore                                           |
| auth0 audience                       | `aws-saas-boost-api`         | the  **Identifier** in step 7                                  |
| admin console domain name            | `<your console domian name>` | saas boost console domain name, only required in China regions |

16. Update **Allowed Callback URLs** and **Allowed Web Origins** to your AWS saas boost web URL in application `aws-saas-boost-app` settings.

17. Login AWS saas boost console with the user created above.

### Authing

1. Login [https://console.authing.cn](https://console.authing.cn/).

2. Choose **Create User Pool**. 

3. Enter **User Pool Name**, such as `aws-saas-boost-user-pool`,  and choose **I want to build authentication for my end user.**

4. Choose **Applications** -> **Self-built App** in the left panel.

5. Choose **Create**, and enter **Application Name**, such as `aws-saas-boost-app`, **Subdomain**, such as `aws-saas-boost-app`, choose **SPA**, choose **Create**.

6. Choose **Configuration** tab, record  **Issuer** and **App ID**.

7. In **Configuration** tab, click **Other configuration**, change **Id_token signature algorithm** to **RS256**, choose **Save**.

8. Choose **Users & Role** -> **Users** in the left panel.

9. Choose **Create User**, choose **Username**, enter required inputs, choose **Confirm**.

10. Follow the [installation instructions](./install-using-cloud9.md) to install AWS SaaS Boost with below parameters:

| Parameter                            | Value                        | Comment                                                        |
|--------------------------------------|------------------------------|----------------------------------------------------------------|
| OIDC issuer                          | `<Issuer>`                   | the **Issuer** recorded in step 6                              |
| client Id                            | `<App ID>`                   | the **App ID**  recorded in step 6                             |
| permissions required in token claims | none                         | set `none` to ignore                                           |
| admin console domain name            | `<your console domian name>` | saas boost console domain name, only required in China regions |

11. Update **Login Callback URL**, **Logout Callback URL** and **Initiate login URL** to your AWS saas boost web URL in application `aws-saas-boost-app` settings.

12. Login AWS saas boost console with the user created above.


## (Optional) Permissions settings (advance configuration)

You can set **permissions required in token claims** to do permission control based on scope or groups,  the format is `key1=value1,key2=value2,...`. 

e.g. if it is set to `scope=aws-saas-boost-admin`, only the user with below claims can log in the console, note: scopes `openid profile email` are default scopes.

```json
{

  "scope": "openid profile email aws-saas-boost-admin"

}
```

e.g. if it is set to `groups=aws-saas-boost-admin`, only the user with below claims can log in the console

```json
{

  "groups": ["aws-saas-boost-admin"]

}
```
Each IdP has its own configuration about roles and permissions, please refer to their documents.
