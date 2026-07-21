package com.civicpulse.nexus.repository;

import com.civicpulse.nexus.entity.EscalationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface EscalationLogRepository extends JpaRepository<EscalationLog, Long> {
    List<EscalationLog> findByComplaintId(Long complaintId);

    @Transactional
    void deleteByComplaintId(Long complaintId);
}
