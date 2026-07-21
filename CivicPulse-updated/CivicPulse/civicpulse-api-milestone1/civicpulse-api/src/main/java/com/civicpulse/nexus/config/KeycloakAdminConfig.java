package com.civicpulse.nexus.config;

import lombok.RequiredArgsConstructor;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class KeycloakAdminConfig {

    private final KeycloakProperties properties;

    @Bean
    public Keycloak keycloak() {

        return KeycloakBuilder.builder()
                .serverUrl(properties.getServerUrl())
                .realm(properties.getAdmin().getRealm())
                .clientId(properties.getAdmin().getClientId())
                .username(properties.getAdmin().getUsername())
                .password(properties.getAdmin().getPassword())
                .grantType(OAuth2Constants.PASSWORD)
                .build();
    }
}