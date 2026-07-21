package com.civicpulse.services.service;

import com.civicpulse.services.dto.response.ServiceApplicationResponse;
import com.civicpulse.services.entity.DocumentType;
import org.springframework.web.multipart.MultipartFile;

public interface DocumentService {
    ServiceApplicationResponse upload(Long applicationId, MultipartFile file, DocumentType documentType);
}
