package com.civicpulse.services.service;

import com.civicpulse.services.dto.response.ServiceApplicationResponse;

public interface CertificateService {
    ServiceApplicationResponse generate(Long applicationId);
    ServiceApplicationResponse recordDownload(Long applicationId);
}
