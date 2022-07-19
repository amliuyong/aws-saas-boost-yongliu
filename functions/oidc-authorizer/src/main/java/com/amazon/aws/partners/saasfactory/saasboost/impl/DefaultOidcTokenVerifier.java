package com.amazon.aws.partners.saasfactory.saasboost.impl;

import com.amazon.aws.partners.saasfactory.saasboost.OIDCConfig;

import java.util.HashMap;
import java.util.Map;

public class DefaultOidcTokenVerifier extends OidcTokenVerifierBase {
    public DefaultOidcTokenVerifier(OIDCConfig config) {
        super(config);
    }

    @Override
    protected Map<String, String> getDesiredClaims() {
        Map<String, String> desiredClaims = new HashMap<>();
        desiredClaims.put("scope", "saas-boost:admin");
        return desiredClaims;
    }
}
