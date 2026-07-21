package com.civicpulse.nexus.service.impl;

import com.civicpulse.nexus.dto.response.NotificationResponse;
import com.civicpulse.nexus.entity.Notification;
import com.civicpulse.nexus.entity.User;
import com.civicpulse.nexus.exception.ResourceNotFoundException;
import com.civicpulse.nexus.mapper.NotificationMapper;
import com.civicpulse.nexus.repository.NotificationRepository;
import com.civicpulse.nexus.repository.UserRepository;
import com.civicpulse.nexus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final UserRepository userRepository;

    @Override
    public void createNotification(
            String recipientEmail,
            String title,
            String message) {

        Notification notification = Notification.builder()
                .recipientEmail(recipientEmail)
                .title(title)
                .message(message)
                .build();

        notificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications() {

        User user = getCurrentUser();

        return notificationRepository
                .findByRecipientEmailOrderByCreatedAtDesc(user.getEmail())
                .stream()
                .map(notificationMapper::toResponse)
                .toList();
    }

    @Override
    public void markAsRead(Long id) {

        User user = getCurrentUser();

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Notification not found"));

        if (!notification.getRecipientEmail().equals(user.getEmail())) {
            throw new ResourceNotFoundException("Notification not found");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead() {

        User user = getCurrentUser();

        List<Notification> notifications =
                notificationRepository
                        .findByRecipientEmailOrderByCreatedAtDesc(user.getEmail());

        notifications.forEach(notification -> notification.setRead(true));

        notificationRepository.saveAll(notifications);
    }

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (!(authentication instanceof JwtAuthenticationToken jwtAuthentication)) {
            throw new ResourceNotFoundException("Invalid authentication");
        }

        Jwt jwt = jwtAuthentication.getToken();

        String email = jwt.getClaimAsString("email");

        if (email == null || email.isBlank()) {
            email = jwt.getClaimAsString("preferred_username");
        }

        final String userEmail = email;

        return userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found: " + userEmail));
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        return notificationRepository.countByRecipientEmailAndReadFalse(
                getCurrentUser().getEmail()
        );
    }
}