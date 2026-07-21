package com.civicpulse.nexus.controller;

import com.civicpulse.nexus.dto.response.ApiResponse;
import com.civicpulse.nexus.dto.response.NotificationResponse;
import com.civicpulse.nexus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Get logged-in user's notifications
     */
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMyNotifications() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        notificationService.getMyNotifications()
                )
        );
    }

    /**
     * Mark one notification as read
     */
    @PatchMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long id) {

        notificationService.markAsRead(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Notification marked as read",
                        null
                )
        );
    }

    /**
     * Mark all notifications as read
     */
    @PatchMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {

        notificationService.markAllAsRead();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "All notifications marked as read",
                        null
                )
        );
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {

        return ResponseEntity.ok(
                ApiResponse.success(notificationService.getUnreadCount())
        );
    }
}