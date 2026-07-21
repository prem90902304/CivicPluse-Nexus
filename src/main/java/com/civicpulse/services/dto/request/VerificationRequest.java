package com.civicpulse.services.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerificationRequest {
    @NotNull(message = "Officer id is required")
    private Long officerId;
    private boolean verified;
}
