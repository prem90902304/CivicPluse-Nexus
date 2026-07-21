package com.civicpulse.services.dto.request;

import com.civicpulse.services.entity.ServiceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplyServiceRequest {
    @NotNull(message = "Citizen id is required")
    private Long citizenId;

    @NotNull(message = "Service type is required")
    private ServiceType serviceType;

    @NotBlank(message = "Applicant name is required")
    @Size(max = 120)
    private String applicantName;

    @NotBlank(message = "Aadhaar number is required")
    @Pattern(regexp = "^[0-9]{12}$", message = "Aadhaar number must contain exactly 12 digits")
    private String aadhaarNumber;
}
