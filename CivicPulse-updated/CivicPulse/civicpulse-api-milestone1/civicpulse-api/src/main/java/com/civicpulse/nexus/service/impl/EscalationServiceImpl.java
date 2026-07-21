package com.civicpulse.nexus.service.impl;

import com.civicpulse.nexus.entity.Complaint;
import com.civicpulse.nexus.entity.ComplaintStatus;
import com.civicpulse.nexus.entity.SlaStatus;
import com.civicpulse.nexus.repository.ComplaintRepository;
import com.civicpulse.nexus.service.ComplaintTimelineService;
import com.civicpulse.nexus.service.EscalationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.civicpulse.nexus.event.ComplaintEscalatedEvent;
import com.civicpulse.nexus.kafka.KafkaEventProducer;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EscalationServiceImpl implements EscalationService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintTimelineService complaintTimelineService;
    private final KafkaEventProducer kafkaEventProducer;

    @Override
    public void processEscalations() {

        List<Complaint> complaints =
                complaintRepository.findBySlaStatus(SlaStatus.BREACHED);

        for (Complaint complaint : complaints) {

            if (complaint.getStatus() == ComplaintStatus.RESOLVED
                    || complaint.getStatus() == ComplaintStatus.REJECTED
                    || complaint.getStatus() == ComplaintStatus.CLOSED
                    || complaint.getStatus() == ComplaintStatus.ESCALATED) {
                continue;
            }

            LocalDateTime escalatedAt = LocalDateTime.now();

            complaint.setStatus(ComplaintStatus.ESCALATED);
            complaint.setUpdatedAt(escalatedAt);

            complaintRepository.save(complaint);

            kafkaEventProducer.publish(
                    "complaint-escalated",
                    ComplaintEscalatedEvent.builder()
                            .complaintId(complaint.getId())
                            .complaintNumber(complaint.getComplaintNumber())
                            .citizenEmail(complaint.getCitizen().getEmail())
                            .escalatedAt(escalatedAt)
                            .build()
            );

            complaintTimelineService.record(
                    complaint,
                    "SYSTEM",
                    "Complaint automatically escalated because SLA was breached."
            );
        }
    }
}