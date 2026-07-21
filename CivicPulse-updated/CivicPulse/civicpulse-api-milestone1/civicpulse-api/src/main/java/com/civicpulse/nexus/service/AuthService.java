package com.civicpulse.nexus.service;

import com.civicpulse.nexus.dto.request.LoginRequest;
import com.civicpulse.nexus.dto.request.ForgotPasswordRequest;
import com.civicpulse.nexus.dto.request.RegisterRequest;
import com.civicpulse.nexus.dto.request.ResetPasswordRequest;
import com.civicpulse.nexus.dto.response.AuthResponse;
import com.civicpulse.nexus.dto.response.UserResponse;

public interface AuthService {
    UserResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    void sendPasswordResetOtp(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
}
