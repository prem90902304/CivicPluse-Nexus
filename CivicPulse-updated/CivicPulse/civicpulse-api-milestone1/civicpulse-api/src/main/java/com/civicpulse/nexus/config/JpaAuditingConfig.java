package com.civicpulse.nexus.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/** Activates @CreatedDate/@LastModifiedDate handling used by BaseEntity. */
@Configuration
@EnableJpaAuditing
public class JpaAuditingConfig {
}
