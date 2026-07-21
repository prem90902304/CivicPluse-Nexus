package com.civicpulse.nexus.service.impl;


import com.civicpulse.nexus.config.KeycloakProperties;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientResponseException;
import java.util.Map;
import com.civicpulse.nexus.dto.request.LoginRequest;
import com.civicpulse.nexus.dto.request.RegisterRequest;
import com.civicpulse.nexus.dto.response.AuthResponse;
import com.civicpulse.nexus.dto.response.UserResponse;
import com.civicpulse.nexus.entity.Role;
import com.civicpulse.nexus.entity.User;
import com.civicpulse.nexus.exception.DuplicateResourceException;
import com.civicpulse.nexus.exception.AccountDeactivatedException;
import com.civicpulse.nexus.mapper.UserMapper;
import com.civicpulse.nexus.repository.UserRepository;
import com.civicpulse.nexus.service.AuthService;
import com.civicpulse.nexus.service.KeycloakService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import com.civicpulse.nexus.dto.request.ForgotPasswordRequest;
import com.civicpulse.nexus.dto.request.ResetPasswordRequest;
import com.civicpulse.nexus.entity.PasswordResetOtp;
import com.civicpulse.nexus.repository.PasswordResetOtpRepository;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final KeycloakService keycloakService;
    private final RestTemplate restTemplate;
    private final KeycloakProperties keycloakProperties;
    private final PasswordResetOtpRepository passwordResetOtpRepository;
    private final JavaMailSender mailSender;

    private static final SecureRandom OTP_RANDOM = new SecureRandom();

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateResourceException(
                    "An account with this email already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(email)
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.CITIZEN)
                .enabled(true)
                .build();

        try {
            // 1. Create user in Keycloak
            keycloakService.createUser(user, request.getPassword());

            // 2. Assign CITIZEN role in Keycloak
            keycloakService.assignRealmRole(
                    user.getEmail(),
                    Role.CITIZEN
            );
        } catch (RuntimeException ex) {
            String message = ex.getMessage() == null ? "" : ex.getMessage();
            if (message.contains("409")
                    || message.toLowerCase().contains("already exists")
                    || message.toLowerCase().contains("user exists")) {
                throw new DuplicateResourceException("An account with this email already exists");
            }
            throw ex;
        }

        // 3. Save user in PostgreSQL
        User saved = userRepository.save(user);

        return userMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {

        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!user.isEnabled()) {
            throw new AccountDeactivatedException();
        }

        String tokenUrl =
                keycloakProperties.getServerUrl()
                        + "/realms/"
                        + keycloakProperties.getRealm()
                        + "/protocol/openid-connect/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();

        form.add("grant_type", "password");
        form.add("client_id",
                keycloakProperties.getClient().getClientId());

        form.add("client_secret",
                keycloakProperties.getClient().getClientSecret());

        form.add("username", email);

        form.add("password", request.getPassword());

        HttpEntity<MultiValueMap<String, String>> entity =
                new HttpEntity<>(form, headers);

        try {
            return requestKeycloakToken(tokenUrl, entity, user);
        } catch (RestClientResponseException ex) {
            // Keycloak uses 400/401 for an invalid password or unknown account.
            // The API contract intentionally exposes the same safe message for both.
            if (ex.getStatusCode().is4xxClientError()) {
                // Older accounts can have a valid PostgreSQL password but an out-of-sync
                // Keycloak credential. Heal that mismatch only after the BCrypt check.
                if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                    try {
                        keycloakService.resetPassword(email, request.getPassword());
                        return requestKeycloakToken(tokenUrl, entity, user);
                    } catch (RestClientResponseException retryEx) {
                        if (!retryEx.getStatusCode().is4xxClientError()) {
                            throw new RuntimeException("Unable to sign in at the moment", retryEx);
                        }
                    } catch (RuntimeException syncEx) {
                        throw new RuntimeException("Unable to synchronise the account login", syncEx);
                    }
                }
                throw new BadCredentialsException("Invalid email or password", ex);
            }
            throw new RuntimeException("Unable to sign in at the moment", ex);
        }

    }

    @Override
    @Transactional
    public void sendPasswordResetOtp(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("No account was found with this email"));

        String otp = String.format("%06d", OTP_RANDOM.nextInt(1_000_000));
        PasswordResetOtp resetOtp = passwordResetOtpRepository.findByEmail(email)
                .orElseGet(PasswordResetOtp::new);
        resetOtp.setEmail(email);
        resetOtp.setOtpHash(passwordEncoder.encode(otp));
        resetOtp.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        resetOtp.setAttempts(0);
        passwordResetOtpRepository.save(resetOtp);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("CivicPulse Nexus password reset OTP");
        message.setText("Your CivicPulse Nexus password reset OTP is: " + otp
                + "\n\nIt expires in 10 minutes. Do not share this OTP with anyone.");
        mailSender.send(message);
    }

    @SuppressWarnings("unchecked")
    private AuthResponse requestKeycloakToken(
            String tokenUrl,
            HttpEntity<MultiValueMap<String, String>> entity,
            User user) {

        ResponseEntity<Map> response = restTemplate.exchange(
                tokenUrl,
                HttpMethod.POST,
                entity,
                Map.class);

        Map<String, Object> token = response.getBody();
        if (token == null || token.get("access_token") == null) {
            throw new RuntimeException("Keycloak did not return an access token");
        }

        return AuthResponse.builder()
                .accessToken(token.get("access_token").toString())
                .refreshToken(token.get("refresh_token").toString())
                .tokenType(token.get("token_type").toString())
                .expiresIn(((Number) token.get("expires_in")).longValue())
                .refreshExpiresIn(((Number) token.get("refresh_expires_in")).longValue())
                .user(userMapper.toResponse(user))
                .build();
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("No account was found with this email"));
        PasswordResetOtp resetOtp = passwordResetOtpRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Request a new OTP before resetting your password"));

        if (resetOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            passwordResetOtpRepository.delete(resetOtp);
            throw new IllegalArgumentException("OTP has expired. Request a new OTP");
        }
        if (resetOtp.getAttempts() >= 5) {
            passwordResetOtpRepository.delete(resetOtp);
            throw new IllegalArgumentException("Too many invalid OTP attempts. Request a new OTP");
        }
        if (!passwordEncoder.matches(request.getOtp(), resetOtp.getOtpHash())) {
            resetOtp.setAttempts(resetOtp.getAttempts() + 1);
            passwordResetOtpRepository.save(resetOtp);
            throw new IllegalArgumentException("Invalid OTP");
        }

        keycloakService.resetPassword(user.getEmail(), request.getNewPassword());
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        passwordResetOtpRepository.delete(resetOtp);
    }
}
