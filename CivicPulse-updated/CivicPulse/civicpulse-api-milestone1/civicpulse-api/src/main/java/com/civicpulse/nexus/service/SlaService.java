package com.civicpulse.nexus.service;

import com.civicpulse.nexus.entity.Category;
import com.civicpulse.nexus.entity.Complaint;
import com.civicpulse.nexus.entity.SlaStatus;

import java.time.LocalDateTime;

public interface SlaService {

    /**
     * Calculates the SLA deadline based on category SLA hours.
     */
    LocalDateTime calculateDeadline(Category category);

    /**
     * Determines the current SLA status.
     */
    SlaStatus calculateStatus(Complaint complaint);

    /**
     * Returns remaining hours until SLA deadline.
     */
    long getRemainingHours(Complaint complaint);

    /**
     * Checks if SLA has been breached.
     */
    boolean isBreached(Complaint complaint);

    /**
     * Updates the complaint's SLA status.
     */
    void updateSlaStatus(Complaint complaint);
}