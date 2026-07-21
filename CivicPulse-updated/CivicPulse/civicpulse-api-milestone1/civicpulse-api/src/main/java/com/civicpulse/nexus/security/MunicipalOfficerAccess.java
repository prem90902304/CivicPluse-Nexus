package com.civicpulse.nexus.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

/** Grants complaint-management authority only to the designated Municipal Officer. */
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
