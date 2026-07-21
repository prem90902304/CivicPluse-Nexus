package com.civicpulse.nexus.dto.response;

import com.civicpulse.nexus.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintCommentResponse {

    private Long id;
    private String authorName;
    private Role authorRole;
    private String message;
    private LocalDateTime createdAt;
}