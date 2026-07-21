package com.civicpulse.nexus.controller;

import com.civicpulse.nexus.dto.request.UpdateProfileRequest;
import com.civicpulse.nexus.dto.response.ApiResponse;
import com.civicpulse.nexus.dto.response.UserResponse;
import com.civicpulse.nexus.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMyProfile(
            @AuthenticationPrincipal Jwt jwt) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        userService.getCurrentUserProfile(getEmail(jwt))
                )
        );
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateMyProfile(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UpdateProfileRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Profile updated successfully",
                        userService.updateCurrentUserProfile(
                                getEmail(jwt),
                                request
                        )
                )
        );
    }

    private String getEmail(Jwt jwt) {
        String email = jwt.getClaimAsString("email");

        if (email != null && !email.isBlank()) {
            return email;
        }

        return jwt.getClaimAsString("preferred_username");
    }
}