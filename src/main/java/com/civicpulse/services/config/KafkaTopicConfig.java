package com.civicpulse.services.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaTopicConfig {
    @Bean NewTopic applicationSubmittedTopic() { return new NewTopic("application-submitted", 1, (short) 1); }
    @Bean NewTopic documentVerifiedTopic() { return new NewTopic("document-verified", 1, (short) 1); }
    @Bean NewTopic documentsRequiredTopic() { return new NewTopic("documents-required", 1, (short) 1); }
    @Bean NewTopic certificateApprovedTopic() { return new NewTopic("certificate-approved", 1, (short) 1); }
    @Bean NewTopic certificateGeneratedTopic() { return new NewTopic("certificate-generated", 1, (short) 1); }
}
