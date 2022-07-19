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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


public class OidcAuthorizer implements RequestHandler<TokenAuthorizerContext, AuthPolicy> {
    private static final Logger LOGGER = LoggerFactory.getLogger(OidcAuthorizer.class);
    private static final String OIDC_ISSUER = System.getenv("OIDC_ISSUER");

    static TokenVerifier tokenVerifier = TokenVerifier.getInstance(OIDC_ISSUER);

    @Override
    public AuthPolicy handleRequest(TokenAuthorizerContext input, Context context) {

        String methodArn = input.getMethodArn();
        String[] arnPartials = methodArn.split(":");
        String region = arnPartials[3];
        String awsAccountId = arnPartials[4];
        String[] apiGatewayArnPartials = arnPartials[5].split("/");
        String restApiId = apiGatewayArnPartials[0];
        String stage = apiGatewayArnPartials[1];

        String token = input.getAuthorizationToken();
        LOGGER.info(token);
        String principalId = "user";
        try {
            principalId = tokenVerifier.verify(token).getSubject();
        } catch (IllegalTokenException e) {
            return new AuthPolicy(principalId,
                    AuthPolicy.PolicyDocument.getDenyAllPolicy(region, awsAccountId, restApiId, stage));
        }

        return new AuthPolicy(principalId,
                AuthPolicy.PolicyDocument.getAllowAllPolicy(region, awsAccountId, restApiId, stage));
    }

}
