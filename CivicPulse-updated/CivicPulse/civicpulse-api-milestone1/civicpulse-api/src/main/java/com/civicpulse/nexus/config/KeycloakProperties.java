package com.civicpulse.nexus.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "keycloak")
public class KeycloakProperties {

    private String serverUrl;
    private String realm;

    private Admin admin = new Admin();
    private Client client = new Client();

    @Data
    public static class Admin {

        private String realm;
        private String clientId;
        private String username;
        private String password;

    }

    @Data
    public static class Client {

        private String clientId;
        private String clientSecret;

    }

}