package com.civicpulse.services.repository;

import com.civicpulse.services.entity.ApplicationStatus;
import com.civicpulse.services.entity.ServiceApplication;
import com.civicpulse.services.entity.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ServiceApplicationRepository extends JpaRepository<ServiceApplication, Long> {
    Optional<ServiceApplication> findByApplicationNumber(String applicationNumber);
    List<ServiceApplication> findByCitizenIdOrderByCreatedAtDesc(Long citizenId);
    List<ServiceApplication> findByStatusOrderByCreatedAtAsc(ApplicationStatus status);
    List<ServiceApplication> findByServiceTypeOrderByCreatedAtDesc(ServiceType serviceType);
    boolean existsByApplicantNameIgnoreCaseAndAadhaarNumberAndServiceTypeAndStatusNot(
            String applicantName,
            String aadhaarNumber,
            ServiceType serviceType,
            ApplicationStatus status
    );
}
