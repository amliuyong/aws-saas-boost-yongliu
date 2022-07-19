package com.amazon.aws.partners.saasfactory.saasboost;

import com.amazon.aws.partners.saasfactory.saasboost.impl.CognitoOidcTokenVerifier;
import com.amazon.aws.partners.saasfactory.saasboost.impl.DefaultOidcTokenVerifier;
import com.amazon.aws.partners.saasfactory.saasboost.impl.OktaOidcTokenVerifier;
import io.jsonwebtoken.Claims;

public interface TokenVerifier {
    static TokenVerifier getInstance(String issuer) {
        if (issuer.contains("cognito-idp")) {
            return new CognitoOidcTokenVerifier(new OIDCConfig(issuer));
        } else if (issuer.contains("okta.com")) {
            return new OktaOidcTokenVerifier(new OIDCConfig(issuer));
        }
        return new DefaultOidcTokenVerifier(new OIDCConfig(issuer));
    }

    Claims verify(String token) throws IllegalTokenException;
}
