package com.civicpulse.services.entity;

public enum ServiceType {
    BIRTH_CERTIFICATE("BC"),
    DEATH_CERTIFICATE("DC"),
    INCOME_CERTIFICATE("IC"),
    RESIDENCE_CERTIFICATE("RC"),
    TRADE_LICENSE("TL"),
    PERMIT_APPROVAL("PA");

    private final String certificatePrefix;

    ServiceType(String certificatePrefix) {
        this.certificatePrefix = certificatePrefix;
    }

    public String getCertificatePrefix() {
        return certificatePrefix;
    }
}
