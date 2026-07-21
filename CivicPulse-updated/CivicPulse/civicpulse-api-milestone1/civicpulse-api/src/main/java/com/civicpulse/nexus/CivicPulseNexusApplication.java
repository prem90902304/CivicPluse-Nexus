package com.civicpulse.nexus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Entry point and composition root of the CivicPulse Nexus backend.
 *
 * @SpringBootApplication bundles three annotations:
 *   - @Configuration          : marks this class as a source of bean definitions
 *   - @EnableAutoConfiguration: auto-configures beans based on classpath contents
 *                               (e.g. detecting PostgreSQL + Spring Data JPA and
 *                               wiring a DataSource + EntityManagerFactory automatically)
 *   - @ComponentScan          : scans this package and all sub-packages for
 *                               @Component / @Service / @Repository / @Controller
 *                               beans and registers them in the Spring context
 *
 * Placement matters: this class lives at com.civicpulse.nexus, the common root
 * of every layer (controller, service, repository, entity, etc.). If it were
 * placed anywhere else, component scanning would miss sibling packages and
 * beans in those layers would silently fail to register.
 */
@SpringBootApplication
@EnableScheduling
public class CivicPulseNexusApplication {

    public static void main(String[] args) {
        SpringApplication.run(CivicPulseNexusApplication.class, args);
    }

}
