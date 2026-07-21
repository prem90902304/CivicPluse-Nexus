package com.civicpulse.services.service;

import com.civicpulse.services.dto.request.VerificationRequest;
import com.civicpulse.services.dto.request.DocumentsRequiredRequest;
import com.civicpulse.services.dto.response.ServiceApplicationResponse;

public interface VerificationService {
    ServiceApplicationResponse verify(Long applicationId, VerificationRequest request);
    ServiceApplicationResponse requestDocuments(Long applicationId, DocumentsRequiredRequest request);
}
