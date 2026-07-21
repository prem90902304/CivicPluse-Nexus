package com.civicpulse.nexus.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreateOfficerRequest {

    @NotBlank(message = "Officer name is required")
    @Size(min = 2, max = 100)
    private String fullName;

    @NotBlank(message = "Officer email is required")
    @Email(message = "Email must be valid")
    private String email;

    @Pattern(regexp = "^$|^[0-9+\\-\\s]{7,15}$", message = "Phone number is invalid")
    private String phone;

    @NotNull(message = "Department is required")
    private Long departmentId;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100)
    private String password;
}