package com.civicpulse.services.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RejectionRequest {
    @NotNull(message = "Officer id is required")
    private Long officerId;
    @NotBlank(message = "Rejection reason is required")
    private String reason;
}
