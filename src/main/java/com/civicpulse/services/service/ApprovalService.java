package com.civicpulse.services.service;

import com.civicpulse.services.dto.request.RejectionRequest;
import com.civicpulse.services.dto.request.VerificationRequest;
import com.civicpulse.services.dto.response.ServiceApplicationResponse;

public interface ApprovalService {
    ServiceApplicationResponse approve(Long applicationId, VerificationRequest request);
    ServiceApplicationResponse reject(Long applicationId, RejectionRequest request);
}
