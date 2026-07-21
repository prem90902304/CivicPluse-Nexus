package com.civicpulse.nexus.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    /**
     * Keycloak Access Token
     */
    private String accessToken;

    /**
     * Keycloak Refresh Token
     */
    private String refreshToken;

    /**
     * Usually "Bearer"
     */
    @Builder.Default
    private String tokenType = "Bearer";

    /**
     * Access Token Expiry (seconds)
     */
    private Long expiresIn;

    /**
     * Refresh Token Expiry (seconds)
     */
    private Long refreshExpiresIn;

    /**
     * Logged in user details
     */
    private UserResponse user;
}