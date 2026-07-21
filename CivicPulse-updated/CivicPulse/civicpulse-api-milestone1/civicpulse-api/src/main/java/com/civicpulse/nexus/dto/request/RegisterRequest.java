package com.civicpulse.nexus.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Citizen self-registration payload. Deliberately does NOT accept a `role`
 * field from the client — role assignment is a server-side decision
 * (self-registration always creates a CITIZEN; OFFICIAL/ADMIN accounts are
 * provisioned separately by an admin) to prevent privilege escalation via
 * a forged request body.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    private String email;

    @Pattern(regexp = "^$|^[0-9+\\-\\s]{7,15}$", message = "Phone number is invalid")
    private String phone;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be at least 8 characters")
    private String password;
}
