package com.civicpulse.services.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

/**
 * Authorizes the one municipal officer responsible for certificate and permit
 * applications. The email is read from the authenticated Keycloak JWT, never
 * from a browser request body.
 */
@Component("municipalOfficerAccess")
public class MunicipalOfficerAccess {

    private static final String MUNICIPAL_OFFICER_EMAIL = "officer@civicpulse.com";

    public boolean isMunicipalOfficer(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            return false;
        }

        String email = jwt.getClaimAsString("email");
        if (email == null || email.isBlank()) {
            email = jwt.getClaimAsString("preferred_username");
        }

        return MUNICIPAL_OFFICER_EMAIL.equalsIgnoreCase(email);
    }
}
