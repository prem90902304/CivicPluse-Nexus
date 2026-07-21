package com.civicpulse.nexus.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI civicPulseOpenAPI() {

        return new OpenAPI()

                .info(new Info()
                        .title("CivicPulse Nexus API")
                        .version("1.0.0")
                        .description("Smart Governance and Citizen Services Management Platform")
                        .contact(new Contact()
                                .name("Prem Sai")
                                .email("your-email@example.com"))
                        .license(new License()
                                .name("MIT License")))

                .addSecurityItem(new SecurityRequirement()
                        .addList(SECURITY_SCHEME_NAME))

                .components(new Components()
                        .addSecuritySchemes(
                                SECURITY_SCHEME_NAME,

                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                        ));
    }
}