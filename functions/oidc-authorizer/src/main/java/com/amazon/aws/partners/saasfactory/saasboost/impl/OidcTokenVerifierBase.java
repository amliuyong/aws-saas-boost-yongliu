package com.amazon.aws.partners.saasfactory.saasboost.impl;

import com.amazon.aws.partners.saasfactory.saasboost.IllegalTokenException;
import com.amazon.aws.partners.saasfactory.saasboost.OIDCConfig;
import com.amazon.aws.partners.saasfactory.saasboost.TokenVerifier;
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
import java.util.Map;

public class OidcTokenVerifierBase implements TokenVerifier {
    private static final Logger LOGGER = LoggerFactory.getLogger(OidcTokenVerifierBase.class);
    private OIDCConfig config;

    public OidcTokenVerifierBase(OIDCConfig config) {
        this.config = config;
    }

    @Override
    public Claims verify(String token) throws IllegalTokenException {
        if (!token.startsWith("Bearer ")) {
            throw new IllegalTokenException("Token is not Bearer token");
        }
        ObjectMapper objectMapper = new ObjectMapper();
        String jwtToken = token.split(" ")[1];
        String header = jwtToken.split("\\.")[0];
        String headerDecoded = new String(Base64.getDecoder().decode(header));
        LOGGER.info("headerDecoded: {}", headerDecoded);
        String openidConfiguration = config.getOpenIdConfigurationUri();
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
            if (claims.getExpiration().getTime() - config.timeTolerant() <= new Date().getTime()) {
                throw new RuntimeException("token expired");
            }
            verityPermissions(claims);
            return claims;
        } catch (IOException | JwkException e) {
            throw new IllegalTokenException(e);
        }
    }

    protected Map<String, String> getDesiredClaims() {
        return null;
    }

    protected void verityPermissions(Claims claims) throws IllegalTokenException {
        Map<String, String> desiredClaims = getDesiredClaims();
        if (desiredClaims == null) {
            return;
        }
        for (Map.Entry<String, String> entry : desiredClaims.entrySet()) {
            String key = entry.getKey();
            String val = entry.getValue();
            if (claims.get(key) == null || !claims.get(key).toString().contains(val)) {
                LOGGER.info("cannot find/invalid " + key + " in claims");
                throw new IllegalTokenException("cannot find/invalid " + key + " in claims");
            }
        }

    }
}
