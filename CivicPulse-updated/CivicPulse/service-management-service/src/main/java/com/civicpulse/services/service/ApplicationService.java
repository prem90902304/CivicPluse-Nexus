package com.civicpulse.services.service;

import com.civicpulse.services.dto.request.ApplyServiceRequest;
import com.civicpulse.services.dto.response.ServiceApplicationResponse;
import com.civicpulse.services.entity.ApplicationStatus;
import com.civicpulse.services.entity.ServiceType;

import java.util.List;

public interface ApplicationService {
    ServiceApplicationResponse apply(ApplyServiceRequest request);
    ServiceApplicationResponse getById(Long applicationId);
    List<ServiceApplicationResponse> getByCitizenId(Long citizenId);
    List<ServiceApplicationResponse> getAll();
    List<ServiceApplicationResponse> getByStatus(ApplicationStatus status);
    List<ServiceApplicationResponse> getByServiceType(ServiceType serviceType);
    void deleteRejected(Long applicationId);
}
