package com.civicpulse.nexus.repository;

import com.civicpulse.nexus.entity.Complaint;
import com.civicpulse.nexus.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import com.civicpulse.nexus.entity.ComplaintStatus;
import java.util.List;
import java.util.Optional;
import com.civicpulse.nexus.entity.SlaStatus;



public interface ComplaintRepository extends
        JpaRepository<Complaint, Long>,
        JpaSpecificationExecutor<Complaint> {
    List<Complaint> findByAssignedOfficerId(Long officerId);

    Optional<Complaint> findByComplaintNumber(String complaintNumber);

    List<Complaint> findByCitizen(User citizen);
    List<Complaint> findByStatusNotIn(List<ComplaintStatus> statuses);

    List<Complaint> findBySlaStatus(SlaStatus slaStatus);

    long countByAssignedOfficerIdAndStatusNotIn(
            Long officerId,
            List<ComplaintStatus> statuses
    );

    long countByAssignedOfficerIdAndStatus(
            Long officerId,
            ComplaintStatus status
    );

    long countByAssignedOfficerId(Long officerId);

    long countByDepartmentId(Long departmentId);

    long countByDepartmentIdAndStatus(
            Long departmentId,
            ComplaintStatus status
    );

}