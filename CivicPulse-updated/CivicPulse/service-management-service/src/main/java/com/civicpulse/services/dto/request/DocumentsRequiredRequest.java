package com.civicpulse.services.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DocumentsRequiredRequest {
    @NotNull(message = "Officer id is required")
    private Long officerId;

    @NotBlank(message = "Please enter the documents required message")
    private String message;
}
