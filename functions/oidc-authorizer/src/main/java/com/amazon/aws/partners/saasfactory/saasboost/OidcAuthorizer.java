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

package com.amazon.aws.partners.saasfactory.saasboost;

import com.amazon.aws.partners.saasfactory.saasboost.io.AuthPolicy;
import com.amazon.aws.partners.saasfactory.saasboost.io.TokenAuthorizerContext;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.auth0.jwk.Jwk;
import com.auth0.jwk.JwkException;
import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.UrlJwkProvider;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URI;
import java.security.PublicKey;
import java.util.Base64;
import java.util.Date;


public class OidcAuthorizer implements RequestHandler<TokenAuthorizerContext, AuthPolicy> {
    public static final String SCOPE_ADMIN = System.getenv("SCOPE_ADMIN");
    private static final Logger LOGGER = LoggerFactory.getLogger(OidcAuthorizer.class);
    private static final String OIDC_ISSUER = System.getenv("OIDC_ISSUER");

    @Override
    public AuthPolicy handleRequest(TokenAuthorizerContext input, Context context) {

        String token = input.getAuthorizationToken();
        LOGGER.info(token);
        String principalId = verifyToken(token);
        String methodArn = input.getMethodArn();
        String[] arnPartials = methodArn.split(":");
        String region = arnPartials[3];
        String awsAccountId = arnPartials[4];
        String[] apiGatewayArnPartials = arnPartials[5].split("/");
        String restApiId = apiGatewayArnPartials[0];
        String stage = apiGatewayArnPartials[1];
        return new AuthPolicy(principalId,
                AuthPolicy.PolicyDocument.getAllowAllPolicy(region, awsAccountId, restApiId, stage));
    }

    /**
     * verify OIDC access token and check permissions
     *
     * @param token OIDC access token
     * @return subject in token claims
     */
    private String verifyToken(String token) {
        ObjectMapper objectMapper = new ObjectMapper();
        String jwtToken = token.split(" ")[1];
        String header = jwtToken.split("\\.")[0];
        String headerDecoded = new String(Base64.getDecoder().decode(header));
        LOGGER.info("headerDecoded: {}", headerDecoded);
        String openidConfiguration = OIDC_ISSUER + "/.well-known/openid-configuration";
        LOGGER.info("openidConfiguration: {}", openidConfiguration);
        try {
            JsonNode headerJson = objectMapper.readTree(headerDecoded);
            String kid = headerJson.get("kid").asText();
            JsonNode jsonNode = objectMapper.readTree(URI.create(openidConfiguration).toURL());
            String jwksUri = jsonNode.get("jwks_uri").asText();
            LOGGER.info("jwksUri: {}", jwksUri);
            JwkProvider provider = new UrlJwkProvider(URI.create(jwksUri).toURL());
            Jwk jwk = provider.get(kid);
            PublicKey pubKey = jwk.getPublicKey();
            Claims claims = Jwts.parserBuilder().setSigningKey(pubKey).build()
                    .parseClaimsJws(jwtToken).getBody();
            LOGGER.info("claims: {}", claims);
            checkPermissions(claims);
            if (claims.getExpiration().getTime() - 5000 <= new Date().getTime()) {
                throw new RuntimeException("token expired");
            }
            return claims.getSubject();
        } catch (IOException | JwkException e) {
            throw new RuntimeException(e);
        }

    }

    /**
     * Check permissions based on scope or user group
     *
     * if SCOPE_ADMIN not set, skip checking
     * for cognito-idp, check group name: 'cognito:groups'
     * for okta, check group name: 'groups'
     * for other OIDC IDPs, check scope, it should contain desired scope
     *
     * @param claims
     */
    private void checkPermissions(Claims claims) {
        if (SCOPE_ADMIN == null) {
            return;
        }
        String scope = "";
        if (claims.get("scope") != null) {
            scope = claims.get("scope").toString();
        } else if (claims.get("scp") != null) {
            scope = claims.get("scp").toString();
        }
        LOGGER.info("claims.scope: {}", scope);
        if (OIDC_ISSUER.contains("cognito-idp")) {
            checkGroup(claims, "cognito:groups");
        } else if (OIDC_ISSUER.contains("okta.com")) {
            checkGroup(claims, "groups");
        } else if (!scope.contains(SCOPE_ADMIN)) {
            throw new RuntimeException("invalid scope");
        }
    }

    /**
     * Check user group in claims, if desired user group not found, throw Exception
     *
     * @param claims
     * @param groupName
     */
    private void checkGroup(Claims claims, String groupName) {
        LOGGER.info("check group: " + groupName);
        if (claims.get(groupName) != null) {
            String cognitoGroups = claims.get(groupName).toString();
            if (!cognitoGroups.contains(SCOPE_ADMIN)) {
                throw new RuntimeException("invalid group");
            }
        } else {
            throw new RuntimeException("cannot find group " + groupName);
        }
    }
}
