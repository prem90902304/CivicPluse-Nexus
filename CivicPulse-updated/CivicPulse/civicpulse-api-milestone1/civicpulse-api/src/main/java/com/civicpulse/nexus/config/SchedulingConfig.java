package com.civicpulse.nexus.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Activates @Scheduled methods — powers the SLA breach/escalation job (Step 7). */
@Configuration
@EnableScheduling
public class SchedulingConfig {
}
