package com.civicpulse.services;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class ServiceManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(ServiceManagementApplication.class, args);
    }
}
