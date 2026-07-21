package com.civicpulse.nexus.consumer;

/**
 * Complaint notification listeners are centralised in {@link NotificationConsumer}.
 *
 * This class is intentionally retained as a compatibility placeholder because it was
 * previously discovered by Spring as a second Kafka consumer.  That caused each
 * complaint-assignment and complaint-status event to create duplicate notifications.
 */
public final class KafkaEventConsumer {

    private KafkaEventConsumer() {
        // Utility class: no Kafka listeners belong here.
    }
}
