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


public class OidcAuthorizer implements RequestHandler<TokenAuthorizerContext, AuthPolicy>  {
    private static final Logger LOGGER = LoggerFactory.getLogger(OidcAuthorizer.class);
    private static final String AWS_REGION = System.getenv("AWS_REGION");
    private static final String SAAS_BOOST_ENV = System.getenv("SAAS_BOOST_ENV");
    private static final String OIDC_ISSUER = System.getenv("OIDC_ISSUER");

    @Override
    public AuthPolicy handleRequest(TokenAuthorizerContext input, Context context) {
        ObjectMapper objectMapper = new ObjectMapper();
        String token = input.getAuthorizationToken();
        LOGGER.info(token);

        String jwtToken = token.split(" ")[1];
        String header = jwtToken.split("\\.")[0];
        LOGGER.info("header: {}", header);
        String headerDecoded = new String(Base64.getDecoder().decode(header));
        LOGGER.info("headerDecoded: {}", headerDecoded);
        String openidConfiguration = OIDC_ISSUER + "/.well-known/openid-configuration";
        LOGGER.info("openidConfiguration: {}", openidConfiguration);
        try {
            JsonNode headerJson = objectMapper.readTree(headerDecoded);
            String kid = headerJson.get("kid").asText();
            LOGGER.info("kid: {}", kid);
            JsonNode jsonNode = objectMapper.readTree(URI.create(openidConfiguration).toURL());
            String jwksUri = jsonNode.get("jwks_uri").asText();
            LOGGER.info("jwksUri: {}", jwksUri);
            JwkProvider provider = new UrlJwkProvider(URI.create(jwksUri).toURL());
            Jwk jwk = provider.get(kid);
            PublicKey pubKey = jwk.getPublicKey();
            LOGGER.info("pubKey: {}", pubKey);
            Claims claims = Jwts.parserBuilder().setSigningKey(pubKey).build()
                    .parseClaimsJws(jwtToken).getBody();
            LOGGER.info("claims: {}", claims);
            LOGGER.info("claims.scope: {}", claims.get("scope"));
        } catch (IOException e) {
            throw new RuntimeException(e);
        } catch (JwkException e) {
            throw new RuntimeException(e);
        }


        //Jwts.parserBuilder().setSigningKey()

        // validate the incoming token
        // and produce the principal user identifier associated with the token

        // this could be accomplished in a number of ways:
        // 1. Call out to OAuth provider
        // 2. Decode a JWT token in-line
        // 3. Lookup in a self-managed DB
        String principalId = "user";

        // if the client token is not recognized or invalid
        // you can send a 401 Unauthorized response to the client by failing like so:
        // throw new RuntimeException("Unauthorized");

        // if the token is valid, a policy should be generated which will allow or deny access to the client

        // if access is denied, the client will receive a 403 Access Denied response
        // if access is allowed, API Gateway will proceed with the back-end integration configured on the method that was called

        String methodArn = input.getMethodArn();
        String[] arnPartials = methodArn.split(":");
        String region = arnPartials[3];
        String awsAccountId = arnPartials[4];
        String[] apiGatewayArnPartials = arnPartials[5].split("/");
        String restApiId = apiGatewayArnPartials[0];
        String stage = apiGatewayArnPartials[1];
        String httpMethod = apiGatewayArnPartials[2];
        String resource = ""; // root resource
        if (apiGatewayArnPartials.length == 4) {
            resource = apiGatewayArnPartials[3];
        }

        // this function must generate a policy that is associated with the recognized principal user identifier.
        // depending on your use case, you might store policies in a DB, or generate them on the fly

        // keep in mind, the policy is cached for 5 minutes by default (TTL is configurable in the authorizer)
        // and will apply to subsequent calls to any method/resource in the RestApi
        // made with the same token

        // the example policy below denies access to all resources in the RestApi
        AuthPolicy policy = new AuthPolicy(principalId,
                AuthPolicy.PolicyDocument.getAllowAllPolicy(region, awsAccountId, restApiId, stage));
        return policy;
    }

}
