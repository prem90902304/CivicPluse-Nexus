package com.civicpulse.nexus.service;

import com.civicpulse.nexus.dto.response.NotificationResponse;

import java.util.List;

public interface NotificationService {

    void createNotification(
            String recipientEmail,
            String title,
            String message);

    List<NotificationResponse> getMyNotifications();

    void markAsRead(Long id);

    void markAllAsRead();

    long getUnreadCount();

}