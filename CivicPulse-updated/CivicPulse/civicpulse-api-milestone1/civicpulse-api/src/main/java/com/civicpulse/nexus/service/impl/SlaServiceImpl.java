package com.civicpulse.nexus.service.impl;

import com.civicpulse.nexus.entity.Category;
import com.civicpulse.nexus.entity.Complaint;
import com.civicpulse.nexus.entity.ComplaintStatus;
import com.civicpulse.nexus.entity.SlaStatus;
import com.civicpulse.nexus.service.SlaService;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class SlaServiceImpl implements SlaService {

    /**
     * Calculate SLA deadline from category SLA hours.
     */
    @Override
    public LocalDateTime calculateDeadline(Category category) {

        if (category == null || category.getSlaHours() == null) {
            return null;
        }

        return LocalDateTime.now().plusHours(category.getSlaHours());
    }

    /**
     * Calculate current SLA status.
     */
    @Override
    public SlaStatus calculateStatus(Complaint complaint) {

        if (complaint.getDeadline() == null) {
            return SlaStatus.ON_TIME;
        }

        // Closed complaints are no longer evaluated
        if (complaint.getStatus() == ComplaintStatus.RESOLVED
                || complaint.getStatus() == ComplaintStatus.REJECTED
                || complaint.getStatus() == ComplaintStatus.CLOSED
                || complaint.getStatus() == ComplaintStatus.ESCALATED) {
            return complaint.getSlaStatus();
        }

        LocalDateTime now = LocalDateTime.now();

        if (now.isAfter(complaint.getDeadline())) {
            return SlaStatus.BREACHED;
        }

        long remainingHours = Duration.between(now, complaint.getDeadline()).toHours();

        // Within last 6 hours before breach
        if (remainingHours <= 6) {
            return SlaStatus.NEAR_BREACH;
        }

        return SlaStatus.ON_TIME;
    }

    /**
     * Remaining SLA time.
     */
    @Override
    public long getRemainingHours(Complaint complaint) {

        if (complaint.getDeadline() == null) {
            return 0;
        }

        return Duration.between(
                LocalDateTime.now(),
                complaint.getDeadline()
        ).toHours();
    }

    @Override
    public boolean isBreached(Complaint complaint) {

        if (complaint.getStatus() == ComplaintStatus.RESOLVED
                || complaint.getStatus() == ComplaintStatus.REJECTED
                || complaint.getStatus() == ComplaintStatus.CLOSED
                || complaint.getStatus() == ComplaintStatus.ESCALATED) {
            return false;
        }

        return complaint.getDeadline() != null
                && LocalDateTime.now().isAfter(complaint.getDeadline());
    }

    @Override
    public void updateSlaStatus(Complaint complaint) {

        complaint.setSlaStatus(calculateStatus(complaint));
    }
}