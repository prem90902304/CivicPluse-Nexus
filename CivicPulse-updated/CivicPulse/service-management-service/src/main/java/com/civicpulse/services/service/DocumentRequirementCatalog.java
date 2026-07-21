package com.civicpulse.services.service;

import com.civicpulse.services.entity.DocumentType;
import com.civicpulse.services.entity.ServiceType;

import java.util.List;

public final class DocumentRequirementCatalog {
    private DocumentRequirementCatalog() { }

    public static List<DocumentType> requiredFor(ServiceType serviceType) {
        return switch (serviceType) {
            case BIRTH_CERTIFICATE -> List.of(DocumentType.BIRTH_PROOF, DocumentType.AADHAAR_CARD, DocumentType.ADDRESS_PROOF);
            case DEATH_CERTIFICATE -> List.of(DocumentType.DEATH_PROOF, DocumentType.AADHAAR_CARD);
            case INCOME_CERTIFICATE -> List.of(DocumentType.AADHAAR_CARD, DocumentType.INCOME_PROOF, DocumentType.ADDRESS_PROOF);
            case RESIDENCE_CERTIFICATE -> List.of(DocumentType.AADHAAR_CARD, DocumentType.ADDRESS_PROOF);
            case TRADE_LICENSE -> List.of(DocumentType.AADHAAR_CARD, DocumentType.BUSINESS_REGISTRATION, DocumentType.ADDRESS_PROOF);
            case PERMIT_APPROVAL -> List.of(DocumentType.AADHAAR_CARD, DocumentType.PROPERTY_DOCUMENT, DocumentType.ADDRESS_PROOF);
        };
    }
}
