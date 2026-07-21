package com.civicpulse.nexus.scheduler;

import com.civicpulse.nexus.entity.Complaint;
import com.civicpulse.nexus.entity.ComplaintStatus;
import com.civicpulse.nexus.repository.ComplaintRepository;
import com.civicpulse.nexus.service.SlaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import com.civicpulse.nexus.service.EscalationService;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class SlaMonitoringScheduler {

    private final ComplaintRepository complaintRepository;
    private final SlaService slaService;
    private final EscalationService escalationService;

    /**
     * Runs every 30 minutes.
     */
    @Scheduled(fixedRate = 30 * 60 * 1000)
    public void monitorSla() {

        List<Complaint> complaints =
                complaintRepository.findByStatusNotIn(
                        List.of(
                                ComplaintStatus.RESOLVED,
                                ComplaintStatus.REJECTED
                        )
                );

        for (Complaint complaint : complaints) {

            slaService.updateSlaStatus(complaint);

            complaintRepository.save(complaint);
        }

        escalationService.processEscalations();

        log.info("SLA Monitoring completed. Checked {} complaints.", complaints.size());
    }
}