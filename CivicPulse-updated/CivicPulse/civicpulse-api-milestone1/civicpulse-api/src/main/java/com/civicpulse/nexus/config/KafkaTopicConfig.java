package com.civicpulse.nexus.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic complaintCreatedTopic() {
        return new NewTopic("complaint-created", 1, (short) 1);
    }

    @Bean
    public NewTopic complaintAssignedTopic() {
        return new NewTopic("complaint-assigned", 1, (short) 1);
    }

    @Bean
    public NewTopic complaintStatusUpdatedTopic() {
        return new NewTopic("complaint-status-updated", 1, (short) 1);
    }

    @Bean
    public NewTopic complaintEscalatedTopic() {
        return new NewTopic("complaint-escalated", 1, (short) 1);
    }
}