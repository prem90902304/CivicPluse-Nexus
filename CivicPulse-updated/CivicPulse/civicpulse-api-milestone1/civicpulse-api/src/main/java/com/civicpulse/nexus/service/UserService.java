package com.civicpulse.nexus.service;

import com.civicpulse.nexus.dto.request.UpdateProfileRequest;
import com.civicpulse.nexus.dto.response.UserResponse;

public interface UserService {

    UserResponse getCurrentUserProfile(String email);

    UserResponse updateCurrentUserProfile(
            String email,
            UpdateProfileRequest request
    );
}