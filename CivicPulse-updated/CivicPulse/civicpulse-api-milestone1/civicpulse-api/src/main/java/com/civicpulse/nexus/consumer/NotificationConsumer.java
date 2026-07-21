package com.civicpulse.nexus.consumer;

import com.civicpulse.nexus.event.ComplaintAssignedEvent;
import com.civicpulse.nexus.event.ComplaintCreatedEvent;
import com.civicpulse.nexus.event.ComplaintEscalatedEvent;
import com.civicpulse.nexus.event.ComplaintStatusUpdatedEvent;
import com.civicpulse.nexus.service.NotificationService;
import com.civicpulse.nexus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @KafkaListener(topics = "complaint-created", groupId = "notification-group")
    public void handleComplaintCreated(ComplaintCreatedEvent event) {
        notificationService.createNotification(
                event.getCitizenEmail(),
                "Complaint Submitted",
                "Your complaint " + event.getComplaintNumber()
                        + " has been submitted successfully."
        );
    }

    @KafkaListener(topics = "complaint-assigned", groupId = "notification-group")
    public void handleComplaintAssigned(ComplaintAssignedEvent event) {

        notificationService.createNotification(
                event.getOfficerEmail(),
                "Complaint Assigned",
                "Complaint " + event.getComplaintNumber()
                        + " has been assigned to you."
        );

        notificationService.createNotification(
                event.getCitizenEmail(),
                "Complaint Assigned",
                "Your complaint " + event.getComplaintNumber()
                        + " has been assigned to an officer."
        );

        log.info("Assignment notifications created for complaint {}",
                event.getComplaintNumber());
    }

    @KafkaListener(topics = "complaint-status-updated", groupId = "notification-group")
    public void handleStatusUpdated(ComplaintStatusUpdatedEvent event) {

        String formattedStatus = event.getStatus()
                .name()
                .replace("_", " ");

        notificationService.createNotification(
                event.getCitizenEmail(),
                "Complaint Status Updated",
                "Your complaint " + event.getComplaintNumber()
                        + " status has been updated to " + formattedStatus + "."
        );

        log.info("Status update notification created for complaint {}",
                event.getComplaintNumber());
    }

    @KafkaListener(topics = "complaint-escalated", groupId = "notification-group")
    public void handleEscalated(ComplaintEscalatedEvent event) {

        notificationService.createNotification(
                event.getCitizenEmail(),
                "Complaint Escalated",
                "Your complaint " + event.getComplaintNumber()
                        + " has been escalated because its resolution deadline was breached."
        );

        log.info("Escalation notification created for complaint {}",
                event.getComplaintNumber());
    }

    @KafkaListener(topics = "application-submitted", groupId = "notification-group", containerFactory = "serviceNotificationKafkaListenerContainerFactory")
    public void handleApplicationSubmitted(Map<String, Object> event) {
        notifyCitizen(
                event,
                "Service Application Submitted",
                "Your service application " + event.get("applicationNumber")
                        + " has been submitted successfully."
        );
    }

    @KafkaListener(topics = "document-verified", groupId = "notification-group", containerFactory = "serviceNotificationKafkaListenerContainerFactory")
    public void handleDocumentVerified(Map<String, Object> event) {
        notifyCitizen(
                event,
                "Documents Verified",
                "Documents for your application " + event.get("applicationNumber")
                        + " have been verified by the municipal officer."
        );
    }

    @KafkaListener(topics = "documents-required", groupId = "notification-group", containerFactory = "serviceNotificationKafkaListenerContainerFactory")
    public void handleDocumentsRequired(Map<String, Object> event) {
        String officerMessage = String.valueOf(event.getOrDefault("message", "Please upload the required supporting documents."));
        notifyCitizen(
                event,
                "Additional Documents Required",
                "For application " + event.get("applicationNumber") + ": " + officerMessage
        );
    }

    @KafkaListener(topics = "certificate-approved", groupId = "notification-group", containerFactory = "serviceNotificationKafkaListenerContainerFactory")
    public void handleCertificateApproved(Map<String, Object> event) {
        notifyCitizen(
                event,
                "Application Approved",
                "Your application " + event.get("applicationNumber")
                        + " has been approved. Your certificate will be generated shortly."
        );
    }

    @KafkaListener(topics = "certificate-generated", groupId = "notification-group", containerFactory = "serviceNotificationKafkaListenerContainerFactory")
    public void handleCertificateGenerated(Map<String, Object> event) {
        notifyCitizen(
                event,
                "Certificate Generated",
                "Your certificate " + event.get("certificateNumber")
                        + " is ready for download."
        );
    }

    private void notifyCitizen(Map<String, Object> event, String title, String message) {
        Object citizenIdValue = event.get("citizenId");
        if (!(citizenIdValue instanceof Number citizenId)) {
            log.warn("Service event does not contain a valid citizen id: {}", event);
            return;
        }
        userRepository.findById(citizenId.longValue()).ifPresentOrElse(
                user -> notificationService.createNotification(user.getEmail(), title, message),
                () -> log.warn("Citizen {} was not found for service notification", citizenId)
        );
    }

}
